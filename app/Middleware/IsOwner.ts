import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

export default class IsOwner {
  public async handle(
    { auth, response }: HttpContextContract,
    next: () => Promise<void>
  ) {
    // code for middleware goes here. ABOVE THE NEXT CALL

    if (auth.user!.role == "owner") {
      await next();
    } else {
      return response.unauthorized({
        msg: "Hanya user owner yang memiliki akses",
      });
    }
  }
}
