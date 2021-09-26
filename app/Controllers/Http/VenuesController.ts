import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

import VenueValidator from "App/Validators/VenueValidator";
import Venue from "App/Models/Venue";

export default class VenuesController {
  /**
   *
   * @swagger
   * /api/v1/venue:
   *  get:
   *    summary: List Venue
   *    description: Mendapatkan list venue atau tempat olahraga. Hanya Pengguna Owner yang memiliki akses !!
   *    security:
   *      - bearerAuth: []
   *    tags:
   *      - Venue
   *    responses:
   *       200:
   *         description: Data Venue didapat
   *         content:
   *            application/json:
   *               example:
   *                 msg: "Berhasil mendapatkan data venue"
   *                 result:
   *                    - id: 4
   *                      name: "venue keempat"
   *                      phone: "081212341234"
   *                      address: "Jakarta"
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   */

  public async index({ response }: HttpContextContract) {
    let msg = "Berhasil mendapatkan data venue";
    let result = {};

    result = await Venue.query().preload("fields", (dtlField) => {
      dtlField.select("id", "name", "type");
    });
    return response.ok({ msg, result });
  }

  /**
   *
   * @swagger
   * /api/v1/venue:
   *  post:
   *    summary: Mendaftarkan venue baru
   *    description: Pengguna Owner mendaftarkan venue. Hanya Pengguna Owner yang memiliki akses !!
   *    security:
   *      - bearerAuth: []
   *    tags:
   *      - Venue
   *    requestBody:
   *     required : true
   *     content :
   *       application/x-www-form-urlencoded:
   *          schema:
   *            $ref: '#definitions/Venue'
   *       application/json:
   *          schema:
   *            $ref: '#definitions/Venue'
   *    responses:
   *       201:
   *         $ref: '#/components/responses/CreatedData'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       422:
   *         description: Gagal menambahkan venue
   *         content:
   *            application/json:
   *              example:
   *                 msg: "Gagal aktivasi akun"
   *                 error:
   *                    - rule: "required"
   *                      field: "name"
   *                      message: "Harap isi field name"
   *                    - rule: "minLength"
   *                      field: "address"
   *                      message: "Address minimal 5 karakter"
   *                    - rule: "mobile"
   *                      field: "phone"
   *                      message: "Harap masukan format nomor telepon dengan benar, tanpa menggunakan kode negara "
   */

  public async store({ request, response, auth }: HttpContextContract) {
    try {
      await request.validate(VenueValidator);

      await auth.user?.related("ownerVenues").create({
        name: request.input("name"),
        address: request.input("address"),
        phone: request.input("phone"),
      });

      response.created({
        msg: "Berhasil buat venue",
      });
    } catch (error) {
      return response.unprocessableEntity({
        msg: "Gagal membuat venue",
        error: error.messages ? error.messages.errors : error.message || error,
      });
    }
  }

  /**
   *
   * @swagger
   * /api/v1/venue/{id}:
   *  get:
   *    summary: Mencari venue berdasarkan id
   *    description: Pengguna Owner Detail mendapatkan venue dan jadwal booking pada tanggal tertentu (default hari ini). Hanya Pengguna Owner yang memiliki akses !!
   *    security:
   *      - bearerAuth: []
   *    tags:
   *      - Venue
   *    parameters:
   *     - in: path
   *       name : id
   *       required : true
   *       schema :
   *          type: number
   *          minimum: 1
   *       description: ID dari venue
   *     - in: query
   *       name : tanggal
   *       required : false
   *       schema :
   *          type: string
   *          format : date
   *       description: Tanggal default adalah hari ini. Format tanggal adalah YYYY-MM-DD contoh 2021-12-31.
   *    responses:
   *       200:
   *         description: Data venue ditemukan
   *         content:
   *            application/json:
   *                example:
   *                   msg: "Data ditemukan"
   *                   data:
   *                    id: 1
   *                    name: "venue pertama"
   *                    phone: "081212341234"
   *                    address: "Jakarta"
   *                    user_id: 1
   *                    created_at: "2021-09-26T08:35:40.000+07:00"
   *                    updated_at: "2021-09-26T08:35:40.000+07:00"
   *                    fields: []
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   */
  public async show({ params, response, request }: HttpContextContract) {
    let today = new Date().toISOString().slice(0, 10);

    try {
      let data = await Venue.query()
        .where("id", params.id)
        .preload("fields", (fieldName) => {
          fieldName
            .select("id", "name", "type")
            .preload("daftarBooking", (dtlBooking) => {
              dtlBooking.where(
                "play_date_start",
                "like",
                `${request.qs().tanggal || today}%`
              );
            });
        })
        .firstOrFail();

      return response.ok({ msg: "Data ditemukan", data });
    } catch (error) {
      return response.notFound({
        msg: "Data tidak ada",
      });
    }
  }

  /**
   *
   * @swagger
   * /api/v1/venue/{id}:
   *  put:
   *    summary: Mengubah data venue berdasarkan id
   *    description: Pengguna Owner Mengubah data venue. Hanya Pengguna Owner yang memiliki akses !!
   *    security:
   *      - bearerAuth: []
   *    tags:
   *      - Venue
   *    parameters:
   *     - in: path
   *       name : id
   *       required : true
   *       schema :
   *          type: number
   *          minimum: 1
   *       description: ID dari venue
   *    requestBody:
   *      required : true
   *      content :
   *       application/x-www-form-urlencoded:
   *          $ref: '#/components/schemas/UpdateVenueBody'
   *       application/json:
   *          $ref: '#/components/schemas/UpdateVenueBody'
   *    responses:
   *       200:
   *         $ref: '#/components/responses/UpdateData'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       422:
   *         $ref: '#/components/responses/FailedUpdatedData'
   */
  public async update({ params, request, response }: HttpContextContract) {
    let id = params.id;

    try {
      let updateData = await Venue.findOrFail(id);
      updateData.name = request.input("name") || updateData.name;
      updateData.address = request.input("address") || updateData.address;
      updateData.phone = request.input("phone") || updateData.phone;

      await updateData.save();

      return response.ok({ msg: "Berhasil update data venue" });
    } catch (error) {
      return response.unprocessableEntity({
        msg: "Gagal update data",
        error: error.messages ? error.messages.errors : error.message || error,
      });
    }
  }

  /**
   *
   * @swagger
   * /api/v1/venue/{id}:
   *  delete:
   *    summary: Hapus data venue
   *    description: Pengguna Owner dapat menghapus data venue. Hanya Pengguna Owner yang memiliki akses !!
   *    security:
   *      - bearerAuth: []
   *    tags:
   *      - Venue
   *    parameters:
   *     - in: path
   *       name : id
   *       required : true
   *       schema :
   *          type: number
   *          minimum: 1
   *       description: ID dari venue
   *    responses:
   *       200:
   *         $ref: '#/components/responses/DeletedData'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       422:
   *         $ref: '#/components/responses/FailedDeleteData'
   */
  public async destroy({ params, response }: HttpContextContract) {
    try {
      let deleteData = await Venue.findOrFail(params.id);
      await deleteData.delete();

      return response.ok({ msg: "Data venue terhapus" });
    } catch (error) {
      return response.unprocessableEntity({
        msg: "Data gagal dihapus / data tidak ada",
        error: error.messages ? error.messages.errors : error.message || error,
      });
    }
  }
}
