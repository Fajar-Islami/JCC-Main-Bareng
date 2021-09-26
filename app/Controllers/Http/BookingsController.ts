import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

import BookingValidator from "App/Validators/BookingValidator";
import Booking from "App/Models/Booking";
import Field from "App/Models/Field";

import Database from "@ioc:Adonis/Lucid/Database";
import User from "App/Models/User";

export default class BookingsController {
  /**
   *
   * @swagger
   * /api/v1/bookings:
   *  get:
   *    summary: Menampilkan list booking semuanya
   *    description: Dapat filter berdasarkan user id dan field id
   *    security:
   *      - bearerAuth: []
   *    tags:
   *      - Booking
   *    parameters:
   *       - in: query
   *         name : userId
   *         required : false
   *         schema :
   *          type: number
   *          minimum: 1
   *         description: Optional !! ID dari user yang melakukan booking
   *       - in: query
   *         name : fieldId
   *         required : false
   *         schema :
   *            type: string
   *            minimum: 1
   *         description: Optional !! ID dari field yang dibooking
   *    responses:
   *       200:
   *         description: Data Booking didapat
   *         content:
   *            application/json:
   *                example:
   *                   msg: "Data booking ditemukan"
   *                   data:
   *                    - id: 1
   *                      keterangan: "main futsal"
   *                      user_id: 1
   *                      field_id: 1
   *                      play_date_start: "2021-09-26T09:00:00.000+07:00"
   *                      play_date_end: "2021-09-26T19:00:00.000+07:00"
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   */

  public async index({ request, response }: HttpContextContract) {
    let data = {};

    if (request.qs().userId && request.qs().fieldId) {
      data = await Booking.query()
        .where("user_id", request.qs().userId)
        .where("field_id", request.qs().fieldId);
    } else if (request.qs().userId) {
      data = await Booking.query().where("user_id", request.qs().userId);
    } else if (request.qs().fieldId) {
      data = await Booking.query().where("field_id", request.qs().fieldId);
    } else {
      data = await Booking.all();
    }

    return response.ok({ msg: "Data booking ditemukan", data });
  }

  /**
   *
   * @swagger
   * /api/v1/bookings/{id}:
   *  get:
   *    summary: Menampilkan data booking berdasarkan id
   *    description: Menampilkan detail booking dengan id tertentu beseta list pemain yang sudah mendaftar
   *    security:
   *      - bearerAuth: []
   *    tags:
   *      - Booking
   *    parameters:
   *       - in: path
   *         name : id
   *         required : true
   *         schema :
   *          type: number
   *          minimum: 1
   *         description: Masukan id booking
   *    responses:
   *       200:
   *         description: Data Booking didapat
   *         content:
   *            application/json:
   *                example:
   *                   msg: "Data booking ditemukan"
   *                   data:
   *                      id: 1
   *                      keterangan: "main futsal"
   *                      user_id: 1
   *                      field_id: 1
   *                      play_date_start: "2021-09-26T09:00:00.000+07:00"
   *                      play_date_end: "2021-09-26T19:00:00.000+07:00"
   *                      players_count: 1
   *                      players:
   *                        - id: 1
   *                          name: "Fajar"
   *                          email: "fajar@mail.com"
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   */
  public async show({ params, response }: HttpContextContract) {
    try {
      let data = await Booking.query()
        .where("id", params.id)
        .preload("players", (dtlPlayer) => {
          dtlPlayer.select("id", "name", "email");
        })
        .withCount("players")
        .firstOrFail();

      return response.ok({ msg: "Data ada", data });
    } catch (error) {
      return response.notFound({
        msg: "Data tidak ada",
        error: error.messages ? error.messages.errors : error.message || error,
      });
    }
  }

  /**
   *
   * @swagger
   * /api/v1/venue/{venue_id}/bookings:
   *  post:
   *    summary: Menambahkan jadwal booking baru
   *    description: Membuat jadwal booking di venue untuk tanggal tertentu. Hanya Pengguna User yang memiliki akses !!
   *    security:
   *      - bearerAuth: []
   *    tags:
   *      - Booking
   *    parameters:
   *       - in: path
   *         name : venue_id
   *         required : true
   *         schema :
   *            type: number
   *            minimum: 1
   *         description: ID dari venue field yang akan di booking
   *    requestBody:
   *      required : true
   *      content :
   *        application/x-www-form-urlencoded:
   *          schema:
   *            $ref: '#definitions/Booking'
   *        application/json:
   *          schema:
   *            $ref: '#definitions/Booking'
   *    responses:
   *       201:
   *         $ref: '#/components/responses/CreatedData'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       404:
   *         $ref: '#/components/responses/VenueNotFound'
   *       422:
   *         description: Gagal menambahkan jadwal booking
   *         content:
   *            application/json:
   *              example:
   *                 msg: "Gagal menyimpan data field"
   *                 error:
   *                    - rule: "required"
   *                      field: "keterangan"
   *                      message: "Harap isi field keterangan"
   *                    - rule: "date.format"
   *                      field: "play_date_start"
   *                      message: "Format waktu adalah yyyy-MM-ddTHH:mm:ss"
   */
  public async create({
    params,
    request,
    response,
    auth,
  }: HttpContextContract) {
    let { venue_id } = params;

    try {
      // 1 validasi input
      await request.validate(BookingValidator);

      // 2 cari field
      const fieldId = request.input("fieldId");
      const findField = await Field.query()
        .where("id", fieldId)
        .where("venue_id", venue_id)
        .first();

      if (!findField) {
        return response.notFound({
          msg: "Field atau venue yang didaftarkan tidak ada",
        });
      }

      // 3 cek apakah booking sudah ada
      const play_date_start = request.input("play_date_start");
      const play_date_end = request.input("play_date_end");
      const keterangan = request.input("keterangan");

      let dataBooking = await Booking.query()
        .where("play_date_start", play_date_start)
        .where("play_date_end", play_date_end)
        .where("fieldId", fieldId)
        .first();

      if (dataBooking) {
        return response.unprocessableEntity({
          msg: "Sudah ada booking pada jadwal ini",
        });
      }

      // 4 get data user login
      const user = auth.user!;

      // 5 inisiasi data
      let newBooking = new Booking();
      newBooking.play_date_start = play_date_start;
      newBooking.play_date_end = play_date_end;
      newBooking.keterangan = keterangan;
      newBooking.fieldId = fieldId;

      // 6 save data dengan berelasi
      await newBooking.related("namaField").associate(findField);
      await newBooking.related("bookingUser").associate(user);

      return response.created({ message: "berhasil booking" });
    } catch (error) {
      return response.unprocessableEntity({
        msg: "Gagal menyimpan data field",
        error: error.messages ? error.messages.errors : error.message || error,
      });
    }
  }

  /**
   *
   * @swagger
   * /api/v1/bookings/{id}/join:
   *  put:
   *    summary: Mendaftarkan pada jawal booking
   *    description: User yang sedang login mendaftarkan diri untuk jadwal booking tertentu
   *    security:
   *      - bearerAuth: []
   *    tags:
   *      - Booking
   *    parameters:
   *       - in: path
   *         name : id
   *         required : true
   *         schema :
   *          type: number
   *          minimum: 1
   *         description: Masukan id booking
   *    responses:
   *       201:
   *         description: Data Booking didapat
   *         content:
   *            application/json:
   *                example:
   *                 msg: "Berhasil mendaftar pada booking ini"
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       422:
   *         description: Gagal ikut booking
   *         content:
   *            application/json:
   *              example:
   *                 msg: "Anda sudah terdaftar pada booking ini"
   */
  public async join({ response, params, auth }: HttpContextContract) {
    let { id } = params;
    let user = auth.user!;
    try {
      // 1. Cari booking
      let findBooking = await Booking.query().where("id", id).first();

      // 2. Validasi
      if (!findBooking) {
        return response.notFound({ msg: "Data booking tidak ditemukan" });
      }

      // 3. Cari apakah sudah terdaftar
      let findSchedules = await Database.from("schedules")
        .where("booking_id", id)
        .where("user_id", user.id);

      // Cek hasil pencarian
      if (findSchedules.length == 0) {
        await findBooking.related("players").attach([user.id]);

        return response.created({
          msg: "Berhasil mendaftar pada jadwal booking ini",
        });
      } else {
        return response.unprocessableEntity({
          msg: "Anda sudah terdaftar pada jadwal booking ini",
        });
      }
    } catch (error) {
      return response.unprocessableEntity({
        msg: "Gagal menyimpan data",
        error: error.messages ? error.messages.errors : error.message || error,
      });
    }
  }

  /**
   *
   * @swagger
   * /api/v1/bookings/{id}/unjoin:
   *  put:
   *    summary: Membatalkan pendaftaran jawal booking
   *    description: User yang sedang login membatalkan jadwal booking tertentu
   *    security:
   *      - bearerAuth: []
   *    tags:
   *      - Booking
   *    parameters:
   *       - in: path
   *         name : id
   *         required : true
   *         schema :
   *          type: number
   *          minimum: 1
   *         description: Masukan id booking
   *    responses:
   *       201:
   *         description: Data Booking didapat
   *         content:
   *            application/json:
   *                example:
   *                 msg: "Berhasil batal daftar pada booking ini"
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       422:
   *         description: Gagal ikut booking
   *         content:
   *            application/json:
   *              example:
   *                 msg: "Anda tidak terdaftar pada booking ini"
   */
  public async unjoin({ auth, response, params }: HttpContextContract) {
    try {
      let { id } = params;
      let user = auth.user!;

      // 1. Cari booking
      let findBooking = await Booking.query().where("id", id).first();

      // 2. Validasi
      if (!findBooking) {
        return response.notFound({ msg: "Data booking tidak ditemukan" });
      }

      // 3. Cari apakah sudah terdaftar
      let findSchedules = await Database.from("schedules")
        .where("booking_id", id)
        .where("user_id", user.id);

      // Cek hasil pencarian
      if (findSchedules.length > 0) {
        await findBooking.related("players").detach([user.id]);

        return response.created({
          msg: "Berhasil batal daftar pada booking ini",
        });
      } else {
        return response.unprocessableEntity({
          msg: "Anda tidak terdaftar pada booking ini",
        });
      }
    } catch (error) {
      return response.unprocessableEntity({
        msg: "Gagal menyimpan data",
        error: error.messages ? error.messages.errors : error.message || error,
      });
    }
  }

  /**
   *
   * @swagger
   * /api/v1/schedules:
   *  get:
   *    summary: Mendapatkan jadwal main
   *    description: Menampilkan list booking yang diikuti oleh user yang sedang melakukan login
   *    security:
   *      - bearerAuth: []
   *    tags:
   *      - Booking
   *    responses:
   *       200:
   *         description: Jadwal user ditemukan
   *         content:
   *            application/json:
   *                example:
   *                 msg: "Berhasil mendapatkan data list booking"
   *                 data:
   *                      id: 1
   *                      name: "Ahmad Fajar"
   *                      email: "ahmad@mail.com"
   *                      remember_me_token: null
   *                      role: "user"
   *                      is_verified: 1
   *                      created_at: "2021-09-25T21:20:04.000+07:00"
   *                      updated_at: "2021-09-25T21:20:04.000+07:00"
   *                      listBooking:
   *                          - id: 1
   *                            booking_id: 1
   *                            user_id: 1
   *                            detailBooking: 1
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   */
  public async schedules({ response, auth }: HttpContextContract) {
    try {
      let data = await User.query()
        .where("id", auth.user!.id)
        .preload("listBooking", (listQuery) => {
          listQuery
            .select("id", "booking_id")
            .preload("detailBooking", (dtlBooking) => {
              dtlBooking
                .select(
                  "id",
                  "keterangan",
                  "field_id",
                  "play_date_start",
                  "play_date_end"
                )
                .preload("namaField", (fieldName) => {
                  fieldName
                    .select("id", "name", "type", "venueId")
                    .preload("dataVenue", (dtlVenue) => {
                      dtlVenue.select("id", "name", "address");
                    });
                });
            });
        })
        .firstOrFail();

      return response.ok({
        msg: "Berhasil mendapatkan data list booking",
        data,
      });
    } catch (error) {
      return response.notFound({
        msg: "Data tidak ada",
        error: error.messages ? error.messages.errors : error.message || error,
      });
    }
  }
}
