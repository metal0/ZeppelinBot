import * as t from "io-ts";
import { automodTrigger } from "../helpers";

export const MemberLeaveTrigger = automodTrigger<unknown>()({
  configType: t.type({}),

  defaultConfig: {},

  async match({ pluginData, context, triggerConfig }) {
    if (context.joined || !context.partialMember) {
      return;
    }

    return {};
  },

  renderMatchInformation({ pluginData, contexts, triggerConfig }) {
    return "";
  },
});
