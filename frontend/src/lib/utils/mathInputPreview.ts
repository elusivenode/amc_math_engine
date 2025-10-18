const superscriptMap: Record<string, string> = {
  '²': '2',
  '³': '3',
  '⁴': '4',
  '⁵': '5',
  '⁶': '6',
  '⁷': '7',
  '⁸': '8',
  '⁹': '9',
};

const symbolMap: Record<string, string> = {
  '±': '\\pm ',
  '∓': '\\mp ',
  '×': '\\times ',
  '⋅': '\\cdot ',
  '·': '\\cdot ',
  '÷': '\\div ',
  '∞': '\\infty ',
  'π': '\\pi ',
};

function consumeSequential(input: string, start: number, matcher: RegExp): [string, number] {
  let index = start;
  let buffer = '';
  while (index < input.length && matcher.test(input[index] ?? '')) {
    buffer += input[index]!;
    index += 1;
  }
  return [buffer, index];
}

function convertSuperscripts(value: string): string {
  let output = '';
  for (let index = 0; index < value.length; index += 1) {
    const char = value[index]!;
    if (char === '^') {
      const next = value[index + 1];
      if (!next) {
        output += char;
        continue;
      }

      if (next === '{' || next === '(' || next === '[') {
        output += '^';
        continue;
      }

      const [exponent, endIndex] = consumeSequential(value, index + 1, /[A-Za-z0-9]/);
      if (exponent.length > 0) {
        output += `^{${exponent}}`;
        index = endIndex - 1;
      } else {
        output += '^';
      }
    } else if (superscriptMap[char]) {
      output += `^{${superscriptMap[char]}}`;
    } else {
      output += char;
    }
  }
  return output;
}

function convertSubscripts(value: string): string {
  let output = '';
  for (let index = 0; index < value.length; index += 1) {
    const char = value[index]!;
    if (char === '_') {
      const next = value[index + 1];
      if (!next) {
        output += '\\_';
        continue;
      }

      if (next === '{' || next === '(' || next === '[') {
        output += '_';
        continue;
      }

      const [subscript, endIndex] = consumeSequential(value, index + 1, /[A-Za-z0-9]/);
      if (subscript.length > 0) {
        output += `_{${subscript}}`;
        index = endIndex - 1;
      } else {
        output += '\\_';
      }
    } else {
      output += char;
    }
  }
  return output;
}

function convertSquareRoots(value: string): string {
  let output = '';

  for (let index = 0; index < value.length; index += 1) {
    const char = value[index]!;
    if (char !== '√') {
      output += char;
      continue;
    }

    let cursor = index + 1;
    while (cursor < value.length && /\s/.test(value[cursor] ?? '')) {
      cursor += 1;
    }

    if (cursor >= value.length) {
      output += '\\sqrt{}';
      index = cursor - 1;
      continue;
    }

    if (value[cursor] === '(') {
      let depth = 1;
      let end = cursor + 1;
      while (end < value.length && depth > 0) {
        const token = value[end]!;
        if (token === '(') {
          depth += 1;
        } else if (token === ')') {
          depth -= 1;
        }
        end += 1;
      }

      const radicand = value.slice(cursor + 1, end - 1);
      output += `\\sqrt{${convertSquareRoots(radicand)}}`;
      index = end - 1;
    } else {
      const [radicand, end] = consumeSequential(value, cursor, /[A-Za-z0-9.^]/);
      output += `\\sqrt{${convertSquareRoots(radicand)}}`;
      index = end - 1;
    }
  }

  return output;
}

function replaceSymbols(value: string): string {
  return value.replace(/[±∓×⋅·÷∞π]/g, (match) => symbolMap[match] ?? match);
}

export function convertPlaintextMathToLatex(input: string): string | null {
  if (typeof input !== 'string') {
    return null;
  }

  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }

  const withoutRadicals = convertSquareRoots(trimmed);
  const withSuperscripts = convertSuperscripts(withoutRadicals);
  const withSubscripts = convertSubscripts(withSuperscripts);
  const withSymbols = replaceSymbols(withSubscripts);

  return withSymbols;
}
