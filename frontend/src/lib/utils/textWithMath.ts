import katex from 'katex';

export type MathSegment = { type: 'text'; value: string } | { type: 'math'; value: string };

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function renderMath(expression: string): string {
  return katex.renderToString(expression, {
    throwOnError: false,
    strict: 'ignore',
    displayMode: false,
  });
}

export function parseTextWithMath(text: string): MathSegment[] {
  const results: MathSegment[] = [];
  if (!text) {
    return results;
  }

  let buffer = '';
  let inMath = false;

  const flush = (segmentType: MathSegment['type']) => {
    if (buffer.length === 0) return;
    results.push({ type: segmentType, value: buffer });
    buffer = '';
  };

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '\\' && next === '$') {
      buffer += '$';
      i += 1;
      continue;
    }

    if (char === '$') {
      if (inMath) {
        flush('math');
      } else {
        flush('text');
      }
      inMath = !inMath;
      continue;
    }

    buffer += char;
  }

  if (buffer.length > 0) {
    if (inMath) {
      if (results.length > 0 && results[results.length - 1].type === 'text') {
        results[results.length - 1] = {
          type: 'text',
          value: `${results[results.length - 1].value}$${buffer}`,
        };
      } else {
        results.push({ type: 'text', value: `$${buffer}` });
      }
    } else {
      flush('text');
    }
  }

  if (results.length === 0) {
    results.push({ type: 'text', value: '' });
  }

  return results;
}

export function renderTextWithMath(text: string): string {
  const segments = parseTextWithMath(text);

  return segments
    .map((segment) =>
      segment.type === 'math'
        ? `<span class="inline-math" aria-hidden="false" role="math">${renderMath(segment.value)}</span>`
        : escapeHtml(segment.value),
    )
    .join('');
}
