import { APIEmbed, ImageFormat } from "discord.js";
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
      const member = await pluginData.guild.members.fetch(user.id).catch(() => null);
      const embed: APIEmbed = {
        image: {
          url: (member ?? user).displayAvatarURL({ extension: ImageFormat.PNG, size: 2048 }),
        },
        title: `Avatar of ${renderUserUsername(user)}:`,
      };

      await msg.channel.send({ embeds: [embed] });
    } else {
      await sendErrorMessage(pluginData, msg.channel, "Invalid user ID");
    }
  },
});
