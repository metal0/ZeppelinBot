import { SelectMenuInteraction } from "discord.js";
import { GuildPluginData } from "knub";
import { LogsPlugin } from "../../Logs/LogsPlugin";
import { SelectMenuRolesPluginType, TSelectMenuPairOpts } from "../types";
import { addMemberPendingRoleChange } from "./addMemberPendingRoleChange";

export async function handleModifyRole(
  pluginData: GuildPluginData<SelectMenuRolesPluginType>,
  int: SelectMenuInteraction,
  group: TSelectMenuPairOpts,
  context,
) {
  const values = int.values;
  const menuName = context.menuName;
  if (!values) return;
  const guildRoles = await pluginData.guild.roles.fetch();
  for (const i in values) {
    if (!guildRoles.find((rl) => rl.id === values[i])) {
      await int.reply({
        content: `A configuration error was encountered, please contact the Administrators!`,
        ephemeral: true,
      });
      pluginData.getPlugin(LogsPlugin).logBotAlert({
        body: `**A configuration error occurred** on select menus for message ${int.message.id}, role **${values[i]}** not found on server`,
      });
      return;
    }
  }

  try {
    const member = await pluginData.guild.members.fetch(int.user.id);
    const configuredRoles: string[] = [];
    const menuGroup = group.menus[menuName];
    for (const key in menuGroup.items) {
      configuredRoles.push(menuGroup.items[key].role);
    }
    const memberRoles = Array.from(member.roles.cache.keys());
    const toAdd = configuredRoles.filter((rl) => values.includes(rl) && !memberRoles.includes(rl));
    const toRemove = configuredRoles.filter(
      (rl) => !toAdd.includes(rl) && memberRoles.includes(rl) && !values.includes(rl),
    );
    toAdd.forEach((r) => addMemberPendingRoleChange(pluginData, member.id, "+", r));
    toRemove.forEach((r) => addMemberPendingRoleChange(pluginData, member.id, "-", r));
    await int.deferUpdate();
  } catch (e) {
    await int.reply({
      content: "A configuration error was encountered, please contact the Administrators!",
      ephemeral: true,
    });
    pluginData.getPlugin(LogsPlugin).logBotAlert({
      body: `**A configuration error occurred** on select menus for message ${int.message.id}, error: ${e}. We might be missing permissions!`,
    });
  }
}
