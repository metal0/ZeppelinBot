import { MessageComponentInteraction } from "discord.js";
import humanizeDuration from "humanize-duration";
import moment from "moment";
import { logger } from "src/logger";
import { LogsPlugin } from "src/plugins/Logs/LogsPlugin";
import { MINUTES } from "src/utils";
import { idToTimestamp } from "src/utils/idToTimestamp";
import { interactionEvt } from "../types";
import { handleModifyRole } from "../util/buttonActionHandlers";
import { MENU_CONTEXT_SEPARATOR, resolveStatefulCustomId } from "../util/buttonCustomIdFunctions";
import { SelectMenuActions } from "../util/buttonMenuActions";

const INVALIDATION_TIME = 15 * MINUTES;

export const InteractionEvt = interactionEvt({
  event: "interactionCreate",

  async listener(meta) {
    const int = meta.args.interaction;
    if (!int.isMessageComponent() || !int.isSelectMenu()) return;

    const cfg = meta.pluginData.config.get();
    const split = int.customId.split(MENU_CONTEXT_SEPARATOR);
    const context = (await resolveStatefulCustomId(meta.pluginData, int.customId)) ?? {
      groupName: split[0],
      menuName: split[1],
      action: split[2],
      stateless: true,
    };

    if (context.stateless) {
      const timeSinceCreation = moment.utc().valueOf() - idToTimestamp(int.message.id)!;
      if (timeSinceCreation >= INVALIDATION_TIME) {
        sendEphemeralReply(
          int,
          `Sorry, but these buttons are invalid because they are older than ${humanizeDuration(
            INVALIDATION_TIME,
          )}.\nIf the menu is still available, open it again to assign yourself roles!`,
        );
        return;
      }
    }

    const group = cfg.select_groups[context.groupName];
    if (!group) {
      await sendEphemeralReply(int, `A configuration error was encountered, please contact the Administrators!`);
      meta.pluginData.getPlugin(LogsPlugin).logBotAlert({
        body: `**A configuration error occurred** on select menus for message ${int.message.id}, group **${context.groupName}** not found in config`,
      });
      return;
    }

    // Verify that detected action is known by us
    if (!(<any>Object).values(SelectMenuActions).includes(context.action)) {
      await sendEphemeralReply(int, `A internal error was encountered, please contact the Administrators!`);
      meta.pluginData.getPlugin(LogsPlugin).logBotAlert({
        body: `**A internal error occurred** on select menus for message ${int.message.id}, action **${context.action}** is not known`,
      });
      return;
    }

    if (context.action === SelectMenuActions.MODIFY_ROLE) {
      await handleModifyRole(meta.pluginData, int, group, context);
      return;
    }

    logger.warn(
      `Action ${context.action} on select menu ${int.customId} (Guild: ${int.guildId}, Channel: ${int.channelId}) is unknown!`,
    );
    await sendEphemeralReply(int, `A internal error was encountered, please contact the Administrators!`);
  },
});

async function sendEphemeralReply(interaction: MessageComponentInteraction, message: string) {
  await interaction.reply({ content: message, ephemeral: true });
}
