import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class Schedules extends BaseSchema {
  protected tableName = "schedules";

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign("booking_id");
      table.dropColumn("booking_id");
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer("booking_id").unsigned().references("bookings.id");
    });
  }
}
