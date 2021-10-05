import { PluginOptions } from "knub";
import { ConfigPreprocessorFn } from "knub/dist/config/configTypes";
import { GuildSelectRoles } from "src/data/GuildSelectRoles";
import { Queue } from "src/Queue";
import { isValidSnowflake } from "src/utils";
import { StrictValidationError } from "src/validatorUtils";
import { GuildSavedMessages } from "../../data/GuildSavedMessages";
import { LogsPlugin } from "../Logs/LogsPlugin";
import { zeppelinGuildPlugin } from "../ZeppelinPluginBlueprint";
import { PostSelectRolesCmd } from "./commands/PostSelectRolesCmd";
import { InteractionEvt } from "./events/ButtonInteractionEvt";
import { ConfigSchema, SelectMenuRolesPluginType } from "./types";
import { getRowCount } from "./util/splitMenusIntoRows";

const defaultOptions: PluginOptions<SelectMenuRolesPluginType> = {
  config: {
    select_groups: {},

    can_manage: false,
  },

  overrides: [
    {
      level: ">=100",
      config: {
        can_manage: true,
      },
    },
  ],
};

const MAXIMUM_COMPONENT_ROWS = 5;

const configPreprocessor: ConfigPreprocessorFn<SelectMenuRolesPluginType> = (options) => {
  if (options.config.select_groups) {
    for (const [groupName, group] of Object.entries(options.config.select_groups)) {
      const defaultSelectMenuNames = Object.keys(group.menus);
      const defaultMenus = Object.values(group.menus);
      const menuNames = Object.keys(group.menus ?? []);

      const defaultMenuRowCount = getRowCount(defaultMenus);
      if (defaultMenuRowCount > MAXIMUM_COMPONENT_ROWS || defaultMenuRowCount === 0) {
        throw new StrictValidationError([
          `Invalid row count for menus: You currently have ${defaultMenuRowCount}, the maximum is 5. A new row is started automatically each 5 consecutive menus.`,
        ]);
      }

      for (let i = 0; i < defaultMenus.length; i++) {
        const defMenu = defaultMenus[i];
        if (defMenu.maxValues && (defMenu.maxValues > 25 || defMenu.maxValues < 1)) {
          throw new StrictValidationError([
            `Invalid value for menus/${defaultSelectMenuNames[i]}/maxValues: Maximum Values Must be between 1 and 25`,
          ]);
        }
        if (defMenu.minValues && (defMenu.minValues > 25 || defMenu.minValues < 0)) {
          throw new StrictValidationError([
            `Invalid value for menus/${defaultSelectMenuNames[i]}/maxValues: Minimum Values Must be between 0 and 25`,
          ]);
        }
        if (defMenu.items.length > 25) {
          throw new StrictValidationError([
            `Invalid values for menus/${defaultSelectMenuNames[i]}/items: Can only have up to 25 items per menu.`,
          ]);
        }
        for (let i2 = 0; i2 < defMenu.items.length; i2++) {
          const item = defMenu.items[i2];

          if (!isValidSnowflake(item.role)) {
            throw new StrictValidationError([
              `Invalid value for menus/${defaultSelectMenuNames[i]}/items/${i2}/role: ${item.role} is not a valid snowflake.`,
            ]);
          }
          if (!item.label && !item.emoji) {
            throw new StrictValidationError([
              `Invalid values for menus/${defaultSelectMenuNames[i]}/items/${i2}/(label|emoji): Must have label, emoji or both set for the select menu to be valid.`,
            ]);
          }
        }
      }
    }
  }

  return options;
};

export const SelectMenuRolesPlugin = zeppelinGuildPlugin<SelectMenuRolesPluginType>()({
  name: "select_menu_roles",
  showInDocs: true,
  info: {
    prettyName: "Select menu roles",
  },

  dependencies: () => [LogsPlugin],
  configSchema: ConfigSchema,
  defaultOptions,

  // prettier-ignore
  commands: [
    PostSelectRolesCmd,
  ],

  // prettier-ignore
  events: [
    InteractionEvt,
  ],
  configPreprocessor,

  beforeLoad(pluginData) {
    const { state, guild } = pluginData;

    state.savedMessages = GuildSavedMessages.getGuildInstance(guild.id);
    state.selectMenus = GuildSelectRoles.getGuildInstance(guild.id);
    state.roleChangeQueue = new Queue();
    state.pendingRoleChanges = new Map();
  },
});
