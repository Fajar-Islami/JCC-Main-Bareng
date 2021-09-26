import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class Schedules extends BaseSchema {
  protected tableName = "schedules";

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign("field_id");
      table.dropColumn("field_id");
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer("field_id").unsigned().references("fields.id");
    });
  }
}
