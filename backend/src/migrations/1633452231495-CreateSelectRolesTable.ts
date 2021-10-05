import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateSelectRolesTable1633452231495 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "select_roles",
        columns: [
          {
            name: "guild_id",
            type: "bigint",
            isPrimary: true,
          },
          {
            name: "channel_id",
            type: "bigint",
            isPrimary: true,
          },
          {
            name: "message_id",
            type: "bigint",
            isPrimary: true,
          },
          {
            name: "menu_id",
            type: "varchar",
            length: "100",
            isPrimary: true,
            isUnique: true,
          },
          {
            name: "menu_group",
            type: "varchar",
            length: "100",
          },
          {
            name: "menu_name",
            type: "varchar",
            length: "100",
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("select_roles");
  }
}
