import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

export default class TestController {
  /**
   * @swagger
   * /api/hello:
   *   get:
   *     tags:
   *       - Test
   *     summary: Sample API
   *     parameters:
   *       - name: name
   *         description: Name of the user
   *         in: query
   *         required: false
   *         type: string
   *     responses:
   *       200:
   *         description: Send hello message
   *         example:
   *           message: Hello Guess
   */
  public async hello({ request, response }: HttpContextContract) {
    const name = request.input("name", "Guess");
    return response.send({ message: "Hello " + name });
  }
}
