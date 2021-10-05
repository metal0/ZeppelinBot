import * as t from "io-ts";
import { typedGlobalEventListener } from "knub";
import { ApiPermissionAssignments } from "src/data/ApiPermissionAssignments";
import { Configs } from "src/data/Configs";
import { AllowedGuilds } from "../../data/AllowedGuilds";
import { zeppelinGlobalPlugin } from "../ZeppelinPluginBlueprint";
import { checkGuild } from "./functions/checkGuild";
import { checkGuildOwnerPermissions } from "./functions/checkOwnerPerms";
import { GuildAccessMonitorPluginType } from "./types";

/**
 * Global plugin to monitor if Zeppelin is invited to a non-whitelisted server, and leave it
 */
export const GuildAccessMonitorPlugin = zeppelinGlobalPlugin<GuildAccessMonitorPluginType>()({
  name: "guild_access_monitor",
  configSchema: t.type({}),

  events: [
    typedGlobalEventListener<GuildAccessMonitorPluginType>()({
      event: "guildCreate",
      async listener({ pluginData, args: { guild } }) {
        if (await checkGuild(pluginData, guild)) {
          await checkGuildOwnerPermissions(pluginData, guild.id, guild.ownerId);
          await guild.members.fetch();
        }
      },
    }),
  ],

  beforeLoad(pluginData) {
    pluginData.state.allowedGuilds = new AllowedGuilds();
    pluginData.state.configs = new Configs();
    pluginData.state.apiPermissionAssignments = new ApiPermissionAssignments();
  },

  async afterLoad(pluginData) {
    for (const guild of pluginData.client.guilds.cache.values()) {
      if (await checkGuild(pluginData, guild)) {
        await checkGuildOwnerPermissions(pluginData, guild.id, guild.ownerId);
        await guild.members.fetch();
      }
    }
  },
});
