import * as t from "io-ts";
import { typedGlobalEventListener } from "knub";
import { ApiPermissionAssignments } from "src/data/ApiPermissionAssignments";
import { Configs } from "src/data/Configs";
import { AllowedGuilds } from "../../data/AllowedGuilds";
import { zeppelinGlobalPlugin } from "../ZeppelinPluginBlueprint";
import { checkGuild } from "./functions/checkGuild";
import { checkGuildOwnerPermissions } from "./functions/checkOwnerPerms";
import { GuildAccessMonitorPluginType } from "./types";
import { env } from "../../env";
import { noop } from "../../utils.js";

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
          await guild.members.fetch().catch(noop);
        }
      },
    }),
  ],

  async beforeLoad(pluginData) {
    pluginData.state.allowedGuilds = new AllowedGuilds();

    const defaultAllowedServers = env.DEFAULT_ALLOWED_SERVERS || [];
    const configs = new Configs();
    for (const serverId of defaultAllowedServers) {
      if (!(await pluginData.state.allowedGuilds.isAllowed(serverId))) {
        // tslint:disable-next-line:no-console
        console.log(`Adding allowed-by-default server ${serverId} to the allowed servers`);
        await pluginData.state.allowedGuilds.add(serverId);
        await configs.saveNewRevision(`guild-${serverId}`, "plugins: {}", 0);
      }
    }
  },

  async afterLoad(pluginData) {
    for (const guild of pluginData.client.guilds.cache.values()) {
      if (await checkGuild(pluginData, guild)) {
        await checkGuildOwnerPermissions(pluginData, guild.id, guild.ownerId);
        await guild.members.fetch().catch(noop);
      }
    }
  },
});
