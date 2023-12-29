import { In, InsertResult, Repository } from "typeorm";
import { Queue } from "../Queue";
import { chunkArray } from "../utils";
import { BaseGuildRepository } from "./BaseGuildRepository";
import { dataSource } from "./dataSource";
import { Ban } from "./entities/Ban";

export class GuildBans extends BaseGuildRepository {
  private bans: Repository<Ban>;

  protected createQueue: Queue;

  constructor(guildId) {
    super(guildId);
    this.bans = dataSource.getRepository(Ban);
    this.createQueue = new Queue();
  }

  async get(user_ids: number[]): Promise<Ban[]> {
    return this.bans.find({
      relations: this.getRelations(),
      where: {
        guild_id: this.guildId,
        user_id: In(user_ids),
      },
    });
  }

  async find(user_id: string): Promise<Ban | null> {
    return this.bans.findOne({
      relations: this.getRelations(),
      where: {
        guild_id: this.guildId,
        user_id,
      },
    });
  }

  async findLatest(): Promise<Ban | null> {
    return this.bans.findOne({
      where: {
        guild_id: this.guildId,
      },
      order: {
        id: "DESC",
      },
    });
  }

  async count(): Promise<number> {
    return this.bans.count({
      where: {
        guild_id: this.guildId,
      },
    });
  }

  async getMany(skip: number, take: number): Promise<Ban[]> {
    return this.bans.find({
      where: {
        guild_id: this.guildId,
      },
      order: {
        id: "ASC",
      },
      skip,
      take,
    });
  }

  async createInternal(data): Promise<InsertResult> {
    return this.createQueue.add(async () => {
      return this.bans
        .insert({
          ...data,
          guild_id: this.guildId,
        })
        .catch((err) => {
          if (err?.code === "ER_DUP_ENTRY") {
            // tslint:disable-next-line:no-console
            console.trace(`Tried to insert duplicate ban`);
          }

          throw err;
        });
    });
  }

  async create(data): Promise<Ban> {
    const result = await this.createInternal(data);
    return (await this.find(result.identifiers[0].id))!;
  }

  async update(user_id: string, data) {
    return this.bans.update({ user_id, guild_id: this.guildId }, data);
  }

  async delete(user_id: string) {
    return this.bans.delete({ user_id, guild_id: this.guildId });
  }

  async deleteAllBans(): Promise<void> {
    const idRows = await this.bans
      .createQueryBuilder()
      .where("guild_id = :guildId", { guildId: this.guildId })
      .select(["id"])
      .getRawMany<{ id: number }>();
    const ids = idRows.map((r) => r.id);
    const batches = chunkArray(ids, 500);
    for (const batch of batches) {
      await this.bans.createQueryBuilder().where("id IN (:ids)", { ids: batch }).delete().execute();
    }
  }

  async getExportBans(skip: number, take: number): Promise<Ban[]> {
    return this.bans.find({
      where: {
        guild_id: this.guildId,
      },
      order: {
        id: "ASC",
      },
      skip,
      take,
    });
  }
}
