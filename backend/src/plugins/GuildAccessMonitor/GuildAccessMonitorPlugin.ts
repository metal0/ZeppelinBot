import { ApiPermissions } from "@shared/apiPermissions";
import { Guild } from "discord.js";
import * as t from "io-ts";
import { BasePluginType, GlobalPluginData, typedGlobalEventListener } from "knub";
import { ApiPermissionAssignments } from "src/data/ApiPermissionAssignments";
import { Configs } from "src/data/Configs";
import { AllowedGuilds } from "../../data/AllowedGuilds";
import { zeppelinGlobalPlugin } from "../ZeppelinPluginBlueprint";

interface GuildAccessMonitorPluginType extends BasePluginType {
  config: {};
  state: {
    allowedGuilds: AllowedGuilds;
    apiPermissionAssignments: ApiPermissionAssignments;
    configs: Configs;
  };
}

async function checkGuild(pluginData: GlobalPluginData<GuildAccessMonitorPluginType>, guild: Guild) {
  if (!(await pluginData.state.allowedGuilds.find(guild.id))) {
    if (process.env.PUBLIC) {
      console.log(`New server added: ${guild.name} (${guild.id})`);
      await pluginData.state.allowedGuilds.add(guild.id);
      await pluginData.state.configs.saveNewRevision(`guild-${guild.id}`, "plugins: {}", guild.ownerId);
      await pluginData.state.apiPermissionAssignments.addUser(guild.id, guild.ownerId, [ApiPermissions.Owner]);
      await pluginData.getKnubInstance().reloadGuild(guild.id);
      console.log(`Done setup for: ${guild.name} (${guild.id})`);
      return;
    }
    console.log(`Non-allowed server ${guild.name} (${guild.id}), leaving`);
    guild.leave();
  } else {
    const ownerPerms = await pluginData.state.apiPermissionAssignments.getByGuildAndUserId(guild.id, guild.ownerId);
    if (!ownerPerms || !ownerPerms.permissions.includes(ApiPermissions.Owner)) {
      const oldPerms = ownerPerms ? [...ownerPerms.permissions] : [];
      await pluginData.state.apiPermissionAssignments.updateUser(guild.id, guild.ownerId, [
        ...oldPerms,
        ApiPermissions.Owner,
      ]);
    }
  }
}

/**
 * Global plugin to monitor if Zeppelin is invited to a non-whitelisted server, and leave it
 */
export const GuildAccessMonitorPlugin = zeppelinGlobalPlugin<GuildAccessMonitorPluginType>()({
  name: "guild_access_monitor",
  configSchema: t.type({}),

  events: [
    typedGlobalEventListener<GuildAccessMonitorPluginType>()({
      event: "guildCreate",
      listener({ pluginData, args: { guild } }) {
        checkGuild(pluginData, guild);
      },
    }),
  ],

  beforeLoad(pluginData) {
    pluginData.state.allowedGuilds = new AllowedGuilds();
    pluginData.state.configs = new Configs();
    pluginData.state.apiPermissionAssignments = new ApiPermissionAssignments();
  },

  afterLoad(pluginData) {
    for (const guild of pluginData.client.guilds.cache.values()) {
      checkGuild(pluginData, guild);
    }
  },
});
