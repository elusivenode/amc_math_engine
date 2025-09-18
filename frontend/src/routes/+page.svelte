<svelte:head>
  <title>AMC Math Prototype</title>
  <meta
    name="description"
    content="Browse Australian Mathematics Competition practice problems with scaffolded hints."
  />
</svelte:head>

<script lang="ts">
  import { listProblems } from '$lib/problems';

  const problems = listProblems();
</script>

<div class="mx-auto max-w-4xl px-6 py-16">
  <header class="space-y-4 text-center">
    <p class="text-sm uppercase tracking-[0.2em] text-indigo-500">Prototype</p>
    <h1 class="text-4xl font-semibold text-slate-900">AMC Coaching Library</h1>
    <p class="text-base text-slate-600">
      Pick a problem to unlock guided hints, instant feedback, and a full solution walkthrough.
    </p>
  </header>

  <section class="mt-12 grid gap-6 lg:grid-cols-2">
    {#each problems as problem}
      <a
        class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-md"
        href={`/problem/${problem.id}`}
      >
        <span class="text-xs uppercase tracking-[0.25em] text-slate-400">{problem.metadata.year} · {problem.metadata.division}</span>
        <h2 class="mt-3 text-xl font-semibold text-slate-900">{problem.title}</h2>
        <p class="mt-2 text-sm text-slate-600">{problem.tagline}</p>
        <p class="mt-4 text-xs font-semibold uppercase tracking-[0.3em] text-indigo-500">{problem.difficulty}</p>
      </a>
    {/each}
  </section>
</div>
