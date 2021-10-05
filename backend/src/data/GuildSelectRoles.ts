import { getRepository, Repository } from "typeorm";
import { BaseGuildRepository } from "./BaseGuildRepository";
import { SelectRole } from "./entities/SelectRole";

export class GuildSelectRoles extends BaseGuildRepository {
  private selectRoles: Repository<SelectRole>;

  constructor(guildId) {
    super(guildId);
    this.selectRoles = getRepository(SelectRole);
  }

  async getForSelectId(selectId: string) {
    return this.selectRoles.findOne({
      guild_id: this.guildId,
      menu_id: selectId,
    });
  }

  async getAllForMessageId(messageId: string) {
    return this.selectRoles.find({
      guild_id: this.guildId,
      message_id: messageId,
    });
  }

  async removeForButtonId(selectId: string) {
    return this.selectRoles.delete({
      guild_id: this.guildId,
      menu_id: selectId,
    });
  }

  async removeAllForMessageId(messageId: string) {
    return this.selectRoles.delete({
      guild_id: this.guildId,
      message_id: messageId,
    });
  }

  async getForButtonGroup(selectGroup: string) {
    return this.selectRoles.find({
      guild_id: this.guildId,
      menu_group: selectGroup,
    });
  }

  async add(channelId: string, messageId: string, menuId: string, menuGroup: string, menuName: string) {
    await this.selectRoles.insert({
      guild_id: this.guildId,
      channel_id: channelId,
      message_id: messageId,
      menu_id: menuId,
      menu_group: menuGroup,
      menu_name: menuName,
    });
  }
}
