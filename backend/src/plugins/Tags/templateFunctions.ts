import { TemplateFunction } from "./types";

// TODO: Generate this dynamically, lmao
export const TemplateFunctions: TemplateFunction[] = [
  {
    name: "if",
    description: "Checks if a condition is true or false and returns the corresponding ifTrue or ifFalse",
    returnValue: "boolean",
    arguments: ["condition", "ifTrue", "ifFalse"],
    examples: ['if(user.bot, "User is a bot", "User is not a bot")'],
  },
  {
    name: "and",
    description: "Checks if all provided conditions are true",
    returnValue: "boolean",
    arguments: ["condition1", "condition2", "..."],
    examples: ["and(user.bot, user.verified)"],
  },
  {
    name: "or",
    description: "Checks if atleast one of the provided conditions is true",
    returnValue: "boolean",
    arguments: ["condition1", "condition2", "..."],
    examples: ["or(user.bot, user.verified)"],
  },
  {
    name: "not",
    description: "Checks if the provided condition is false",
    returnValue: "boolean",
    arguments: ["condition"],
    examples: ["not(user.bot)"],
  },
  {
    name: "concat",
    description: "Concatenates several arguments into a string",
    returnValue: "string",
    arguments: ["argument1", "argument2", "..."],
    examples: ['concat("Hello ", user.username, "!")'],
  },
  {
    name: "concatArr",
    description: "Joins a array with the provided separator",
    returnValue: "string",
    arguments: ["array", "separator"],
    examples: ['concatArr(["Hello", "World"], " ")'],
  },
  {
    name: "eq",
    description: "Checks if all provided arguments are equal to each other",
    returnValue: "boolean",
    arguments: ["argument1", "argument2", "..."],
    examples: ['eq(user.id, "106391128718245888")'],
  },
  {
    name: "gt",
    description: "Checks if the first argument is greater than the second",
    returnValue: "boolean",
    arguments: ["argument1", "argument2"],
    examples: ["gt(5, 2)"],
  },
  {
    name: "gte",
    description: "Checks if the first argument is greater or equal to the second",
    returnValue: "boolean",
    arguments: ["argument1", "argument2"],
    examples: ["gte(2, 2)"],
  },
  {
    name: "lt",
    description: "Checks if the first argument is smaller than the second",
    returnValue: "boolean",
    arguments: ["argument1", "argument2"],
    examples: ["lt(2, 5)"],
  },
  {
    name: "lte",
    description: "Checks if the first argument is smaller or equal to the second",
    returnValue: "boolean",
    arguments: ["argument1", "argument2"],
    examples: ["lte(2, 2)"],
  },
  {
    name: "slice",
    description: "Slices a string argument at start and end",
    returnValue: "string",
    arguments: ["string", "start", "end"],
    examples: ['slice("Hello World", 0, 5)'],
  },
  {
    name: "lower",
    description: "Converts a string argument to lowercase",
    returnValue: "string",
    arguments: ["string"],
    examples: ['lower("Hello World")'],
  },
  {
    name: "upper",
    description: "Converts a string argument to uppercase",
    returnValue: "string",
    arguments: ["string"],
    examples: ['upper("Hello World")'],
  },
  {
    name: "upperFirst",
    description: "Converts the first character of a string argument to uppercase",
    returnValue: "string",
    arguments: ["string"],
    examples: ['upperFirst("hello World")'],
  },
  {
    name: "strlen",
    description: "Returns the length of a string argument",
    returnValue: "number",
    arguments: ["string"],
    examples: ['strlen("Hello World")'],
  },
  {
    name: "arrlen",
    description: "Returns the length of an array argument",
    returnValue: "number",
    arguments: ["array"],
    examples: ['arrlen(["Hello", "World"])'],
  },
  {
    name: "rand",
    description: "Returns a random number between from and to, optionally using seed",
    returnValue: "number",
    arguments: ["from", "to", "seed"],
    examples: ["rand(1, 10)"],
  },
  {
    name: "round",
    description: "Rounds a number to the given decimal places",
    returnValue: "number",
    arguments: ["number", "decimalPlaces"],
    examples: ["round(1.2345, 2)"],
  },
  {
    name: "ceil",
    description: "Rounds a number up to the next integer",
    returnValue: "number",
    arguments: ["number"],
    examples: ["ceil(1.2345)"],
  },
  {
    name: "floor",
    description: "Rounds a number down to the next integer",
    returnValue: "number",
    arguments: ["number"],
    examples: ["floor(1.2345)"],
  },
  {
    name: "abs",
    description: "Returns the absolute of a number",
    returnValue: "number",
    arguments: ["number"],
    examples: ["abs(-1.2345)"],
  },
  {
    name: "add",
    description: "Adds two or more numbers",
    returnValue: "number",
    arguments: ["number1", "number2", "..."],
    examples: ["add(1, 2)"],
  },
  {
    name: "sub",
    description: "Subtracts two or more numbers",
    returnValue: "number",
    arguments: ["number1", "number2", "..."],
    examples: ["sub(3, 1)"],
  },
  {
    name: "mul",
    description: "Multiplies two or more numbers",
    returnValue: "number",
    arguments: ["number1", "number2", "..."],
    examples: ["mul(2, 3)"],
  },
  {
    name: "div",
    description: "Divides two or more numbers",
    returnValue: "number",
    arguments: ["number1", "number2", "..."],
    examples: ["div(6, 2)"],
  },
  {
    name: "sqrt",
    description: "Calculates the square root of a number",
    returnValue: "number",
    arguments: ["number"],
    examples: ["sqrt(5)"],
  },
  {
    name: "cbrt",
    description: "Calculates the cubic root of a number",
    returnValue: "number",
    arguments: ["number"],
    examples: ["cbrt(50)"],
  },
  {
    name: "exp",
    description: "Raises a number to the power of another number",
    returnValue: "number",
    arguments: ["base", "power"],
    examples: ["exp(2, 3)"],
  },
  {
    name: "sin",
    description: "Returns the sine of a number in radians",
    returnValue: "number",
    arguments: ["radians"],
    examples: ["sin(2)"],
  },
  {
    name: "sinh",
    description: "Returns the hyperbolic sine of a number",
    returnValue: "number",
    arguments: ["number"],
    examples: ["sinh(1)"],
  },
  {
    name: "tan",
    description: "Returns the tangent of a number in radians",
    returnValue: "number",
    arguments: ["radians"],
    examples: ["tan(1.5)"],
  },
  {
    name: "tanh",
    description: "Returns the hyperbolic tangent of a number in radians",
    returnValue: "number",
    arguments: ["radians"],
    examples: ["tanh(1.5)"],
  },
  {
    name: "cos",
    description: "Returns the cosine of a number in radians",
    returnValue: "number",
    arguments: ["radians"],
    examples: ["cos(1.5)"],
  },
  {
    name: "cosh",
    description: "Returns the hyperbolic cosine of a number in radians",
    returnValue: "number",
    arguments: ["radians"],
    examples: ["cosh(1.5)"],
  },
  {
    name: "hypot",
    description: "Returns the square root of the sum of squares of it's arguments",
    returnValue: "number",
    arguments: ["number1", "number2", "..."],
    examples: ["hypot(3, 4, 5, 6)"],
  },
  {
    name: "log",
    description: "Returns the base e logarithm of a number",
    returnValue: "number",
    arguments: ["number"],
    examples: ["log(3)"],
  },
  {
    name: "log2",
    description: "Returns the base 2 logarithm of a number",
    returnValue: "number",
    arguments: ["number"],
    examples: ["log2(3)"],
  },
  {
    name: "log10",
    description: "Returns the base 10 logarithm of a number",
    returnValue: "number",
    arguments: ["number"],
    examples: ["log10(3)"],
  },
  {
    name: "log1p",
    description: "Returns the base e logarithm of a 1 + number",
    returnValue: "number",
    arguments: ["number"],
    examples: ["log1p(3)"],
  },
  {
    name: "const",
    description: "Get value of math constants",
    returnValue: "number",
    arguments: ["constant_name"],
    examples: [
      "const(pi)",
      "const(e)",
      "const(sqrt2)",
      "const(sqrt0.5)",
      "const(ln10)",
      "const(ln2)",
      "const(log10e)",
      "const(log2e)",
    ],
  },
  {
    name: "cases",
    description: "Returns the argument at position",
    returnValue: "any",
    arguments: ["position", "argument1", "argument2", "..."],
    examples: ['cases(1, "Hello", "World")'],
  },
  {
    name: "choose",
    description: "Returns a random argument",
    returnValue: "any",
    arguments: ["argument1", "argument2", "..."],
    examples: ['choose("Hello", "World", "!")'],
  },
  {
    name: "map",
    description: "Returns the value of the key of object, array or single value",
    returnValue: "any",
    arguments: ["object | array", "key"],
    examples: ['map(user, "id")'],
  },
  {
    name: "trim_text",
    description: "Trims all non-numeric characters from a string",
    returnValue: "string",
    arguments: ["string"],
    examples: ['trim_text("<@!344837487526412300>")'],
  },
  {
    name: "convert_base",
    description: "Converts a value from <origin> base to <dest> base",
    returnValue: "string",
    arguments: ["value", "origin", "dest"],
    examples: ['convert_base("256", "10", "2")'],
  },
  {
    name: "tag",
    description: "Gets the value of another defined tag",
    returnValue: "string",
    arguments: ["tagName"],
    examples: ['tag("tagName")'],
    plugin: "tags",
  },
  {
    name: "get",
    description: "Gets the value of a saved variable",
    returnValue: "any",
    arguments: ["variable"],
    examples: ['get("variable")'],
    plugin: "tags",
  },
  {
    name: "set",
    description: "Sets the value of a saved variable",
    returnValue: "none",
    arguments: ["variableName", "value"],
    examples: ['set("variableName", "value")'],
    plugin: "tags",
  },
  {
    name: "setr",
    description: "Sets the value of a saved variable and returns it",
    returnValue: "any",
    arguments: ["variableName", "value"],
    examples: ['setr("variableName", "value")'],
    plugin: "tags",
  },
  {
    name: "parseDateTime",
    description: "Parses a date string/unix timestamp into a formated Date string",
    returnValue: "string",
    arguments: ["date"],
    examples: ["parseDateTime(1643411583656)", 'parseDateTime("2020-01-01T00:00:00.000Z")'],
    plugin: "tags",
  },
  {
    name: "countdown",
    description: "Returns a countdown string to target timestamp",
    returnValue: "string",
    arguments: ["timestamp"],
    examples: ["countdown(1577886400000)"],
    plugin: "tags",
  },
  {
    name: "now",
    description: "Returns the current timestamp",
    returnValue: "number",
    arguments: [],
    examples: ["now()"],
    plugin: "tags",
  },
  {
    name: "timeAdd",
    description: "Adds a delay to a timestamp",
    returnValue: "number",
    arguments: ["timestamp", "delay"],
    examples: ['timeAdd(1577886400000, "1h")', 'timeAdd("1h")'],
    plugin: "tags",
  },
  {
    name: "timeSub",
    description: "Subtracts a delay from a timestamp",
    returnValue: "number",
    arguments: ["timestamp", "delay"],
    examples: ['timeSub(1577886400000, "1h")', 'timeSub("1h")'],
    plugin: "tags",
  },
  {
    name: "timeAgo",
    description: "Alias for timeSub",
    returnValue: "number",
    arguments: ["delay"],
    examples: ['timeAgo("2h")'],
    plugin: "tags",
  },
  {
    name: "formatTime",
    description: "Formats a timestamp into a human readable string",
    returnValue: "string",
    arguments: ["timestamp", "formatStyle"],
    examples: ['formatTime(now(), "YYYY-MM-DD HH")', 'formatTime(1577886400000, "YYYY-MM-DD")'],
    plugin: "tags",
  },
  {
    name: "mention",
    description: "Converts a snowflake to a mention",
    returnValue: "string",
    arguments: ["snowflake"],
    examples: ["mention('344837487526412300')"],
    plugin: "tags",
  },
  {
    name: "isMention",
    description: "Checks if a string is a mention",
    returnValue: "boolean",
    arguments: ["string"],
    examples: ['isMention("<@!344837487526412300>")'],
    plugin: "tags",
  },
  {
    name: "get_user",
    description: "Tries to resolve a user from ID or mention",
    returnValue: 'ResolvedUser || ""',
    arguments: ["string"],
    examples: ['get_user("<@!344837487526412300>")', "get_user(get_snowflake(args.0))"],
    plugin: "tags",
  },
];
