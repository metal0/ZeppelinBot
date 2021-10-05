import { Snowflake } from "discord.js";
import { GuildPluginData } from "knub";
import { SelectMenuRolesPluginType } from "../types";
import { SelectMenuActions } from "./buttonMenuActions";

export const MENU_CONTEXT_SEPARATOR = ":rm:";

export async function generateStatelessCustomId(
  pluginData: GuildPluginData<SelectMenuRolesPluginType>,
  groupName: string,
  menuName: string,
) {
  let id = groupName + MENU_CONTEXT_SEPARATOR + menuName + MENU_CONTEXT_SEPARATOR;

  id += `${SelectMenuActions.MODIFY_ROLE}`;

  return id;
}

export async function resolveStatefulCustomId(pluginData: GuildPluginData<SelectMenuRolesPluginType>, id: string) {
  const menu = await pluginData.state.selectMenus.getForSelectId(id);

  if (menu) {
    const group = pluginData.config.get().select_groups[menu.menu_group];
    if (!group) return null;
    const cfgButton = group.menus[menu.menu_name];

    return {
      groupName: menu.menu_group,
      menuName: menu.menu_name,
      action: SelectMenuActions.MODIFY_ROLE,
      stateless: false,
    };
  } else {
    return null;
  }
}
