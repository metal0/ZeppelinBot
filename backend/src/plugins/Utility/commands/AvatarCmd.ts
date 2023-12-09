import { AttachmentBuilder } from "discord.js";
import { commandTypeHelpers as ct } from "../../../commandTypes";
import { sendErrorMessage } from "../../../pluginUtils";
import { UnknownUser, renderUserUsername } from "../../../utils";
import { utilityCmd } from "../types";

export const AvatarCmd = utilityCmd({
  trigger: ["avatar", "av"],
  description: "Retrieves a user's profile picture",
  permission: "can_avatar",

  signature: {
    user: ct.resolvedUserLoose({ required: false }),
  },

  async run({ message: msg, args, pluginData }) {
    const user = args.user || msg.author;

    if (!(user instanceof UnknownUser)) {
      const config = pluginData.config.get();
      const member = await pluginData.guild.members.fetch(user.id).catch(() => null);
      const url = (member ?? user).displayAvatarURL({ size: 2048 });
      const title = `Avatar of ${renderUserUsername(user)}:`;

      await msg.channel.send(
        config.avatar_spoilered
          ? { content: title, files: [new AttachmentBuilder(url, { name: "SPOILER_avatar.png" })] }
          : { embeds: [{ image: { url }, title, color: config.embed_colour ?? config.embed_color }] },
      );
    } else {
      await sendErrorMessage(pluginData, msg.channel, "Invalid user ID");
    }
  },
});
