import * as t from "io-ts";
import { ChannelTypeStrings } from "../../../types";
import { noop } from "../../../utils";
import { automodAction } from "../helpers";

export const CrosspostMessageAction = automodAction({
  configType: t.type({}),
  defaultConfig: {},

  async apply({ pluginData, contexts }) {
    const messages = await Promise.all(
      contexts
        .filter((c) => c.message?.id)
        .map(async (c) => {
          const channel = await pluginData.guild.channels.fetch(c.message!.channel_id).catch(noop);
          if (channel?.type === ChannelTypeStrings.NEWS && channel.isText()) {
            // .isText() to fix the typings
            return channel.messages.fetch(c.message!.id).catch(noop);
          }
          return null;
        }),
    );

    for await (const msg of messages) {
      if (msg?.crosspostable) await msg?.crosspost().catch(noop);
    }
  },
});
