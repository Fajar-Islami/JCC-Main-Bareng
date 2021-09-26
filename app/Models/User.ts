import { DateTime } from "luxon";
import Hash from "@ioc:Adonis/Core/Hash";
import {
  column,
  beforeSave,
  BaseModel,
  hasMany,
  HasMany,
} from "@ioc:Adonis/Lucid/Orm";

import { roleUser } from "App/TypeCollection/enumCollection";
import Venue from "./Venue";
import Schedule from "./Schedule";

/**
 *  @swagger
 *  definitions:
 *    User:
 *      type: object
 *      properties:
 *        id:
 *          type: uint
 *          readOnly: true
 *        name:
 *          type: string
 *        email:
 *          type: string
 *        password:
 *          type: string
 *        password_confirmation:
 *          type: string
 *        remember_me_token:
 *          type: string
 *          readOnly: true
 *        role:
 *          type: string
 *          enum: ["user", "owner"]
 *        is_verified:
 *          type: boolean
 *          readOnly: true
 *      required:
 *        - name
 *        - email
 *        - password
 *        - password_confirmation
 *        - role
 */

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public name: string;

  @column()
  public email: string;

  @column({ serializeAs: null })
  public password: string;

  @column()
  public rememberMeToken?: string;

  @column()
  public role: roleUser;

  @column()
  public isVerified: boolean;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  @beforeSave()
  public static async hashPassword(user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password);
    }
  }

  @hasMany(() => Venue)
  public ownerVenues: HasMany<typeof Venue>;

  @hasMany(() => Schedule, {})
  public listBooking: HasMany<typeof Schedule>;
}
