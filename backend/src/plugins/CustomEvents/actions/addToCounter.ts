import * as t from "io-ts";
import { GuildPluginData } from "knub";
import { CountersPlugin } from "src/plugins/Counters/CountersPlugin";
import { emitCounterEvent } from "src/plugins/Counters/functions/emitCounterEvent";
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
  const targetId = await renderTemplate(action.target, values, false);
  const target = await resolveMember(pluginData.client, pluginData.guild, targetId);
  if (!target && action.target) throw new ActionError(`Unknown target member: ${targetId}`);

  countersPlugin.changeCounterValue(
    action.counter,
    eventData.msg?.channelId || null,
    target ? targetId : null,
    action.amount,
  );
}
