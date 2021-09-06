import { trimPluginDescription } from "src/utils";
import { TemplateFunction } from "./types";

export function generateTemplateMarkdown(definitions: TemplateFunction[]): string {
  return definitions
    .map(def => {
      const usage = def.signature ?? `(${def.arguments.join(", ")})`;
      const exampl = def.examples ? def.examples.map(ex => `> \`{${ex}}\``).join("\n") : null;
      return trimPluginDescription(`
      ### ${def.name}
      **${def.description}**\n
      \`{${def.name}${usage}}\`\n
      ${exampl ? `Examples:\n${exampl}` : ""}`);
    })
    .join("\n\n");
}
