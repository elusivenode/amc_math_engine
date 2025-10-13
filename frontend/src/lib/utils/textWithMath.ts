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
        : renderTextSegment(segment.value),
    )
    .join('');
}

function renderTextSegment(value: string): string {
  if (!value) {
    return '';
  }

  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let lastIndex = 0;
  let output = '';

  const highlightStyle = 'color:#4f46e5;font-weight:600;text-decoration:underline;';

  for (let match = linkRegex.exec(value); match !== null; match = linkRegex.exec(value)) {
    const [fullMatch, label, hrefRaw] = match;
    const start = match.index;

    if (start > lastIndex) {
      output += escapeHtml(value.slice(lastIndex, start));
    }

    const href = hrefRaw.trim();
    const isSafeLink = /^https?:\/\//i.test(href) || href.startsWith('/') || href.startsWith('./');

    if (isSafeLink) {
      output += `<a href="${escapeHtml(
        href,
      )}" target="_blank" rel="noopener noreferrer" style="${highlightStyle}">${escapeHtml(
        label,
      )}</a>`;
    } else {
      output += escapeHtml(fullMatch);
    }

    lastIndex = start + fullMatch.length;
  }

  if (lastIndex < value.length) {
    output += escapeHtml(value.slice(lastIndex));
  }

  return output;
}
