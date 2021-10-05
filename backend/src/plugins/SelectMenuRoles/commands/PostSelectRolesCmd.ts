import { createHash } from "crypto";
import { MessageButton, MessageSelectMenu, Snowflake, MessageSelectOptionData } from "discord.js";
import moment from "moment";
import { sendErrorMessage, sendSuccessMessage } from "src/pluginUtils";
import { commandTypeHelpers as ct } from "../../../commandTypes";
import { selectRolesCmd } from "../types";
import { splitButtonsIntoRows } from "../util/splitMenusIntoRows";

export const PostSelectRolesCmd = selectRolesCmd({
  trigger: "select_roles post",
  permission: "can_manage",

  signature: {
    channel: ct.textChannel(),
    selectGroup: ct.string(),
  },

  async run({ message: msg, args, pluginData }) {
    const cfg = pluginData.config.get();
    if (!cfg.select_groups) {
      sendErrorMessage(pluginData, msg.channel, "No select menu groups defined in config");
      return;
    }
    const group = cfg.select_groups[args.selectGroup];

    if (!group) {
      sendErrorMessage(pluginData, msg.channel, `No select menu group matches the name **${args.selectGroup}**`);
      return;
    }

    const selectMenus: MessageSelectMenu[] = [];
    const toInsert: Array<{ customId; selectGroup; menuName }> = [];
    for (const [menuName, menu] of Object.entries(group.menus)) {
      const customId = createHash("md5").update(`${menuName}${moment.utc().valueOf()}`).digest("hex");
      const opts: MessageSelectOptionData[] = [];
      for (const [k, item] of Object.entries(menu.items)) {
        opts.push({
          label: item.label,
          description: item.description ?? "",
          default: item.default ?? false,
          value: item.role,
          emoji: item.emoji ? pluginData.client.emojis.resolve(item.emoji as Snowflake) ?? item.emoji : undefined,
        });
      }
      const slm = new MessageSelectMenu()
        .setMinValues(menu.minValues ?? 1)
        .setMaxValues(menu.maxValues ?? 1)
        .setCustomId(customId)
        .setDisabled(menu.disabled ?? false);
      if (menu.placeholder) slm.setPlaceholder(menu.placeholder);
      slm.addOptions(...opts);
      selectMenus.push(slm);

      toInsert.push({ customId, selectGroup: args.selectGroup, menuName });
    }
    const rows = splitButtonsIntoRows(selectMenus, Object.values(group.menus)); // new MessageActionRow().addComponents(buttons);

    try {
      const newMsg = await args.channel.send({ content: group.message, components: rows });

      for (const btn of toInsert) {
        await pluginData.state.selectMenus.add(args.channel.id, newMsg.id, btn.customId, btn.selectGroup, btn.menuName);
      }
    } catch (e) {
      sendErrorMessage(pluginData, msg.channel, `Error trying to post message: ${e}`);
      return;
    }

    await sendSuccessMessage(pluginData, msg.channel, `Successfully posted message in <#${args.channel.id}>`);
  },
});
