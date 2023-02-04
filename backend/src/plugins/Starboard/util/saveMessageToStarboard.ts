import { Message, MessageEmbedOptions, Snowflake, TextChannel } from "discord.js";
import { GuildPluginData } from "knub";
import { noop } from "../../../utils.js";
import { StarboardPluginType, TStarboardOpts } from "../types";
import { createStarboardEmbedFromMessage } from "./createStarboardEmbedFromMessage";
import { createStarboardPseudoFooterForMessage } from "./createStarboardPseudoFooterForMessage";

export async function saveMessageToStarboard(
  pluginData: GuildPluginData<StarboardPluginType>,
  msg: Message,
  starboard: TStarboardOpts,
) {
  const channel = await pluginData.guild.channels.fetch(starboard.channel_id as Snowflake).catch(noop);
  if (!channel) return;

  const starCount = (await pluginData.state.starboardReactions.getAllReactionsForMessageId(msg.id)).length;
  const embed = createStarboardEmbedFromMessage(msg, Boolean(starboard.copy_full_embed), starboard.color);
  embed.fields!.push(createStarboardPseudoFooterForMessage(starboard, msg, starboard.star_emoji![0], starCount));

  const starboardMessage = await (channel as TextChannel).send({ embeds: [embed as MessageEmbedOptions] });
  await pluginData.state.starboardMessages.createStarboardMessage(channel.id, msg.id, starboardMessage.id);
}
