import { BasePluginType } from "knub";
import { GuildBans } from "../../data/GuildBans.js";

export interface GuildBanSyncPluginType extends BasePluginType {
  state: {
    initialized: boolean;
    bans: GuildBans;
  };
}
