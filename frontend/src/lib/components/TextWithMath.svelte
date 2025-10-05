<script lang="ts">
  import type { MathSegment } from '$lib/utils/textWithMath';
  import { escapeHtml, parseTextWithMath, renderMath } from '$lib/utils/textWithMath';

  export let text: string = '';

  $: segments = parseTextWithMath(text) satisfies MathSegment[];
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
  :global(.inline-math .katex) {
    font-size: 0.95em;
  }
</style>
