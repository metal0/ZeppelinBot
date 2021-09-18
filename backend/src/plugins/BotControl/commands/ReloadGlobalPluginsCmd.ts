import { TextChannel } from "discord.js";
import { getActiveReload, setActiveReload } from "../activeReload";
import { botControlCmd } from "../types";

export const ReloadGlobalPluginsCmd = botControlCmd({
  trigger: "bot_reload_global_plugins",
  permission: "can_admin",

  async run({ pluginData, message }) {
    if (getActiveReload()) return;

    setActiveReload((message.channel as TextChannel).guild?.id, message.channel.id);
    await message.channel.send("Reloading global plugins...");

    pluginData.getKnubInstance().reloadGlobalContext();
  },
});
