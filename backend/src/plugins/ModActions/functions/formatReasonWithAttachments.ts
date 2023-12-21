import { Message } from "discord.js";

export function formatReasonWithAttachments(reason: string, message: Message) {
  return message.attachments.size > 0 ? ((reason || "") + " " + message.url).trim() : reason;
}
