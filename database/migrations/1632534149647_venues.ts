import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class Venues extends BaseSchema {
  protected tableName = "venues";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id");
      table.string("name", 45).notNullable();
      table.string("phone", 13).notNullable();
      table.string("address", 200).notNullable();
      table
        .integer("user_id")
        .unsigned()
        .references("users.id")
        .onDelete("CASCADE");
      table.timestamps(true, true);
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
