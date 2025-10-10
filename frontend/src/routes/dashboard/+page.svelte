<svelte:head>
  <title>Your Paths · AMC Math Engine</title>
  <meta name="description" content="Choose a learning path and continue building competition skills." />
</svelte:head>

<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { apiFetch } from '$lib/api';
  import { authStore, clearAuth } from '$lib/stores/auth';

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

  type NextProblem = {
    title: string;
    status: TileStatus;
    stage: string;
    stageTitle: string;
    levelTitle?: string | null;
    problemId?: string;
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
    BASIC: 'Basic',
    INTERMEDIATE: 'Intermediate',
    ADVANCED: 'Advanced',
    BOSS: 'Boss',
    FINAL: 'Final',
  };

  type PathStats = {
    mastered: number;
    total: number;
    inProgress: number;
    started: boolean;
    pathStarted: boolean;
    currentStage?: SubpathSummary;
    nextLockedStage?: SubpathSummary;
    nextProblem?: NextProblem;
  };

  const PROBLEMS_PER_LEVEL = 15;

  function stageCapacity(subpath: SubpathSummary): number {
    const levelsCount = subpath.levels?.length ?? 0;
    const nominalCapacity = levelsCount * PROBLEMS_PER_LEVEL;
    return Math.max(subpath.stats.total ?? 0, nominalCapacity);
  }

  let paths: PathProgress[] = [];
  let loading = true;
  let errorMessage = '';
  let userName = '';

  function findNextProblem(path: PathProgress): NextProblem | undefined {
    type Candidate = {
      tile: ProblemTile;
      subpath: SubpathSummary;
      level: LevelSummary;
      priority: number;
    };

    const statusPriority: Record<TileStatus, number> = {
      MASTERED: 3,
      IN_PROGRESS: 0,
      READY: 1,
      LOCKED: 4,
      COMING_SOON: 5,
    };

    let best: Candidate | undefined;

    for (const subpath of path.subpaths) {
      if (!subpath.isUnlocked) {
        break;
      }

      for (const level of subpath.levels) {
        for (const tile of level.tiles) {
          if (!tile.problemId || tile.isPlaceholder || !tile.isAccessible) {
            continue;
          }

          const priority = statusPriority[tile.status];

          if (priority > 1) {
            continue;
          }

          if (!best || priority < best.priority) {
            best = { tile, subpath, level, priority };
          }
        }
      }
    }

    if (!best) {
      return undefined;
    }

    return {
      title: best.tile.title,
      status: best.tile.status,
      stage: best.subpath.stage,
      stageTitle: best.subpath.title,
      levelTitle: best.level.title,
      problemId: best.tile.problemId,
    } satisfies NextProblem;
  }

  function computeStats(path: PathProgress): PathStats {
    const { mastered, total, inProgress } = path.summary;
    const pathStarted = (mastered ?? 0) + (inProgress ?? 0) > 0;
    const currentStage = path.subpaths.find((sub) => sub.isUnlocked && !sub.isCompleted);
    const nextLockedStage = path.subpaths.find((sub) => !sub.isUnlocked);

    const nextProblem = findNextProblem(path);

    const displayMastered = currentStage ? currentStage.stats.mastered : mastered;
    const displayInProgress = currentStage ? currentStage.stats.inProgress : inProgress;
    const displayTotal = currentStage ? stageCapacity(currentStage) : total;
    const started = displayMastered + displayInProgress > 0;

    return {
      mastered: displayMastered,
      total: displayTotal,
      inProgress: displayInProgress,
      started,
      pathStarted,
      currentStage,
      nextLockedStage,
      nextProblem,
    };
  }

  async function loadPaths() {
    const auth = get(authStore);
    if (!auth) {
      await goto('/login');
      return;
    }

    userName = auth.user.displayName ?? auth.user.email;

    try {
      paths = await apiFetch<PathProgress[]>('/paths/progress', { token: auth.token });
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : 'Failed to load paths';
    } finally {
      loading = false;
    }
  }

  function handleLogout() {
    clearAuth();
    void goto('/login');
  }

  function goToPath(path: PathProgress) {
    if (!path.isUnlocked) return;
    void goto(`/path/${path.slug}`);
  }

  function stageStatusLabel(subpath: SubpathSummary): string {
    if (subpath.isCompleted) return 'Complete';
    if (!subpath.isUnlocked) return 'Locked';
    if (subpath.stats.mastered > 0 || subpath.stats.inProgress > 0) return 'In progress';
    return 'Open';
  }

  function stageStatusClasses(subpath: SubpathSummary): string {
    if (subpath.isCompleted) return 'bg-emerald-100 text-emerald-700';
    if (!subpath.isUnlocked) return 'bg-slate-100 text-slate-500';
    if (subpath.stats.mastered > 0 || subpath.stats.inProgress > 0) return 'bg-amber-100 text-amber-700';
    return 'bg-indigo-100 text-indigo-600';
  }

  onMount(() => {
    void loadPaths();
  });
</script>

<div class="min-h-screen bg-slate-50 pb-20">
  <div class="mx-auto max-w-5xl px-6 pt-12">
    <header class="flex flex-col gap-6 rounded-3xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-700 px-8 py-10 text-white shadow-xl">
      <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p class="text-sm uppercase tracking-[0.3em] text-indigo-200">Welcome</p>
          <h1 class="mt-2 text-3xl font-semibold md:text-4xl">{userName || 'Pathfinder'}</h1>
          <p class="mt-4 max-w-3xl text-indigo-100">
            Map your journey across algebra, combinatorics, geometry, and number theory. Master each stage to unlock the Order of the Olympiad.
          </p>
        </div>
        <button
          class="inline-flex items-center justify-center rounded-full border border-white/60 px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-white/10"
          type="button"
          on:click={handleLogout}
        >
          Log out
        </button>
      </div>
      <div class="rounded-2xl bg-white/10 p-4 text-sm text-indigo-100">
        <strong class="font-semibold">Prototype note:</strong> later stages are placeholders; you’ll see their icons once problems are authored.
      </div>
    </header>

    <main class="mt-12">
      {#if loading}
        <div class="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
          Loading your paths…
        </div>
      {:else if errorMessage}
        <div class="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-600">
          {errorMessage}
        </div>
      {:else if paths.length === 0}
        <div class="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
          No paths available yet—please seed the database and try again.
        </div>
      {:else}
        <section class="space-y-8">
          {#each paths as path (path.id)}
            {@const stats = computeStats(path)}
            <article
              class={`rounded-3xl border bg-white p-6 shadow-sm transition ${path.isUnlocked ? 'border-slate-200 hover:-translate-y-0.5 hover:shadow-md' : 'border-slate-100 opacity-80'}`}
            >
              <div class="flex flex-wrap items-center justify-between gap-4">
                <div class="space-y-2">
                  <p class="text-xs uppercase tracking-[0.3em] text-slate-400">{path.slug.replace(/-/g, ' ')}</p>
                  <h2 class="text-2xl font-semibold text-slate-900">{path.title}</h2>
                  {#if path.description}
                    <p class="text-sm text-slate-600">{path.description}</p>
                  {/if}
                </div>
                <div class="text-right text-xs uppercase tracking-[0.3em] text-slate-400">
                  {#if stats.currentStage}
                    {stageLabels[stats.currentStage.stage] ?? stats.currentStage.stage} · {stats.mastered}/{stats.total} mastered
                  {:else}
                    {stats.mastered}/{stats.total} mastered
                  {/if}
                </div>
              </div>

                  {#if !path.isUnlocked}
                    <div class="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
                      <p class="font-semibold uppercase tracking-[0.2em]">Path locked</p>
                      <p class="mt-1 text-xs text-amber-800">
                        {#if path.unlockRequirement}
                          Master {path.unlockRequirement} to unlock this storyline.
                        {:else}
                          Master the previous path to unlock this storyline.
                        {/if}
                      </p>
                    </div>
                  {/if}

                  <div class="mt-5 grid gap-3 sm:grid-cols-3">
                    <div class="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600">
                      <p class="font-semibold text-slate-800">Progress</p>
                      <p class="mt-1 text-2xl font-semibold text-indigo-600">{stats.mastered}/{stats.total}</p>
                      <p class="text-xs text-slate-500">
                        Problems mastered{#if stats.currentStage} · Stage: {stageLabels[stats.currentStage.stage] ?? stats.currentStage.stage}{/if}
                      </p>
                    </div>
                    <div class="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600">
                      <p class="font-semibold text-slate-800">Currently tackling</p>
                      {#if stats.nextProblem}
                        <p class="mt-1 text-base font-semibold text-amber-600">{stats.nextProblem.title}</p>
                        <p class="text-xs text-slate-500">
                          {stageLabels[stats.nextProblem.stage] ?? stats.nextProblem.stage}
                          {#if stats.nextProblem.levelTitle}
                            · {stats.nextProblem.levelTitle}
                          {/if}
                        </p>
                        <p class="mt-1 text-[11px] uppercase tracking-[0.25em] text-amber-500">
                          {stats.nextProblem.status === 'IN_PROGRESS' ? 'In progress' : 'Ready to begin'}
                        </p>
                      {:else}
                        <p class="mt-1 text-base font-semibold text-emerald-600">All caught up</p>
                        <p class="text-xs text-slate-500">No problems waiting for you right now.</p>
                      {/if}
                    </div>
                    <div class="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600">
                      <p class="font-semibold text-slate-800">Next stage</p>
                      <p class="mt-1 text-base font-semibold text-indigo-600">
                        {stats.nextLockedStage ? stageLabels[stats.nextLockedStage.stage] ?? stats.nextLockedStage.stage : 'All stages unlocked'}
                      </p>
                      <p class="text-xs text-slate-500">
                        {stats.nextLockedStage ? 'Locked until earlier stages are mastered' : 'Quest awaits!'}
                      </p>
                    </div>
                  </div>

                  <ul class="mt-6 grid gap-2 text-xs text-slate-500 sm:grid-cols-2">
                    {#each path.subpaths as subpath}
                      <li class="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                        <div>
                          <span class="font-semibold text-slate-700">{stageLabels[subpath.stage] ?? subpath.stage}</span>
                          <p class="mt-1 text-[11px] text-slate-500">{subpath.stats.mastered}/{stageCapacity(subpath)} mastered</p>
                        </div>
                        <span class={`rounded-full px-2 py-0.5 uppercase tracking-[0.25em] ${stageStatusClasses(subpath)}`}>
                          {stageStatusLabel(subpath)}
                        </span>
                      </li>
                    {/each}
                  </ul>

                  <button
                    class={`mt-6 inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold uppercase tracking-[0.25em] transition ${path.isUnlocked ? 'bg-indigo-600 text-white hover:bg-indigo-500' : 'bg-slate-200 text-slate-500 cursor-not-allowed'}`}
                    type="button"
                    disabled={!path.isUnlocked}
                    aria-disabled={!path.isUnlocked}
                    on:click={() => goToPath(path)}
                    title={path.isUnlocked ? undefined : path.unlockRequirement ? `Master ${path.unlockRequirement} first` : 'Master the previous path first'}
                  >
                    {#if path.isUnlocked}
                      {#if stats.started}
                        Continue path
                      {:else if stats.pathStarted}
                        Begin subpath
                      {:else}
                        Begin path
                      {/if}
                    {:else}
                      Locked
                    {/if}
                  </button>
                </article>
          {/each}
        </section>
      {/if}
    </main>
  </div>
</div>
