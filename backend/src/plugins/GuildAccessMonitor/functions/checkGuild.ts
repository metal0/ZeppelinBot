import { ApiPermissions } from "@shared/apiPermissions";
import { Guild } from "discord.js";
import { GlobalPluginData } from "knub";
import { GuildAccessMonitorPluginType } from "../types";

export async function checkGuild(
  pluginData: GlobalPluginData<GuildAccessMonitorPluginType>,
  guild: Guild,
): Promise<boolean> {
  if (await pluginData.state.allowedGuilds.find(guild.id)) return true;
  if (process.env.PUBLIC) {
    console.log(`New server added: ${guild.name} (${guild.id})`);
    await pluginData.state.allowedGuilds.add(guild.id);
    await pluginData.state.configs.saveNewRevision(`guild-${guild.id}`, "plugins: {}", guild.ownerId);
    await pluginData.state.apiPermissionAssignments.addUser(guild.id, guild.ownerId, [ApiPermissions.Owner]);
    await pluginData.getKnubInstance().reloadGuild(guild.id);
    console.log(`Done setup for: ${guild.name} (${guild.id})`);
    return true;
  }
  console.log(`Non-allowed server ${guild.name} (${guild.id}), leaving`);
  guild.leave();
  return false;
}
