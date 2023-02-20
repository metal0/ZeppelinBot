import { MigrationInterface, QueryRunner, TableIndex } from "typeorm";

export class AddMessagesIndex1676927683781 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createIndex(
      "messages",
      new TableIndex({
        columnNames: ["guild_id", "user_id"],
      }),
    );
    await queryRunner.createIndex(
      "messages",
      new TableIndex({
        columnNames: ["guild_id", "channel_id"],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex(
      "messages",
      new TableIndex({
        columnNames: ["guild_id", "user_id"],
      }),
    );
    await queryRunner.dropIndex(
      "messages",
      new TableIndex({
        columnNames: ["guild_id", "channel_id"],
      }),
    );
  }
}
