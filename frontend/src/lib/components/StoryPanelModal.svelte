<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { StoryBeat } from '$lib/story';

  export let open = false;
  export let panel: StoryBeat | null = null;
  export let continueLabel = 'Continue';
  export let actionHint: 'close' | 'leave' = 'close';

  const dispatch = createEventDispatcher<{ close: void; continue: void }>();

  let titleId = 'story-panel-title-pending';
  let bodyId = 'story-panel-body-pending';

  $: titleId = `story-panel-title-${panel?.id ?? 'pending'}`;
  $: bodyId = `story-panel-body-${panel?.id ?? 'pending'}`;

  function close() {
    dispatch('close');
  }
</script>

<svelte:window
  on:keydown={(event) => {
    if (!open || !panel) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
    }
  }}
/>

{#if open && panel}
  <div
    class="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-slate-900/80 p-4 sm:p-6 lg:items-center"
  >
    <div
      class="relative mt-6 w-full max-w-[85rem] overflow-hidden rounded-3xl bg-white shadow-2xl lg:mt-0 lg:max-h-[90vh]"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={bodyId}
    >
      <button
        class="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-slate-500 shadow-md transition hover:bg-white hover:text-slate-700"
        type="button"
        on:click={close}
        aria-label="Close story panel"
      >
        ×
      </button>

      <div class="grid gap-0 lg:grid-cols-[1.5fr_1fr] lg:items-stretch">
        <figure class="relative flex max-h-[60vh] items-center justify-center bg-slate-100 landscape:max-h-[70vh] lg:max-h-[85vh] lg:landscape:max-h-[85vh]">
          {#if panel.image}
            <img
              class="h-full max-h-[60vh] w-full object-contain landscape:max-h-[70vh] lg:max-h-[85vh] lg:landscape:max-h-[85vh]"
              src={panel.image}
              alt={panel.imageAlt}
            />
          {:else}
            <div class="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-200 via-indigo-300 to-indigo-400 text-indigo-800">
              <span class="text-lg font-semibold">Story art coming soon</span>
            </div>
          {/if}

          {#if panel.caption}
            <figcaption class="absolute bottom-0 left-0 right-0 bg-slate-900/70 px-4 py-3 text-xs text-slate-100">
              {panel.caption}
            </figcaption>
          {/if}
        </figure>

        <div class="flex h-full min-h-[280px] flex-col p-6 md:p-8 lg:min-h-[320px]">
          <div class="shrink-0">
            <h2 class="text-2xl font-semibold text-slate-900" id={titleId}>{panel.title}</h2>
          </div>

          <div
            class="mt-4 flex-1 space-y-4 overflow-y-auto pr-1 text-base leading-relaxed text-slate-600"
            id={bodyId}
          >
            {#each panel.narrative as paragraph}
              {#if paragraph && paragraph.trim().length > 0}
                <p class="whitespace-pre-line">{paragraph}</p>
              {:else}
                <div class="h-4" aria-hidden="true"></div>
              {/if}
            {/each}
          </div>

          <div class="mt-6 flex shrink-0 items-center justify-end gap-3 pt-4">
            <button
              class="inline-flex items-center justify-center rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold uppercase tracking-[0.25em] text-white transition hover:bg-indigo-500"
              type="button"
              on:click={() => {
                close();
                if (actionHint === 'leave') {
                  dispatch('continue');
                }
              }}
            >
              {continueLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}
