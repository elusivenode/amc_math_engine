<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import katex from 'katex';
  import { convertPlaintextMathToLatex } from '$lib/utils/mathInputPreview';

  const dispatch = createEventDispatcher<{ input: string }>();

  export let value = '';
  export let placeholder = '';
  export let disabled = false;

  let inputEl: HTMLInputElement;
  let latexSource: string | null = null;
  let latexHtml: string | null = null;

  function handleInput(event: Event) {
    const target = event.currentTarget as HTMLInputElement;
    value = target.value;
    dispatch('input', value);
  }

  export function insertAtCursor(insertText: string) {
    if (!insertText) return;

    if (!inputEl) {
      value = `${value ?? ''}${insertText}`;
      dispatch('input', value);
      return;
    }

    const start = inputEl.selectionStart ?? inputEl.value.length;
    const end = inputEl.selectionEnd ?? inputEl.value.length;
    const current = inputEl.value;
    const next = `${current.slice(0, start)}${insertText}${current.slice(end)}`;

    value = next;
    inputEl.value = next;
    inputEl.focus();
    const caret = start + insertText.length;
    inputEl.setSelectionRange(caret, caret);
    dispatch('input', value);
  }

  $: if (inputEl && value !== inputEl.value) {
    inputEl.value = value;
  }

  $: {
    const nextLatex = convertPlaintextMathToLatex(value);
    latexSource = nextLatex;

    if (nextLatex) {
      try {
        latexHtml = katex.renderToString(nextLatex, {
          displayMode: false,
          throwOnError: false,
          strict: 'ignore',
        });
      } catch (error) {
        console.warn('Failed to render math preview', error);
        latexHtml = null;
      }
    } else {
      latexHtml = null;
    }
  }
</script>

<input
  bind:this={inputEl}
  class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-lg shadow-sm focus:border-indigo-500 focus:outline-none"
  type="text"
  {placeholder}
  {disabled}
  value={value}
  on:input={handleInput}
/>

{#if latexSource && latexHtml}
  <div class="mt-3 rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-2 text-sm text-slate-700">
    <div class="katex-preview text-center" aria-live="polite" aria-label="Math preview">
      {@html latexHtml}
    </div>
    <div class="mt-2 select-text break-all font-mono text-xs text-slate-500">
      {latexSource}
    </div>
  </div>
{/if}
