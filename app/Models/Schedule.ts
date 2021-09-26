import { DateTime } from "luxon";
import { BaseModel, BelongsTo, belongsTo, column } from "@ioc:Adonis/Lucid/Orm";
import Booking from "App/Models/Booking";

export default class Schedule extends BaseModel {
  /**
   *  @swagger
   *  definitions:
   *    Schedule:
   *      type: object
   *      properties:
   *        id:
   *          type: uint
   *          readOnly: true
   *        userId:
   *          type: uint
   *          readOnly: true
   *        bookingId:
   *          type: uint
   *          readOnly: true
   *      required:
   *        - keterangan
   *        - userId
   *        - bookingId
   */
  @column({ isPrimary: true })
  public id: number;

  @column()
  public userId: number;

  @column()
  public bookingId: number;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  //Relationship
  @belongsTo(() => Booking)
  public detailBooking: BelongsTo<typeof Booking>;
}
