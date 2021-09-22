import { MessageButton, MessageComponentInteraction, Snowflake } from "discord.js";
import { GuildPluginData } from "knub";
import diff from "lodash.difference";
import { intersection } from "lodash";
import { isValidSnowflake } from "src/utils";
import { LogsPlugin } from "../../../plugins/Logs/LogsPlugin";
import { ReactionRolesPluginType, RoleManageTypes, TButtonOpts, TButtonPairOpts } from "../types";
import { generateStatelessCustomId } from "./buttonCustomIdFunctions";
import { splitButtonsIntoRows } from "./splitButtonsIntoRows";

export async function handleOpenMenu(
  pluginData: GuildPluginData<ReactionRolesPluginType>,
  int: MessageComponentInteraction,
  group: TButtonPairOpts,
  context,
) {
  const menuButtons: MessageButton[] = [];
  if (group.button_menus == null) {
    await int.reply({
      content: `A configuration error was encountered, please contact the Administrators!`,
      ephemeral: true,
    });
    pluginData.getPlugin(LogsPlugin).logBotAlert({
      body: `**A configuration error occurred** on buttons for message ${int.message.id}, no menus found in config`,
    });
    return;
  }

  for (const menuButton of Object.values(group.button_menus[context.roleOrMenu])) {
    const customId = await generateStatelessCustomId(pluginData, context.groupName, menuButton.role_or_menu);

    const btn = new MessageButton()
      .setLabel(menuButton.label ?? "")
      .setStyle("PRIMARY")
      .setCustomId(customId)
      .setDisabled(menuButton.disabled ?? false);

    if (menuButton.emoji) {
      const emo = pluginData.client.emojis.resolve(menuButton.emoji as Snowflake) ?? menuButton.emoji;
      btn.setEmoji(emo);
    }
    menuButtons.push(btn);
  }

  if (menuButtons.length === 0) {
    await int.reply({
      content: `A configuration error was encountered, please contact the Administrators!`,
      ephemeral: true,
    });
    pluginData.getPlugin(LogsPlugin).logBotAlert({
      body: `**A configuration error occurred** on buttons for message ${int.message.id}, menu **${context.roleOrMenu}** not found in config`,
    });
    return;
  }
  const rows = splitButtonsIntoRows(menuButtons, Object.values(group.button_menus[context.roleOrMenu])); // new MessageActionRow().addComponents(menuButtons);

  int.reply({ content: `Click to add/remove a role`, components: rows, ephemeral: true });
}

export async function handleModifyRole(
  pluginData: GuildPluginData<ReactionRolesPluginType>,
  int: MessageComponentInteraction,
  group: TButtonPairOpts,
  context,
) {
  const role = await pluginData.guild.roles.fetch(context.roleOrMenu);
  if (!role) {
    await int.reply({
      content: `A configuration error was encountered, please contact the Administrators!`,
      ephemeral: true,
    });
    pluginData.getPlugin(LogsPlugin).logBotAlert({
      body: `**A configuration error occurred** on buttons for message ${int.message.id}, role **${context.roleOrMenu}** not found on server`,
    });
    return;
  }

  const member = await pluginData.guild.members.fetch(int.user.id);
  let roleGroup: TButtonOpts | undefined;
  const allRoles: Set<string> = new Set();
  for (const keyName in group.default_buttons) {
    const obj = group.default_buttons[keyName];
    if (obj.role_or_menu && isValidSnowflake(obj.role_or_menu)) allRoles.add(obj.role_or_menu);
    if (!obj.role_or_menu || obj.role_or_menu !== context.roleOrMenu) continue;
    roleGroup = obj;
  }
  if (group.button_menus && !roleGroup) {
    for (const keyName in group.button_menus) {
      const obj = group.button_menus[keyName];
      for (const menuName in obj) {
        const obj2 = obj[menuName];
        if (obj2.role_or_menu && isValidSnowflake(obj2.role_or_menu)) allRoles.add(obj2.role_or_menu);
        if (!obj2.role_or_menu || obj2.role_or_menu !== context.roleOrMenu) continue;
        roleGroup = obj2;
      }
    }
  }
  try {
    const oldMemberRoles = [...member.roles.cache.keys()];
    const matchedRoles = intersection(oldMemberRoles, group.exclusive_roles ? [...allRoles] : [role.id]);
    const newRoles = oldMemberRoles.filter((r) => !matchedRoles.includes(r) || r === pluginData.guild.id); // lol
    if (member.roles.cache.has(role.id)) {
      if (roleGroup?.role_type === RoleManageTypes.add) {
        await int.reply({ content: `You cannot remove the <@&${role.id}> role`, ephemeral: true });
        return;
      }
    } else {
      if (roleGroup?.role_type === RoleManageTypes.remove) {
        await int.reply({ content: `You cannot add the <@&${role.id}> role`, ephemeral: true });
        return;
      }
    }
    if (group.exclusive_roles) {
      if (member.roles.cache.has(role.id)) {
        await member.edit({ roles: newRoles }, `Button Roles on message ${int.message.id}`);
      } else {
        newRoles.push(role.id);
        await member.edit({ roles: [...new Set(newRoles)] }, `Button Roles on message ${int.message.id}`);
      }
    } else {
      if (member.roles.cache.has(role.id)) {
        await member.roles.remove(role, `Button Roles on message ${int.message.id}`);
        if (newRoles.includes(role.id)) newRoles.splice(newRoles.indexOf(role.id), 1);
      } else {
        newRoles.push(role.id);
        await member.roles.add(role, `Button Roles on message ${int.message.id}`);
      }
    }

    const added = diff(newRoles, oldMemberRoles).map((g) => `<@&${g}>`);
    const removed = diff(oldMemberRoles, newRoles).map((g) => `<@&${g}>`);
    if (added.length > 0 || removed.length > 0) {
      await int.reply({
        content: `${added.length > 0 ? `Role(s) added: ${added.join(" ")}\n` : ""}${
          removed.length > 0 ? `Role(s) removed: ${removed.join(" ")}` : ""
        }`,
        ephemeral: true,
      });
    } else {
      await int.deferUpdate();
    }
  } catch (e) {
    await int.reply({
      content: "A configuration error was encountered, please contact the Administrators!",
      ephemeral: true,
    });
    pluginData.getPlugin(LogsPlugin).logBotAlert({
      body: `**A configuration error occurred** on buttons for message ${int.message.id}, error: ${e}. We might be missing permissions!`,
    });
  }
}
