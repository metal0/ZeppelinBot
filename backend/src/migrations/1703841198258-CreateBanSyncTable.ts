import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateBanSyncTable1703841198258 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "bans",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "guild_id",
            type: "bigint",
          },
          {
            name: "user_id",
            type: "bigint",
          },
        ],
        indices: [
          {
            columnNames: ["guild_id", "user_id"],
            isUnique: true,
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("bans");
  }
}
