import { GuildMember, Snowflake } from "discord.js";
import { GuildPluginData } from "knub";
import { MutesPluginType } from "../types";

export function memberHasMutedRole(pluginData: GuildPluginData<MutesPluginType>, member: GuildMember): boolean {
  const muteRole = pluginData.config.get().mute_role;
  if (!muteRole) {
    if (!member.communicationDisabledUntil) return false;
    const diff = new Date(member.communicationDisabledUntil).getTime() - Date.now();
    return diff > 10 * 1000;
  }
  return muteRole ? member.roles.cache.has(muteRole as Snowflake) : false;
}
