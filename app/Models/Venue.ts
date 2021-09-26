import { DateTime } from "luxon";
import {
  BaseModel,
  BelongsTo,
  belongsTo,
  column,
  HasMany,
  hasMany,
} from "@ioc:Adonis/Lucid/Orm";
import Field from "./Field";
import User from "./User";

export default class Venue extends BaseModel {
  /**
   *  @swagger
   *  definitions:
   *    Venue:
   *      type: object
   *      properties:
   *        id:
   *          type: uint
   *          readOnly: true
   *        name:
   *          type: string
   *        phone:
   *          type: string
   *        address:
   *          type: string
   *        user_id:
   *          type: string
   *          readOnly: true
   *      required:
   *        - name
   *        - phone
   *        - address
   */

  @column({ isPrimary: true })
  public id: number;

  @column()
  public name: string;

  @column()
  public phone: string;

  @column()
  public address: string;

  @column()
  public userId: number;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  // Relationship
  @hasMany(() => Field)
  public fields: HasMany<typeof Field>;

  @belongsTo(() => User)
  public ownerVenue: BelongsTo<typeof User>;
}
