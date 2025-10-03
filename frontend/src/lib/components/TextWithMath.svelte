<script lang="ts">
  import katex from 'katex';

  export let text: string = '';

  type Segment = { type: 'text'; value: string } | { type: 'math'; value: string };

  function escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  $: segments = (() => {
    const results: Segment[] = [];
    if (!text) {
      return results;
    }

    let buffer = '';
    let inMath = false;

    const flush = (segmentType: Segment['type']) => {
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
        // Unmatched math start – treat the captured content as literal text
        if (results.length > 0 && results[results.length - 1].type === 'text') {
          results[results.length - 1] = {
            type: 'text',
            value: `${results[results.length - 1].value}$${buffer}`,
          };
        } else {
          results.push({ type: 'text', value: `$${buffer}` });
        }
        buffer = '';
        inMath = false;
      } else {
        flush('text');
      }
    }

    if (results.length === 0) {
      results.push({ type: 'text', value: '' });
    }

    return results;
  })();

  const renderMath = (expression: string): string =>
    katex.renderToString(expression, {
      throwOnError: false,
      strict: 'ignore',
      displayMode: false,
    });
</script>

<span class="text-with-math">
  {#each segments as segment}
    {#if segment.type === 'text'}
      {@html escapeHtml(segment.value)}
    {:else}
      <span class="inline-math" aria-hidden="false" role="math">
        {@html renderMath(segment.value)}
      </span>
    {/if}
  {/each}
</span>

<style>
  .inline-math :global(.katex) {
    font-size: 0.95em;
  }
</style>
