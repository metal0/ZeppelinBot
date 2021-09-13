import * as t from "io-ts";
import { GuildPluginData } from "knub";
import { CountersPlugin } from "src/plugins/Counters/CountersPlugin";
import { renderTemplate, TemplateSafeValueContainer } from "../../../templateFormatter";
import { resolveMember } from "../../../utils";
import { ActionError } from "../ActionError";
import { CustomEventsPluginType, TCustomEvent } from "../types";

export const SetCounterAction = t.type({
  type: t.literal("set_counter"),
  counter: t.string,
  value: t.number,
  target: t.string,
});
export type TSetCounterAction = t.TypeOf<typeof SetCounterAction>;

export async function setCounterAction(
  pluginData: GuildPluginData<CustomEventsPluginType>,
  action: TSetCounterAction,
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

  countersPlugin.setCounterValue(
    action.counter,
    eventData.msg?.channelId || null,
    target ? targetId : null,
    action.value,
  );
}
