import {
  ActionRow,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonComponent,
  ButtonStyle,
  GuildTextBasedChannel,
  Message,
  MessageActionRowComponentBuilder,
  MessageComponentInteraction,
  MessageCreateOptions,
  MessagePayloadOption,
  TextChannel,
} from "discord.js";
import { noop } from "knub/dist/utils";
import moment from "moment";
import uuidv4 from "uuid/v4";

export async function waitForButtonConfirm(
  channel: GuildTextBasedChannel,
  toPost: MessageCreateOptions,
  options?: WaitForOptions,
): Promise<boolean> {
  return new Promise(async (resolve) => {
    const idMod = `${channel.guild.id}-${moment.utc().valueOf()}`;
    const row = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents([
      new ButtonBuilder()
        .setStyle(ButtonStyle.Success)
        .setLabel(options?.confirmText || "Confirm")
        .setCustomId(`confirmButton:${idMod}:${uuidv4()}`),

      new ButtonBuilder()
        .setStyle(ButtonStyle.Danger)
        .setLabel(options?.cancelText || "Cancel")
        .setCustomId(`cancelButton:${idMod}:${uuidv4()}`),
    ]);
    const message = await channel.send({ ...toPost, components: [row] });

    const collector = message.createMessageComponentCollector({ time: 10000 });

    collector.on("collect", (interaction: MessageComponentInteraction) => {
      if (options?.restrictToId && options.restrictToId !== interaction.user.id) {
        interaction
          .reply({ content: `You are not permitted to use these buttons.`, ephemeral: true })
          .catch((err) => console.trace(err.message));
      } else {
        if (interaction.customId.startsWith(`confirmButton:${idMod}:`)) {
          message.delete();
          resolve(true);
        } else if (interaction.customId.startsWith(`cancelButton:${idMod}:`)) {
          message.delete();
          resolve(false);
        }
      }
    });
    collector.on("end", () => {
      if (message.deletable) message.delete().catch(noop);
      resolve(false);
    });
  });
}

export interface WaitForOptions {
  restrictToId?: string;
  confirmText?: string;
  cancelText?: string;
}
