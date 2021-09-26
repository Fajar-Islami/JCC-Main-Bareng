import { DateTime } from "luxon";
import {
  BaseModel,
  BelongsTo,
  belongsTo,
  column,
  HasMany,
  hasMany,
} from "@ioc:Adonis/Lucid/Orm";

import Venue from "App/Models/Venue";
import { typeField } from "App/TypeCollection/enumCollection";
import Booking from "App/Models/Booking";

export default class Field extends BaseModel {
  /**
   *  @swagger
   *  definitions:
   *    Field:
   *      type: object
   *      properties:
   *        id:
   *          type: uint
   *          readOnly: true
   *        name:
   *          type: string
   *        type:
   *          type: string
   *          enum: ["soccer", "mini soccer", "futsal", "basketball", "volleyball"]
   *        venueId:
   *          type: string
   *          readOnly: true
   *      required:
   *        - name
   *        - type
   */

  @column({ isPrimary: true })
  public id: number;

  @column()
  public name: string;

  @column()
  public type: typeField;

  @column()
  public venueId: number;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  // Relationship
  @belongsTo(() => Venue)
  public dataVenue: BelongsTo<typeof Venue>;

  @hasMany(() => Booking)
  public daftarBooking: HasMany<typeof Booking>;
}
