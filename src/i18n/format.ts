/** Minimal ICU-style formatter: {name} and {n, plural, one {# day} other {# days}}. No dependency. */
export type Params = Record<string, string | number>;

export function format(msg: string, params: Params = {}): string {
  let out = "";
  let i = 0;
  while (i < msg.length) {
    const open = msg.indexOf("{", i);
    if (open < 0) {
      out += msg.slice(i);
      break;
    }
    out += msg.slice(i, open);
    const close = matchBrace(msg, open);
    const body = msg.slice(open + 1, close);
    out += formatArg(body, params);
    i = close + 1;
  }
  return out;
}

function matchBrace(s: string, open: number) {
  let depth = 0;
  for (let j = open; j < s.length; j++) {
    if (s[j] === "{") depth++;
    else if (s[j] === "}" && --depth === 0) return j;
  }
  throw new Error(`Unclosed placeholder in "${s}"`);
}

function formatArg(body: string, params: Params): string {
  const [name, type, ...rest] = body.split(",").map((x) => x.trim());
  const value = params[name];
  if (type !== "plural") return value === undefined ? `{${name}}` : String(value);
  const n = Number(value);
  const cases = parseCases(rest.join(","));
  const chosen = cases[`=${n}`] ?? (n === 1 ? cases.one : undefined) ?? cases.other ?? "";
  return format(chosen.replace(/#/g, String(value)), params);
}

function parseCases(s: string): Record<string, string> {
  const cases: Record<string, string> = {};
  let i = 0;
  while (i < s.length) {
    const open = s.indexOf("{", i);
    if (open < 0) break;
    const key = s.slice(i, open).trim();
    const close = matchBrace(s, open);
    cases[key] = s.slice(open + 1, close);
    i = close + 1;
  }
  return cases;
}
