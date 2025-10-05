type KeyValueEntry = [string, string];
type EnumName = RegExp;
type RegexGroup = [EnumName, RegExp, Replacer];
type Replacer = (s: string) => string;
