import { Snowflake } from "discord.js";
import * as t from "io-ts";
import { GuildPluginData } from "knub";
import { CountersPlugin } from "src/plugins/Counters/CountersPlugin";
import { canActOn } from "../../../pluginUtils";
import { renderTemplate, TemplateSafeValueContainer } from "../../../templateFormatter";
import { resolveMember } from "../../../utils";
import { ActionError } from "../ActionError";
import { CustomEventsPluginType, TCustomEvent } from "../types";

export const AddToCounterAction = t.type({
  type: t.literal("add_to_counter"),
  counter: t.string,
  amount: t.number,
  target: t.string,
});
export type TAddToCounterAction = t.TypeOf<typeof AddToCounterAction>;

export async function addToCounterAction(
  pluginData: GuildPluginData<CustomEventsPluginType>,
  action: TAddToCounterAction,
  values: TemplateSafeValueContainer,
  event: TCustomEvent,
  eventData: any,
) {
  const countersPlugin = pluginData.getPlugin(CountersPlugin);
  if (!countersPlugin.counterExists(action.counter)) {
    return;
  }
  console.log("values", values);
  console.log("eventData", eventData);
  /*
    countersPlugin.changeCounterValue(
      action.counter,
      values.msg?.channel!.id || null,
      contexts[0].user?.id || null,
      actionConfig.amount,
    );
    */
}
