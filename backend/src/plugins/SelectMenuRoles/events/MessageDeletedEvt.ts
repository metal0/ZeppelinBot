import { interactionEvt } from "../types";

export const MessageDeletedEvt = interactionEvt({
  event: "messageDelete",
  allowBots: true,
  allowSelf: true,

  async listener(meta) {
    const pluginData = meta.pluginData;

    await pluginData.state.selectMenus.removeAllForMessageId(meta.args.message.id);
  },
});
