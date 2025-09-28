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

  type Level = {
    id: string;
    title: string;
    subtitle?: string | null;
    description?: string | null;
    order: number;
    kind: string;
    isPublished: boolean;
    problems: { id: string; title: string; createdAt: string }[];
  };

  type Subpath = {
    id: string;
    title: string;
    description?: string | null;
    order: number;
    stage: string;
    levels: Level[];
  };

  type Path = {
    id: string;
    slug: string;
    title: string;
    description?: string | null;
    themeColor?: string | null;
    order: number | null;
    subpaths: Subpath[];
  };

  let paths: Path[] = [];
  let loading = true;
  let errorMessage = '';
  let userName = '';

  function orderSubpaths(items: Subpath[]): Subpath[] {
    return [...items].sort((a, b) => a.order - b.order);
  }

  function orderLevels(items: Level[]): Level[] {
    return [...items].sort((a, b) => a.order - b.order);
  }

  async function loadPaths() {
    const auth = get(authStore);
    if (!auth) {
      await goto('/login');
      return;
    }

    userName = auth.user.displayName ?? auth.user.email;

    try {
      paths = await apiFetch<Path[]>('/paths', { token: auth.token });
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

  function startPath(path: Path) {
    const firstSubpath = orderSubpaths(path.subpaths)[0];
    const firstLevel = firstSubpath ? orderLevels(firstSubpath.levels)[0] : undefined;
    const firstProblem = firstLevel?.problems?.[0];

    if (firstProblem) {
      void goto(`/problem/${firstProblem.id}`);
      return;
    }

    alert(`The ${path.title} journey is under construction. Stay tuned!`);
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
          <p class="mt-4 max-w-2xl text-indigo-100">
            Choose a path to build AMC competition instincts. Each track moves from foundational drills to Olympiad-style boss fights.
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
        <strong class="font-semibold">Prototype note:</strong> problem sets are still under construction. Selecting a path gives you a preview of the planned journey.
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
        <section class="grid gap-8 md:grid-cols-2">
          {#each paths as path}
            <article class="flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <header>
                <p class="text-xs uppercase tracking-[0.3em] text-slate-400">{path.slug.replace(/-/g, ' ')}</p>
                <h2 class="mt-2 text-2xl font-semibold text-slate-900">{path.title}</h2>
                {#if path.description}
                  <p class="mt-2 text-sm text-slate-600">{path.description}</p>
                {/if}
              </header>

              <ol class="mt-6 space-y-4 text-sm text-slate-600">
                {#each orderSubpaths(path.subpaths) as subpath}
                  <li class="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                    <div class="flex items-center justify-between gap-2">
                      <p class="font-semibold text-slate-800">{subpath.title}</p>
                      <span class="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">{subpath.stage}</span>
                    </div>
                    {#if subpath.description}
                      <p class="mt-2 text-xs text-slate-500">{subpath.description}</p>
                    {/if}
                    <ul class="mt-3 space-y-2 text-xs text-slate-500">
                      {#each orderLevels(subpath.levels) as level}
                        <li class="rounded-xl border border-slate-200 bg-white/80 px-3 py-2">
                          <p class="font-semibold text-slate-700">{level.title}</p>
                          {#if level.subtitle}
                            <p class="text-[11px] uppercase tracking-[0.2em] text-indigo-500">{level.subtitle}</p>
                          {/if}
                          {#if level.description}
                            <p class="mt-1 text-[11px] text-slate-500">{level.description}</p>
                          {/if}
                          {#if !level.isPublished}
                            <p class="mt-2 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-700">
                              Under construction
                            </p>
                          {/if}
                        </li>
                      {/each}
                    </ul>
                  </li>
                {/each}
              </ol>

              <button
                class="mt-6 inline-flex items-center justify-center rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold uppercase tracking-[0.25em] text-white transition hover:bg-indigo-500"
                type="button"
                on:click={() => startPath(path)}
              >
                Begin path
              </button>
            </article>
          {/each}
        </section>
      {/if}
    </main>
  </div>
</div>
