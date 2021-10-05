import { MessageActionRow, MessageSelectMenu } from "discord.js";
import { TSelectMenuOpts } from "../types";

export function splitButtonsIntoRows(
  actualMenus: MessageSelectMenu[],
  configButtons: TSelectMenuOpts[],
): MessageActionRow[] {
  const rows: MessageActionRow[] = [];
  let curRow = new MessageActionRow();

  for (const item of actualMenus) {
    curRow.addComponents(item);
    rows.push(curRow);
    curRow = new MessageActionRow();
  }

  if (curRow.components.length >= 1) rows.push(curRow);
  return rows;
}
