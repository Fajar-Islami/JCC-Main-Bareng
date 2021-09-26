import { DateTime } from "luxon";
import {
  BaseModel,
  BelongsTo,
  belongsTo,
  column,
  computed,
  HasMany,
  hasMany,
  manyToMany,
  ManyToMany,
} from "@ioc:Adonis/Lucid/Orm";
import User from "App/Models/User";
import Field from "App/Models/Field";
import Schedule from "./Schedule";

export default class Booking extends BaseModel {
  /**
   *  @swagger
   *  definitions:
   *    Booking:
   *      type: object
   *      properties:
   *        id:
   *          type: uint
   *          readOnly: true
   *        keterangan:
   *          type: string
   *        userId:
   *          type: string
   *          readOnly: true
   *        fieldId:
   *          type: string
   *          description: "ID dari field yang ingin di booking"
   *        play_date_start:
   *          type: string
   *          format: date
   *          description: "Format waktu adalah yyyy-MM-ddTHH:mm:ss, contoh: 2021-09-27T12:00:00"
   *        play_date_end:
   *          type: string
   *          format: date
   *          description: "Format waktu adalah yyyy-MM-ddTHH:mm:ss, contoh: 2021-09-27T12:00:00"
   *      required:
   *        - keterangan
   *        - fieldId
   *        - play_date_start
   *        - play_date_end
   */

  @column({ isPrimary: true })
  public id: number;

  @column()
  public keterangan: string;

  @column()
  public userId: number;

  @column()
  public fieldId: number;

  @column.dateTime()
  public play_date_start: DateTime;

  @column.dateTime()
  public play_date_end: DateTime;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  // Relationship

  // Cari user yang sewa
  @belongsTo(() => User)
  public bookingUser: BelongsTo<typeof User>;

  @belongsTo(() => Field)
  public namaField: BelongsTo<typeof Field>;

  @manyToMany(() => User, {
    pivotTable: "schedules",
  })
  public players: ManyToMany<typeof User>;

  @hasMany(() => Schedule)
  public terdaftarBooking: HasMany<typeof Schedule>;

  @computed()
  public get players_count() {
    return this.players?.length;
  }
}
