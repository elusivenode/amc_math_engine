<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let open = false;
  export let heading = 'Stage Complete';
  export let message = 'Well done.';
  export let ctaLabel = 'CONTINUE YOUR JOURNEY';
  export let subpathTitle: string | null = null;
  export let nextSubpathTitle: string | null = null;

  const dispatch = createEventDispatcher<{ close: void; continue: void }>();

  function close() {
    dispatch('close');
  }

  function continueJourney() {
    dispatch('continue');
  }
</script>

<svelte:window
  on:keydown={(event) => {
    if (!open) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
    }
  }}
/>

{#if open}
  <div
    class="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/80 p-6"
    role="dialog"
    aria-modal="true"
    aria-labelledby="subpath-celebration-heading"
    aria-describedby="subpath-celebration-body"
  >
    <div class="relative w-full max-w-2xl rounded-3xl bg-white p-8 shadow-2xl">
      <button
        class="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-slate-500 shadow-md transition hover:bg-white hover:text-slate-700"
        type="button"
        on:click={close}
        aria-label="Close celebration"
      >
        ×
      </button>

      <div class="space-y-4 text-center text-slate-700">
        <div>
          <h2 class="text-2xl font-semibold text-slate-900" id="subpath-celebration-heading">
            {heading}
          </h2>
          {#if subpathTitle}
            <p class="mt-1 text-sm uppercase tracking-[0.3em] text-indigo-400">{subpathTitle}</p>
          {/if}
        </div>

        <p class="text-lg font-medium text-slate-600" id="subpath-celebration-body">{message}</p>

        {#if nextSubpathTitle}
          <p class="text-sm text-slate-500">Next up: {nextSubpathTitle}</p>
        {/if}
      </div>

      <div class="mt-8 flex justify-center">
        <button
          class="inline-flex items-center justify-center rounded-full bg-indigo-600 px-6 py-2 text-sm font-semibold uppercase tracking-[0.35em] text-white transition hover:bg-indigo-500"
          type="button"
          on:click={() => {
            continueJourney();
          }}
        >
          {ctaLabel}
        </button>
      </div>
    </div>
  </div>
{/if}
