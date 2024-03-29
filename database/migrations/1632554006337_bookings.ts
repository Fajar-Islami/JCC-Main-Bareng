import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class Bookings extends BaseSchema {
  protected tableName = "bookings";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id");
      table.string("keterangan").notNullable();
      table.integer("user_id").unsigned().references("users.id");

      table.integer("field_id").unsigned().references("fields.id");

      table.dateTime("play_date_start").notNullable();
      table.dateTime("play_date_end").notNullable();

      table.timestamps(true, true);
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
