import * as t from "io-ts";
import { guildPluginEventListener } from "knub";
import { GuildBans } from "../../data/GuildBans";
import { makeIoTsConfigParser } from "../../pluginUtils";
import { noop } from "../../utils.js";
import { zeppelinGuildPlugin } from "../ZeppelinPluginBlueprint";
import { SyncBansCmd } from "./commands/SyncBansCmd.js";
import { GuildBanSyncPluginType } from "./types";

// The `any` cast here is to prevent TypeScript from locking up from the circular dependency
function getLogsPlugin(): Promise<any> {
  return import("../Logs/LogsPlugin.js") as Promise<any>;
}

export const GuildBanSyncPlugin = zeppelinGuildPlugin<GuildBanSyncPluginType>()({
  name: "guild_ban_sync",
  showInDocs: false,

  dependencies: async () => [(await getLogsPlugin()).LogsPlugin],

  configParser: makeIoTsConfigParser(t.type({})),

  messageCommands: [SyncBansCmd],

  events: [
    // TODO: add guildCreate listener when supported on Knub to sync on guild add

    guildPluginEventListener({
      event: "guildBanAdd",
      async listener({ pluginData, args }) {
        await pluginData.state.bans.create({ user_id: args.ban.user.id }).catch(noop);
      },
    }),

    guildPluginEventListener({
      event: "guildBanRemove",
      async listener({ pluginData, args }) {
        await pluginData.state.bans.delete(args.ban.user.id).catch(noop);
      },
    }),
  ],

  afterLoad(pluginData) {
    pluginData.state.initialized = false;
    pluginData.state.bans = GuildBans.getGuildInstance(pluginData.guild.id);
  },
});
