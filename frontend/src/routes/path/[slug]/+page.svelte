<svelte:head>
  <title>Path Progress · AMC Math Engine</title>
  <meta name="description" content="Track your progress through this AMC Math Engine path." />
</svelte:head>

<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { apiFetch } from '$lib/api';
  import { authStore } from '$lib/stores/auth';
  import StoryPanelModal from '$lib/components/StoryPanelModal.svelte';
  import { getStoryBeatForPath, getStoryBeatForProblem } from '$lib/story';
  import type { StoryBeat } from '$lib/story';

  export let data: { slug: string };

  type TileStatus = 'LOCKED' | 'READY' | 'IN_PROGRESS' | 'MASTERED' | 'COMING_SOON';

  type ProblemTile = {
    order: number;
    title: string;
    status: TileStatus;
    isPlaceholder: boolean;
    isAccessible: boolean;
    problemId?: string;
  };

  type LevelSummary = {
    id: string;
    title: string;
    subtitle?: string | null;
    description?: string | null;
    tiles: ProblemTile[];
    isCompleted: boolean;
  };

  type StageStats = {
    mastered: number;
    total: number;
    inProgress: number;
  };

  type SubpathSummary = {
    id: string;
    title: string;
    description?: string | null;
    stage: string;
    isUnlocked: boolean;
    isCompleted: boolean;
    levels: LevelSummary[];
    stats: StageStats;
  };

  type PathProgress = {
    id: string;
    slug: string;
    title: string;
    description?: string | null;
    themeColor?: string | null;
    order: number | null;
    isUnlocked: boolean;
    unlockRequirement?: string | null;
    subpaths: SubpathSummary[];
    summary: StageStats;
  };

  const stageLabels: Record<string, string> = {
    BASIC: 'Basic prep and warm-up',
    INTERMEDIATE: 'Intermediate problem solving',
    ADVANCED: 'Advanced techniques',
    BOSS: 'Boss fight',
    FINAL: 'Final challenge',
  };

  let path: PathProgress | null = null;
  let loading = true;
  let errorMessage = '';
  let storyPanel: StoryBeat | null = null;
  let storyModalOpen = false;
  let storyInitialized = false;
  let problemOrderById: Map<string, number> = new Map();
  let nextProblemOrder: number | null = null;
  let pathHasProgress = false;

  function statusLabel(status: TileStatus): string {
    switch (status) {
      case 'MASTERED':
        return 'Mastered';
      case 'IN_PROGRESS':
        return 'In progress';
      case 'COMING_SOON':
        return 'Coming soon';
      case 'READY':
        return 'Ready';
      default:
        return 'Locked';
    }
  }

  function statusClasses(status: TileStatus): string {
    switch (status) {
      case 'MASTERED':
        return 'bg-emerald-100 text-emerald-700';
      case 'IN_PROGRESS':
        return 'bg-amber-100 text-amber-700';
      case 'READY':
        return 'bg-indigo-100 text-indigo-600';
      case 'COMING_SOON':
        return 'bg-slate-100 text-slate-500';
      default:
        return 'bg-slate-200 text-slate-600';
    }
  }

  function closeStoryPanel() {
    storyModalOpen = false;
  }

  function handleTileClick(tile: ProblemTile) {
    if (!path?.isUnlocked) return;
    if (!tile.problemId || tile.isPlaceholder || !tile.isAccessible) return;

    const params = new URLSearchParams();
    if (path.slug) {
      params.set('path', path.slug);
    }
    const overallOrder = problemOrderById.get(tile.problemId);
    if (overallOrder !== undefined) {
      params.set('order', overallOrder.toString());
    }

    const query = params.toString();
    void goto(`/problem/${tile.problemId}${query ? `?${query}` : ''}`);
  }

  async function loadPath() {
    const auth = get(authStore);
    if (!auth) {
      await goto('/login');
      return;
    }

    try {
      path = await apiFetch<PathProgress>(`/paths/progress/${data.slug}`, {
        token: auth.token,
      });
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : 'Failed to load path';
    } finally {
      loading = false;
    }
  }

  $: if (path) {
    const map = new Map<string, number>();
    let orderCounter = 1;
    let candidate:
      | {
          problemId: string;
          order: number;
          status: TileStatus;
        }
      | null = null;

    for (const subpath of path.subpaths) {
      for (const level of subpath.levels) {
        for (const tile of level.tiles) {
          if (!tile.problemId || tile.isPlaceholder) {
            continue;
          }

          map.set(tile.problemId, orderCounter);

          if (
            tile.isAccessible &&
            tile.status !== 'MASTERED' &&
            (tile.status === 'READY' || tile.status === 'IN_PROGRESS')
          ) {
            const isBetter =
              candidate === null ||
              (tile.status === 'READY' && candidate.status !== 'READY') ||
              (candidate && tile.status === candidate.status && orderCounter < candidate.order);

            if (isBetter) {
              candidate = {
                problemId: tile.problemId,
                order: orderCounter,
                status: tile.status,
              };
            }
          }

          orderCounter += 1;
        }
      }
    }

    problemOrderById = map;
    nextProblemOrder = candidate?.order ?? null;
    pathHasProgress =
      (path.summary.mastered ?? 0) > 0 || (path.summary.inProgress ?? 0) > 0;
  } else {
    problemOrderById = new Map();
    nextProblemOrder = null;
    pathHasProgress = false;
  }

  $: if (!storyInitialized && !loading && !errorMessage && path) {
    storyInitialized = true;
    if (!path.isUnlocked) {
      storyPanel = null;
      storyModalOpen = false;
    } else {
      const panel = pathHasProgress
        ? getStoryBeatForProblem(path.slug, nextProblemOrder ?? undefined) ?? null
        : getStoryBeatForPath(path.slug);

      if (panel && !pathHasProgress) {
        storyPanel = panel;
        storyModalOpen = true;
      } else {
        storyPanel = null;
        storyModalOpen = false;
      }
    }
  }

  onMount(() => {
    void loadPath();
  });
</script>

<div class="min-h-screen bg-slate-50 pb-20">
  <StoryPanelModal
    open={storyModalOpen}
    panel={storyPanel}
    continueLabel="Enter Path"
    on:close={closeStoryPanel}
  />
  <div class="mx-auto max-w-5xl px-6 pt-10">
    <button
      class="text-sm font-semibold text-indigo-500 transition hover:text-indigo-700"
      type="button"
      on:click={() => goto('/dashboard')}
    >
      ← Back to dashboard
    </button>

    {#if loading}
      <div class="mt-8 rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
        Loading path…
      </div>
    {:else if errorMessage}
      <div class="mt-8 rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center text-rose-600 shadow-sm">
        {errorMessage}
      </div>
    {:else if path}
      <header class="mt-8 space-y-3">
        <p class="text-xs uppercase tracking-[0.3em] text-slate-400">{path.slug.replace(/-/g, ' ')}</p>
        <h1 class="text-3xl font-semibold text-slate-900">{path.title}</h1>
        {#if path.description}
          <p class="text-sm text-slate-600">{path.description}</p>
        {/if}
        <p class="text-xs uppercase tracking-[0.3em] text-slate-400">{path.summary.mastered}/{path.summary.total} problems mastered</p>
      </header>

      {#if !path.isUnlocked}
        <div class="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-700 shadow-sm">
          <p class="text-sm font-semibold uppercase tracking-[0.2em]">Path locked</p>
          <p class="mt-2 text-sm">
            {#if path.unlockRequirement}
              Master {path.unlockRequirement} to unlock this adventure.
            {:else}
              Master the previous path to unlock this adventure.
            {/if}
          </p>
        </div>
      {/if}

      <div class="mt-10 space-y-8">
        {#each path.subpaths as subpath, index}
          <section class={`rounded-3xl border ${subpath.isUnlocked ? 'border-slate-200 bg-white' : 'border-slate-100 bg-slate-50'} p-6 shadow-sm transition ${subpath.isUnlocked ? '' : 'opacity-70'}`}>
            <div class="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p class="text-lg font-semibold text-slate-900">{subpath.title}</p>
                {#if subpath.description}
                  <p class="text-sm text-slate-500">{subpath.description}</p>
                {/if}
                <p class="text-xs text-slate-500">{subpath.stats.mastered}/{subpath.stats.total} mastered</p>
              </div>
              <span class="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">
                {stageLabels[subpath.stage] ?? subpath.stage}
              </span>
            </div>
            {#if !subpath.isUnlocked}
              <p class="mt-3 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                Unlock previous stages to access these problems.
              </p>
            {/if}

            {#each subpath.levels as level}
              <div class="mt-5 space-y-3">
                <div>
                  <p class="text-sm font-semibold text-slate-800">{level.title}</p>
                  {#if level.subtitle}
                    <p class="text-xs uppercase tracking-[0.25em] text-indigo-500">{level.subtitle}</p>
                  {/if}
                  {#if level.description}
                    <p class="text-xs text-slate-500">{level.description}</p>
                  {/if}
                </div>
                <div class="grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {#each level.tiles as tile}
                    <button
                      class={`w-full rounded-xl border px-3 py-3 text-left transition ${tile.isPlaceholder ? 'border-dashed border-slate-200 bg-white' : 'border-slate-200 bg-white'} ${tile.isAccessible && !tile.isPlaceholder ? 'hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow' : ''} ${!tile.isAccessible || tile.isPlaceholder ? 'cursor-default' : 'cursor-pointer'}`}
                      type="button"
                      disabled={!tile.isAccessible || tile.isPlaceholder}
                      on:click={() => handleTileClick(tile)}
                    >
                      <div class="flex w-full items-start justify-between text-xs font-semibold text-slate-500">
                        <span class="shrink-0">#{tile.order}</span>
                        <span class={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.2em] ${statusClasses(tile.status)}`}>
                          {statusLabel(tile.status)}
                        </span>
                      </div>
                      <p class="mt-2 text-sm font-medium text-slate-800">
                        {tile.title}
                      </p>
                    </button>
                  {/each}
                </div>
              </div>
            {/each}
          </section>
        {/each}
      </div>
    {/if}
  </div>
</div>
