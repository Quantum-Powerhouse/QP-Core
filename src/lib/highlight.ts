export type Lang = "qasm" | "python" | "json" | "typescript";

type TokenRule = { regex: RegExp; className: string };
export type Token = { text: string; className?: string };

const RULES: Record<Lang, TokenRule[]> = {
  qasm: [
    { regex: /\/\/.*/, className: "text-[#8a7f6a]" },
    { regex: /"[^"]*"/, className: "text-emerald-300" },
    {
      regex: /\b(OPENQASM|include|qreg|creg|qubit|bit|gate|barrier|reset)\b/,
      className: "text-[#a24435]",
    },
    {
      regex: /\b(h|x|y|z|s|t|cx|cnot|measure|rx|ry|rz|u)\b/i,
      className: "text-[#8a5c14]",
    },
    { regex: /\b\d+(\.\d+)?\b/, className: "text-amber-300" },
  ],
  python: [
    { regex: /#.*/, className: "text-[#8a7f6a]" },
    { regex: /'[^']*'|"[^"]*"/, className: "text-emerald-300" },
    {
      regex: /\b(from|import|def|return|for|in|if|else)\b/,
      className: "text-[#a24435]",
    },
    {
      regex: /\b(QuantumCircuit|qc|h|x|y|z|cx|measure_all)\b/,
      className: "text-[#8a5c14]",
    },
    { regex: /\b\d+(\.\d+)?\b/, className: "text-amber-300" },
  ],
  json: [
    { regex: /"[^"]+"(?=\s*:)/, className: "text-[#8a5c14]" },
    { regex: /"[^"]*"/, className: "text-emerald-300" },
    { regex: /\b(true|false|null)\b/, className: "text-[#a24435]" },
    { regex: /-?\b\d+(\.\d+)?\b/, className: "text-amber-300" },
  ],
  typescript: [
    { regex: /\/\/.*/, className: "text-[#8a7f6a]" },
    { regex: /`[^`]*`|'[^']*'|"[^"]*"/, className: "text-emerald-300" },
    {
      regex: /\b(import|export|from|const|let|function|return|for|of|in|if|else|type|interface|new)\b/,
      className: "text-[#a24435]",
    },
    {
      regex: /\b(theta|lambda|rho|psi|hMatrix|state|gate|qubit)\b/,
      className: "text-[#8a5c14]",
    },
    { regex: /\b\d+(\.\d+)?\b/, className: "text-amber-300" },
  ],
};

function tokenizeLine(line: string, rules: TokenRule[]): Token[] {
  const matches: { start: number; end: number; text: string; className: string }[] = [];

  for (const rule of rules) {
    const flags = rule.regex.flags.includes("g")
      ? rule.regex.flags
      : rule.regex.flags + "g";
    const re = new RegExp(rule.regex.source, flags);
    let m: RegExpExecArray | null;
    while ((m = re.exec(line))) {
      matches.push({
        start: m.index,
        end: m.index + m[0].length,
        text: m[0],
        className: rule.className,
      });
      if (m[0].length === 0) re.lastIndex++;
    }
  }

  matches.sort((a, b) => a.start - b.start || b.end - a.end);

  const chosen: typeof matches = [];
  let lastEnd = 0;
  for (const m of matches) {
    if (m.start >= lastEnd) {
      chosen.push(m);
      lastEnd = m.end;
    }
  }

  const tokens: Token[] = [];
  let cursor = 0;
  for (const m of chosen) {
    if (m.start > cursor) tokens.push({ text: line.slice(cursor, m.start) });
    tokens.push({ text: m.text, className: m.className });
    cursor = m.end;
  }
  if (cursor < line.length) tokens.push({ text: line.slice(cursor) });
  return tokens;
}

export function highlightLines(code: string, lang: Lang): Token[][] {
  const rules = RULES[lang];
  return code.split("\n").map((line) => tokenizeLine(line, rules));
}
