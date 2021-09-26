import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

export default class IsUser {
  public async handle(
    { response, auth }: HttpContextContract,
    next: () => Promise<void>
  ) {
    // code for middleware goes here. ABOVE THE NEXT CALL

    if (auth.user!.role == "user") {
      await next();
    } else {
      return response.ok({
        msg: "Hanya role user yang memiliki akses",
      });
    }
  }
}
