import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Mail from "@ioc:Adonis/Addons/Mail";
import { schema } from "@ioc:Adonis/Core/Validator";

import User from "App/Models/User";
import UserValidator from "App/Validators/UserValidator";
import Database from "@ioc:Adonis/Lucid/Database";

export default class UsersController {
  /**
   *
   * @swagger
   * /api/v1/register:
   *  post:
   *    summary: Register User baru.
   *    description: |
   *      Role terdiri dari 2 yaitu 'user' dan 'owner'
   *      1. User : pengguna biasa yang dapat melakukan booking ke satu field.\n
   *              Dapat melakukan join/unjoin ke booking tertentu.
   *      2. Owner: pemilik venue yang menyewakan lapangan (field) untuk dibooking.
   *    tags:
   *      - Auth
   *    requestBody:
   *      required : true
   *      content :
   *        application/x-www-form-urlencoded:
   *          schema:
   *            $ref: '#definitions/User'
   *        application/json:
   *          schema:
   *            $ref: '#definitions/User'
   *    responses:
   *       201:
   *         description: Akun dibuat
   *         content:
   *            application/json:
   *               example:
   *                 msg: "Registrasi berhasil, harap cek email anda"
   *       422:
   *         description: Gagal buat akun
   *         content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/unprocessableEntitySchemas1'
   *              example:
   *                 msg: "unique"
   *                 error:
   *                    - rule: "unique"
   *                      field: "email"
   *                      message: "Email ini sudah terdaftar"
   */

  public async register({ request, response }: HttpContextContract) {
    try {
      // validate input
      await request.validate(UserValidator);

      // save new user
      let newUser = new User();
      newUser.name = request.input("name");
      newUser.email = request.input("email");
      newUser.password = request.input("password");
      newUser.role = request.input("role");
      const result = await newUser.save();

      // save otp code
      const otp_code = Math.floor(100000 + Math.random() * 900000);
      await Database.table("otp_codes").insert({
        otp_code,
        user_id: result.id,
      });

      // send mail
      await Mail.send((msg) => {
        msg
          .from("adonis.demo@sanberdev.com")
          .to(result.email)
          .subject("Verifikasi Email")
          .htmlView("emails/otp_verification", { otp_code });
      });

      return response.created({
        msg: "Registrasi berhasil, harap cek email anda",
      });
    } catch (error) {
      return response.unprocessableEntity({
        msg: "Gagal register user",
        error: error.messages ? error.messages.errors : error.message || error,
      });
    }
  }

  /**
   *
   * @swagger
   * /api/v1/otp_confirmation:
   *  post:
   *    summary: Verifikasi Akun User.
   *    description: Verifikasi akun user berdasarkan kode otp pada email
   *    tags:
   *      - Auth
   *    requestBody:
   *      required : true
   *      content :
   *       application/x-www-form-urlencoded:
   *          schema:
   *            $ref: '#/components/schemas/otp_confirmationSchema'
   *       application/json:
   *          schema:
   *            $ref: '#/components/schemas/otp_confirmationSchema'
   *    responses:
   *       200:
   *         description: Akun sudah terverifikasi
   *         content:
   *            application/json:
   *                example:
   *                   msg: "Akun ini telah terverifikasi"
   *       201:
   *         description: Aktivasi akun
   *         content:
   *            application/json:
   *                example:
   *                   msg: "Berhasil aktivasi akun"
   *       422:
   *         description: Gagal aktivasi akun
   *         content:
   *            application/json:
   *              example:
   *                 msg: "Gagal aktivasi akun"
   *                 error:
   *                    - rule: "required"
   *                      field: "email"
   *                      message: "required validation failed"
   *                    - rule: "required"
   *                      field: "otp_code"
   *                      message: "required validation failed"
   */
  public async otp_confirmation({ request, response }: HttpContextContract) {
    let email = request.input("email");
    let otp_code = request.input("otp_code");

    // Validator
    const schemaInput = schema.create({
      email: schema.string(),
      otp_code: schema.string(),
    });

    try {
      await request.validate({ schema: schemaInput });

      // 1 cari user
      let userData = await User.findByOrFail("email", email);

      // kalau user sudah diverifikasi
      if (userData.isVerified!) {
        return response.ok({ msg: "Akun ini telah terverifikasi" });
      }

      // 2 cari otp code
      let otpCheck = await Database.query()
        .from("otp_codes")
        .where("otp_code", otp_code)
        .where("user_id", userData.id)
        .firstOrFail();

      // 3 aktivasi user
      if (userData.id == otpCheck.user_id) {
        userData.isVerified = true;
        await userData.save();
      }

      return response.created({ msg: "Berhasil aktivasi akun" });
    } catch (error) {
      return response.unprocessableEntity({
        msg: "Gagal aktivasi akun",
        error: error.messages ? error.messages.errors : error.message || error,
      });
    }
  }

  /**
   *
   * @swagger
   * /api/v1/login:
   *  post:
   *    summary: Login User.
   *    description: Login user lalu mendapatkan token
   *    tags:
   *      - Auth
   *    requestBody:
   *      required : true
   *      content :
   *       application/x-www-form-urlencoded:
   *          schema:
   *            $ref: '#/components/schemas/loginSchema'
   *       application/json:
   *          schema:
   *            $ref: '#/components/schemas/loginSchema'
   *    responses:
   *       200:
   *         description: Mendapatkan token login
   *         content:
   *            application/json:
   *              example:
   *                 msg: "Login sukses"
   *                 token: "NA.HbVZojoAxthMDrpAHRveC1-la5lonAIzBXc78Rbvn8EcdHLG0xzPKKa56w4x"
   *                 role: "owner"
   *       400:
   *         description: Gagal login
   *         content:
   *            application/json:
   *              example:
   *                 msg: "Login gagal"
   *                 error: "E_INVALID_AUTH_PASSWORD: Password mis-match"
   */
  public async login({ request, response, auth }: HttpContextContract) {
    let email = request.input("email");
    let password = request.input("password");

    // Validator
    const schemaLogin = schema.create({
      email: schema.string(),
      password: schema.string(),
    });

    try {
      // validate input
      await request.validate({ schema: schemaLogin });

      // set to auth
      const { token } = await auth.use("api").attempt(email, password);

      return response.ok({ msg: "Login sukses", token, role: auth.user?.role });
    } catch (error) {
      return response.badRequest({
        msg: "Login gagal",
        error: error.messages ? error.messages.errors : error.message || error,
      });
    }
  }

  /**
   *
   * @swagger
   * /api/v1/userLogin:
   *  get:
   *    summary: Cek User Login
   *    description: Mengecek akun yang sedang login
   *    tags:
   *      - Auth
   *    security:
   *      - bearerAuth: []
   *    responses:
   *       200:
   *         description: Menampilkan data user yang sedang login
   *         content:
   *            application/json:
   *                example:
   *                   data:
   *                      id: 1
   *                      name: "Ahmad Fajar"
   *                      email: "ahmad@mail.com"
   *                      remember_me_token: null
   *                      role: "user"
   *                      is_verified: 1
   *                      created_at: "2021-09-25T21:20:04.000+07:00"
   *                      updated_at: "2021-09-25T21:20:04.000+07:00"
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   */

  public async userLogin({ auth, response }: HttpContextContract) {
    return response.ok({ data: auth.user });
  }
}
