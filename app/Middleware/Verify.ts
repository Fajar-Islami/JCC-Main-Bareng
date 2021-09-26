import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

export default class Verify {
  public async handle(
    { auth, response }: HttpContextContract,
    next: () => Promise<void>
  ) {
    // code for middleware goes here. ABOVE THE NEXT CALL

    // Pengecekan verifikasi

    // 1 cari data verified user
    let userVerified = auth.user?.isVerified;

    // 2  cek di tabel user apakah sudah verify atau blm
    if (userVerified) {
      await next();
    } else {
      return response.unauthorized({ msg: "Akun belum terverifikasi" });
    }
  }
}
