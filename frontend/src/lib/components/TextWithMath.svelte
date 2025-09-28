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
    if (!text) return results;

    const regex = /\$(.+?)\$/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      const [fullMatch, mathContent] = match;
      const start = match.index;
      if (start > lastIndex) {
        results.push({ type: 'text', value: text.slice(lastIndex, start) });
      }
      results.push({ type: 'math', value: mathContent });
      lastIndex = start + fullMatch.length;
    }

    if (lastIndex < text.length) {
      results.push({ type: 'text', value: text.slice(lastIndex) });
    }

    if (results.length === 0) {
      results.push({ type: 'text', value: text });
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
