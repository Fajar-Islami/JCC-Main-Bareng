import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

import Field from "App/Models/Field";
import Venue from "App/Models/Venue";
import FieldValidator from "App/Validators/FieldValidator";

export default class FieldsController {
  /**
   *
   * @swagger
   * /api/v1/venues/{venue_id}/field:
   *  get:
   *    summary: Mendapatkan data field
   *    description: Mendapatkan seluruh field berdasarkan venue tertentu.
   *      Dapat filter type dengan pilihan "soccer", "mini soccer", "futsal", "basketball", "volleyball"
   *    security:
   *      - bearerAuth: []
   *    tags:
   *      - Field
   *    parameters:
   *       - in: path
   *         name : venue_id
   *         required : true
   *         schema :
   *          type: number
   *          minimum: 1
   *         description: ID dari venue field
   *       - in: query
   *         name : type
   *         required : false
   *         schema :
   *            type: string
   *            enum: [ "soccer", "mini soccer", "futsal", "basketball", "volleyball"]
   *         description: Pilih jika ingin filter berdasarkan type
   *    responses:
   *       200:
   *         description: Data Field didapat
   *         content:
   *            application/json:
   *                example:
   *                   msg: "Berhasil mendapatkan data field"
   *                   result:
   *                    - id: 4
   *                      name: "venue keempat"
   *                      venue_id: 1
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   */
  public async index({ params, request, response }: HttpContextContract) {
    let { venue_id } = params;

    console.log("params", params);
    let msg = "Berhasil mendapatkan data field";
    let result = {};
    if (request.qs().type) {
      const type = request.qs().type;
      result = await Field.query()
        .where("venue_id", venue_id)
        .where("type", type);
    } else {
      result = await Field.query().where("venue_id", venue_id);
    }

    return response.ok({ msg, result });
  }

  /**
   *
   * @swagger
   * /api/v1/venues/{venue_id}/field:
   *  post:
   *    summary: Mendaftarkan field baru pada suatu venue
   *    description: Pengguna Owner mendaftarkan field pada venue tertentu. Hanya Pengguna Owner yang memiliki akses !!
   *    security:
   *      - bearerAuth: []
   *    tags:
   *      - Field
   *    parameters:
   *     - in: path
   *       name : venue_id
   *       required : true
   *       schema :
   *          type: number
   *          minimum: 1
   *       description: ID dari venue field
   *    requestBody:
   *     required : true
   *     content :
   *       application/x-www-form-urlencoded:
   *          schema:
   *            $ref: '#definitions/Field'
   *       application/json:
   *          schema:
   *            $ref: '#definitions/Field'
   *    responses:
   *       201:
   *         $ref: '#/components/responses/CreatedData'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       404:
   *         $ref: '#/components/responses/VenueNotFound'
   *       422:
   *         description: Gagal menambahkan Field
   *         content:
   *            application/json:
   *              example:
   *                 msg: "Gagal aktivasi akun"
   *                 error:
   *                    - rule: "required"
   *                      field: "name"
   *                      message: "Harap isi field name"
   *                    - rule: "required"
   *                      field: "type"
   *                      message: "Harap isi field type"
   */
  public async store({ request, params, response }: HttpContextContract) {
    let { venue_id } = params;

    try {
      // 1 mencari data venue
      let findVenue = await Venue.query().where("id", venue_id).first();
      if (!findVenue) {
        return response.notFound({ msg: "Data venue tidak ada" });
      }

      // Validasi input
      await request.validate(FieldValidator);

      // Save data
      let newField = new Field();
      newField.name = request.input("name");
      newField.type = request.input("type");

      await newField.related("dataVenue").associate(findVenue);

      return response.created({ msg: `Berhasil menambahkan data field baru` });
    } catch (error) {
      response.unprocessableEntity({
        msg: "Gagal menyimpan data field",
        error: error.messages ? error.messages.errors : error.message || error,
      });
    }
  }

  /**
   *
   * @swagger
   * /api/v1/venues/{venue_id}/field/{id}:
   *  get:
   *    summary: Mencari field berdasarkan id
   *    description: Pencarian field berdasarkan id field. Detail venue dan jadwal booking pada tanggal tertentu (default hari ini)
   *    security:
   *      - bearerAuth: []
   *    tags:
   *      - Field
   *    parameters:
   *     - in: path
   *       name : venue_id
   *       required : false
   *       schema :
   *          type: number
   *          minimum: 1
   *       description: ID dari venue field. Bersifat Optional jika ingin mencari spesifik dari venue tertentu.
   *     - in: path
   *       name : id
   *       required : true
   *       schema :
   *          type: number
   *          minimum: 1
   *       description: ID dari field
   *    responses:
   *       200:
   *         description: Venue dibuat
   *         content:
   *            application/json:
   *                example:
   *                   msg: "Data venue ditemukan"
   *                   data:
   *                    id: 1
   *                    name: "field 1 pada venue 1"
   *                    type: "mini soccer"
   *                    venue_id: 1
   *                    daftarBooking:
   *                      - id: 1
   *                      - keterangan: main futsal
   *                      - user_id: 1
   *                      - field_id: 1
   *                      - play_date_start: "2021-09-26T09:00:00.000+07:00"
   *                      - play_date_end: "2021-09-26T19:00:00.000+07:00"
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   */
  public async show({ params, response }: HttpContextContract) {
    let { venue_id, id } = params;
    console.log(`venue_id`, venue_id);
    try {
      let result = {};

      // validasi error di swagger
      if (venue_id == "" || venue_id == "%7Bvenue_id%7D" || venue_id == ",") {
        result = await Field.query()
          .select(["id", "name", "type", "venue_id"])
          .where("id", id)
          .preload("daftarBooking")
          .firstOrFail();
      } else {
        result = await Field.query()
          .select(["id", "name", "type", "venue_id"])
          .where("id", id)
          .where("venue_id", venue_id)
          .preload("daftarBooking")
          .firstOrFail();
      }

      return response.ok({ msg: "Data ditemukan", data: result });
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
   * /api/v1/venues/{venue_id}/field/{id}:
   *  put:
   *    summary: Memperbarui field baru pada suatu venue
   *    description: Pengguna Owner Memperbarui field pada venue tertentu. Hanya Pengguna Owner yang memiliki akses !!
   *    security:
   *      - bearerAuth: []
   *    tags:
   *      - Field
   *    parameters:
   *     - in: path
   *       name : venue_id
   *       required : true
   *       schema :
   *          type: number
   *          minimum: 1
   *       description: ID dari venue field
   *     - in: path
   *       name : id
   *       required : true
   *       schema :
   *          type: number
   *          minimum: 1
   *       description: ID dari field
   *    requestBody:
   *     required : true
   *     content :
   *       application/x-www-form-urlencoded:
   *            $ref: '#/components/schemas/UpdateFieldBody'
   *       application/json:
   *            $ref: '#/components/schemas/UpdateFieldBody'
   *    responses:
   *       200:
   *         $ref: '#/components/responses/UpdateData'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       404:
   *         $ref: '#/components/responses/VenueNotFound'
   *       422:
   *         $ref: '#/components/responses/FailedUpdatedData'
   */
  public async update({ params, request, response }: HttpContextContract) {
    let { venue_id, id } = params;
    try {
      let findVenue = await Venue.query().where("id", venue_id).firstOrFail();

      if (!findVenue) {
        return response.notFound({ msg: "Data tidak ada" });
      }

      let updatedData = await Field.query()
        .where("venue_id", venue_id)
        .where("id", id)
        .firstOrFail();

      const nameField = request.input("name");
      const typeField = request.input("type");

      updatedData.name = nameField || updatedData.name;
      updatedData.type = typeField || updatedData.type;

      await updatedData.save();

      return response.ok({ msg: "Sukses update data" });
    } catch (error) {
      return response.unprocessableEntity({
        msg: "Data gagal diperbarui / data tidak ada",
        error: error.messages ? error.messages.errors : error.message || error,
      });
    }
  }

  /**
   *
   * @swagger
   * /api/v1/venues/{venue_id}/field/{id}:
   *  delete:
   *    summary: Hapus data field
   *    description: Pengguna Owner dapat menghapus data field
   *    security:
   *      - bearerAuth: []
   *    tags:
   *      - Field
   *    parameters:
   *     - in: path
   *       name : venue_id
   *       required : true
   *       schema :
   *          type: number
   *          minimum: 1
   *       description: ID dari venue field
   *     - in: path
   *       name : id
   *       required : true
   *       schema :
   *          type: number
   *          minimum: 1
   *       description: ID dari field
   *    responses:
   *       200:
   *         $ref: '#/components/responses/DeletedData'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       422:
   *         $ref: '#/components/responses/FailedDeleteData'
   */
  public async destroy({ params, response }: HttpContextContract) {
    let { venue_id, id } = params;

    try {
      let deleteData = await Field.query()
        .where("venue_id", venue_id)
        .where("id", id)
        .firstOrFail();

      await deleteData.delete();

      response.ok({ msg: "Berhasil delete data fields" });
    } catch (error) {
      return response.unprocessableEntity({
        msg: "Data gagal dihapus / data tidak ada",
        error: error.messages ? error.messages.errors : error.message || error,
      });
    }
  }
}
