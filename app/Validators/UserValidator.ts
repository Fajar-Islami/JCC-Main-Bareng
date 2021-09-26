import { schema, rules } from "@ioc:Adonis/Core/Validator";
import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

export default class UserValidator {
  constructor(protected ctx: HttpContextContract) {}

  /*
   * Define schema to validate the "shape", "type", "formatting" and "integrity" of data.
   *
   * For example:
   * 1. The username must be of data type string. But then also, it should
   *    not contain special characters or numbers.
   *    ```
   *     schema.string({}, [ rules.alpha() ])
   *    ```
   *
   * 2. The email must be of data type string, formatted as a valid
   *    email. But also, not used by any other user.
   *    ```
   *     schema.string({}, [
   *       rules.email(),
   *       rules.unique({ table: 'users', column: 'email' }),
   *     ])
   *    ```
   */
  public schema = schema.create({
    name: schema.string({ trim: true }, [
      rules.alpha({ allow: ["space"] }),
      rules.minLength(2),
      rules.maxLength(45),
    ]),
    email: schema.string({ trim: true }, [
      rules.email(),
      rules.maxLength(225),
      rules.unique({ table: "users", column: "email" }),
    ]),
    password: schema.string({}, [
      rules.confirmed(),
      rules.minLength(6),
      rules.maxLength(180),
    ]),
    role: schema.enum(["user", "owner"] as const),
  });

  /**
   * Custom messages for validation failures. You can make use of dot notation `(.)`
   * for targeting nested fields and array expressions `(*)` for targeting all
   * children of an array. For example:
   *
   * {
   *   'profile.username.required': 'Username is required',
   *   'scores.*.number': 'Define scores as valid numbers'
   * }
   *
   */
  public messages = {
    required: "Harap isi field {{ field }}",
    enum: "Role yang tersedia adalah{{ options.choices }}",
    minLength: "{{field}} minimal {{ options.minLength }} karatker",
    maxLength: "{{field}} maksimal {{ options.minLength }} karatker",
    //
    "name.alpha": "Name hanya dapat diisi huruf",
    "email.email": "Masukan alamat email yang valid",
    "email.unique": "Email ini sudah terdaftar",
    confirmed: "Password tidak sama",
  };
}
