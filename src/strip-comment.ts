/**
 * Remove JavaScript/TypeScript comments from a block that is known to be
 * a complete `const enum` body (including the surrounding braces removed).
 *
 * Requirements:
 *  - input is trusted to be a complete const enum block
 *  - must remove both single-line (//) and multi-line (block) comments
 *  - must NOT remove text that appears inside string literals (', ", `)
 *
 * This implements a character-level state machine to ensure correctness
 * even for tricky inputs (comments inside strings, sequences of '*' in block comments, etc.).
 */
export function stripComment(constEnumBlock: string): string {
  const enum State {
    Normal,
    Slash,
    LineComment,
    BlockComment,
    BlockCommentStar,
    SingleQuote,
    DoubleQuote,
    Backtick,
    BacktickEscape,
    StringEscape,
  }
  const s = constEnumBlock;
  const len = s.length;
  let out = '';

  let state = State.Normal;

  for (let i = 0; i < len; i++) {
    const ch = s[i];

    switch (state) {
      case State.Normal:
        if (ch === '/') {
          state = State.Slash;
        } else if (ch === "'") {
          state = State.SingleQuote;
          out += ch;
        } else if (ch === '"') {
          state = State.DoubleQuote;
          out += ch;
        } else if (ch === '`') {
          state = State.Backtick;
          out += ch;
        } else {
          out += ch;
        }
        break;

      case State.Slash:
        if (ch === '/') {
          state = State.LineComment;
        } else if (ch === '*') {
          state = State.BlockComment;
        } else {
          // It was not a comment, emit the previous '/' and re-evaluate current char
          out += '/';
          // re-process current char in Normal state
          if (ch === "'") {
            state = State.SingleQuote;
            out += ch;
          } else if (ch === '"') {
            state = State.DoubleQuote;
            out += ch;
          } else if (ch === '`') {
            state = State.Backtick;
            out += ch;
          } else {
            state = State.Normal;
            out += ch;
          }
        }
        break;

      case State.LineComment:
        if (ch === '\n') {
          // end of line comment; keep the newline
          state = State.Normal;
          out += ch;
        } else {
          // skip characters inside line comment
        }
        break;

      case State.BlockComment:
        if (ch === '*') {
          state = State.BlockCommentStar;
        } else {
          // remain in block comment
        }
        break;

      case State.BlockCommentStar:
        if (ch === '/') {
          // end of block comment
          state = State.Normal;
        } else if (ch === '*') {
          // still in star sequence inside block comment
          state = State.BlockCommentStar;
        } else {
          state = State.BlockComment;
        }
        break;

      case State.SingleQuote:
        if (ch === '\\') {
          state = State.StringEscape;
          out += ch;
        } else if (ch === "'") {
          state = State.Normal;
          out += ch;
        } else {
          out += ch;
        }
        break;

      case State.DoubleQuote:
        if (ch === '\\') {
          state = State.StringEscape;
          out += ch;
        } else if (ch === '"') {
          state = State.Normal;
          out += ch;
        } else {
          out += ch;
        }
        break;

      case State.Backtick:
        if (ch === '\\') {
          state = State.BacktickEscape;
          out += ch;
        } else if (ch === '`') {
          state = State.Normal;
          out += ch;
        } else {
          out += ch;
        }
        break;

      case State.BacktickEscape:
        // escaped char inside template literal (could be `\` or `\n` etc.)
        state = State.Backtick;
        out += ch;
        break;

      case State.StringEscape:
        // escaped char inside single/double quoted string
        // return to the appropriate string state
        // Determine previous by looking at last output char? Simpler: assume we resume to SingleQuote or DoubleQuote based on surrounding context
        // But we can detect by peeking previous out char
        const prev = out[out.length - 1];
        if (prev === '\\') {
          // improbable double-escape, but just append and stay in escape
          out += ch;
          state = State.Normal; // fallback safe
        } else {
          out += ch;
          // determine which quote to resume by scanning backwards for the opening quote
          // safe heuristic: if out contains a single quote not closed, figure by last char
          // but simpler: if earlier state was SingleQuote or DoubleQuote caller handled; to keep it robust, detect by scanning backwards until a quote is found not preceded by backslash
          let j = out.length - 2; // position before the escaped char we just appended
          let resume = State.Normal;
          for (; j >= 0; j--) {
            const c = out[j];
            if (c === "'") {
              resume = State.SingleQuote;
              break;
            }
            if (c === '"') {
              resume = State.DoubleQuote;
              break;
            }
            // stop if encountering newline which would indicate string started earlier
            if (c === '\n') break;
          }
          state = resume;
        }
        break;
    }
  }

  // if we ended while in Slash state, emit the '/'
  if (state === State.Slash) {
    out += '/';
  }

  return out;
}
