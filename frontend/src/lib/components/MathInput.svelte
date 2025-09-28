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
