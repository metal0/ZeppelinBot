import { Attachment, Message } from "discord.js";

export function formatReasonWithMessageLinkForAttachments(reason: string, message: Message) {
  return message.attachments.size > 0 ? ((reason || "") + " " + message.url).trim() : reason;
}

export function formatReasonWithAttachments(reason: string, attachments: Attachment[]) {
  const attachmentUrls = attachments.map((a) => a.url);
  return ((reason || "") + " " + attachmentUrls.join(" ")).trim();
}
