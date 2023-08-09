import { PluginOptions } from "knub";
import { makeIoTsConfigParser } from "../../pluginUtils";
import { zeppelinGuildPlugin } from "../ZeppelinPluginBlueprint";
import { ConfigSchema, GlobalPluginType } from "./types";

const defaultOptions: PluginOptions<GlobalPluginType> = {
  config: {
    success_emoji: "✅",
    error_emoji: "❌",
  },
};

export const GlobalPlugin = zeppelinGuildPlugin<GlobalPluginType>()({
  name: "global",
  showInDocs: false,
  info: {
    prettyName: "Global",
  },

  dependencies: () => [],
  configParser: makeIoTsConfigParser(ConfigSchema),
  defaultOptions,
});
