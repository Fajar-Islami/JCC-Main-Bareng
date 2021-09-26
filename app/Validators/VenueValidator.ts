import { schema, rules } from "@ioc:Adonis/Core/Validator";
import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

export default class VenueValidator {
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
      rules.minLength(2),
      rules.maxLength(45),
    ]),
    address: schema.string({ trim: true }, [
      rules.minLength(5),
      rules.maxLength(200),
    ]),
    phone: schema.string({ trim: true }, [
      rules.mobile(),
      rules.minLength(11),
      rules.maxLength(13),
    ]),
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
    minLength: "{{field}} minimal {{ options.minLength }} karakter",
    maxLength: "{{field}} maksimal {{ options.minLength }} karatker",
    "phone.mobile":
      "Harap masukan format nomor telepon dengan benar, tanpa menggunakan kode negara",
  };
}
