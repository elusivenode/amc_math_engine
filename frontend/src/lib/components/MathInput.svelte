<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{ input: string }>();

  export let value = '';
  export let placeholder = '';
  export let disabled = false;

  let inputEl: HTMLInputElement;

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
