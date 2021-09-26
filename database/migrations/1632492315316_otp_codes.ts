import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class OtpCodes extends BaseSchema {
  protected tableName = "otp_codes";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id");
      table.string("otp_code");
      table.integer("user_id").unsigned().references("users.id");
      table.timestamps(true, true);
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
