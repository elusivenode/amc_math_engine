<svelte:head>
  <title>AMC Math Prototype</title>
  <meta
    name="description"
    content="Step-by-step Australian Mathematics Competition style practice problem with hints and beautiful math rendering."
  />
</svelte:head>

<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import MathInput from '$components/MathInput.svelte';
  import KatexBlock from '$components/KatexBlock.svelte';

  type AttemptStatus = 'idle' | 'correct' | 'incorrect';

  const problem = {
    id: 'sequence-20th-term',
    title: 'Arithmetic Ladder',
    tagline: 'Warm-up inspired by the Australian Mathematics Competition',
    difficulty: 'Junior · Warm-up',
    objectives: ['Identify the common difference of an arithmetic sequence', 'Apply the nth-term formula'],
    question: 'The sequence 1, 4, 7, ... increases by the same amount each time. What is the value of the 20th term?',
    hints: [
      {
        title: 'Step 1 · Spot the pattern',
        body: 'Write down the first few terms. How much is added each time you move to the next term?'
      },
      {
        title: 'Step 2 · Name the formula',
        body: 'An arithmetic sequence with first term a_1 and difference d satisfies',
        expression: 'a_n = a_1 + (n - 1) \times d'
      },
      {
        title: 'Step 3 · Substitute values',
        body: 'Here a_1 = 1, d = 3, and n = 20. Plug these into the formula before simplifying.',
        expression: 'a_{20} = 1 + (20 - 1) \times 3'
      }
    ],
    solution: [
      {
        text: 'The first term is 1 and each successive term increases by 3, so d = 3.'
      },
      {
        text: 'Use the nth-term formula for an arithmetic sequence.',
        expression: 'a_n = a_1 + (n - 1) d'
      },
      {
        text: 'Substitute n = 20, a_1 = 1 and d = 3.',
        expression: 'a_{20} = 1 + (20 - 1) \times 3'
      },
      {
        text: 'Evaluate the product and sum to reach the final value.',
        expression: 'a_{20} = 1 + 19 \times 3 = 58'
      }
    ],
    answer: {
      value: 58,
      tolerance: 1e-6,
      success: 'Correct! You applied the arithmetic sequence formula cleanly.',
      failure: 'Not quite. Double-check the difference and your substitution into the formula.'
    }
  } as const;

  let revealedHints = 0;
  let attemptValue = '';
  let attempts = 0;
  let attemptStatus: AttemptStatus = 'idle';
  let feedback = '';
  let solutionUnlocked = false;
  let gaveUp = false;
  let elapsedSeconds = 0;
  let startTime = Date.now();
  let timer: ReturnType<typeof setInterval> | undefined;

  onMount(() => {
    startTime = Date.now();
    timer = setInterval(() => {
      elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
    }, 1000);
  });

  onDestroy(() => {
    if (timer) {
      clearInterval(timer);
    }
  });

  const totalHints = problem.hints.length;

  function revealNextHint() {
    if (revealedHints < totalHints) {
      revealedHints += 1;
    }
  }

  function revealSolution() {
    solutionUnlocked = true;
    gaveUp = true;
    revealedHints = totalHints;
    attemptStatus = 'idle';
    feedback = 'Solution revealed below. Take time to study each step.';
  }

  function resetSession() {
    attemptValue = '';
    attempts = 0;
    attemptStatus = 'idle';
    feedback = '';
    solutionUnlocked = false;
    gaveUp = false;
    revealedHints = 0;
    startTime = Date.now();
    elapsedSeconds = 0;
  }

  function checkAnswer() {
    attempts += 1;
    const numeric = evaluateResponse(attemptValue);
    if (numeric === null) {
      attemptStatus = 'incorrect';
      feedback = 'Please enter a numeric value. Fractions such as "116/2" or "\\frac{116}{2}" are supported.';
      return;
    }

    const tolerance = problem.answer.tolerance ?? 0;
    if (Math.abs(numeric - problem.answer.value) <= tolerance) {
      attemptStatus = 'correct';
      feedback = problem.answer.success;
      solutionUnlocked = true;
    } else {
      attemptStatus = 'incorrect';
      feedback = problem.answer.failure;
    }
  }

  function evaluateResponse(rawInput: string): number | null {
    if (!rawInput) return null;
    let normalized = rawInput.trim();
    if (!normalized) return null;

    normalized = normalized.replace(/\frac\{([^{}]+)\}\{([^{}]+)\}/g, (_match, numerator, denominator) => {
      const top = parseFloat(numerator.replace(/[^0-9.+\-]/g, ''));
      const bottom = parseFloat(denominator.replace(/[^0-9.+\-]/g, ''));
      if (!Number.isFinite(top) || !Number.isFinite(bottom) || bottom === 0) return 'NaN';
      return `(${top})/(${bottom})`;
    });

    normalized = normalized
      .replace(/\\cdot|\\times/g, '*')
      .replace(/\\div/g, '/')
      .replace(/\\left|\\right/g, '')
      .replace(/\\!/g, '')
      .replace(/\\,/g, '')
      .replace(/\\ /g, '')
      .replace(/[{}]/g, '')
      .trim();

    if (!normalized) return null;

    if (/^[-+]?[0-9]+(?:\.[0-9]+)?$/.test(normalized)) {
      const direct = Number(normalized);
      return Number.isFinite(direct) ? direct : null;
    }

    if (/^[-+]?[0-9]+(?:\.[0-9]+)?\s*\/\s*[-+]?[0-9]+(?:\.[0-9]+)?$/.test(normalized)) {
      const [numerator, denominator] = normalized.split('/').map((segment) => Number(segment.trim()));
      if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) return null;
      return numerator / denominator;
    }

    if (!/^[0-9+\-*/().\s]+$/.test(normalized)) {
      return null;
    }

    try {
      // eslint-disable-next-line no-new-func
      const result = new Function(`return (${normalized})`)();
      return typeof result === 'number' && Number.isFinite(result) ? result : null;
    } catch (error) {
      console.warn('Failed to evaluate response', error);
      return null;
    }
  }

  function formatElapsed(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const paddedMins = mins.toString().padStart(2, '0');
    const paddedSecs = secs.toString().padStart(2, '0');
    return `${paddedMins}:${paddedSecs}`;
  }

  $: canRevealMore = revealedHints < totalHints;
  $: feedbackTone = attemptStatus === 'correct' ? 'text-emerald-600' : attemptStatus === 'incorrect' ? 'text-rose-600' : 'text-slate-600';
  $: elapsedLabel = formatElapsed(elapsedSeconds);
</script>

<div class="mx-auto max-w-3xl space-y-8 px-6 py-10">
  <header class="space-y-2 text-center">
    <p class="text-sm uppercase tracking-[0.2em] text-indigo-500">Prototype</p>
    <h1 class="text-3xl font-semibold text-slate-900">{problem.title}</h1>
    <p class="text-base text-slate-600">{problem.tagline}</p>
  </header>

  <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <div class="flex flex-wrap items-center justify-between gap-4 text-sm text-slate-500">
      <span class="rounded-full bg-indigo-50 px-3 py-1 font-medium text-indigo-600">{problem.difficulty}</span>
      <div class="flex items-center gap-4">
        <span class="font-mono text-xs uppercase tracking-widest">Time {elapsedLabel}</span>
        <span class="font-mono text-xs uppercase tracking-widest">Attempts {attempts}</span>
      </div>
    </div>
    <div class="mt-6 space-y-4 text-lg text-slate-800">
      <p>{problem.question}</p>
      <p class="text-sm text-slate-500">Try to reason it out before revealing hints. You can submit a simplified numeric answer or a fraction.</p>
    </div>
  </section>

  <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <h2 class="text-lg font-semibold text-slate-900">Your turn</h2>
    <div class="mt-4 space-y-4">
      <MathInput
        value={attemptValue}
        placeholder="Enter your answer, e.g. 58"
        on:change={(event) => (attemptValue = event.detail)}
      />
      <div class="flex flex-wrap gap-3">
        <button
          class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-300"
          on:click={checkAnswer}
        >
          Check answer
        </button>
        <button
          class="rounded-lg border border-transparent px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
          on:click={resetSession}
        >
          Reset
        </button>
        <button
          class="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-500 transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:text-slate-300"
          on:click={revealNextHint}
          disabled={!canRevealMore}
        >
          Reveal next hint
        </button>
        <button
          class="rounded-lg border border-rose-200 px-4 py-2 text-sm font-medium text-rose-500 transition hover:border-rose-300 hover:text-rose-600"
          on:click={revealSolution}
        >
          Reveal full solution
        </button>
      </div>
      {#if feedback}
        <p class={`text-sm ${feedbackTone}`}>{feedback}</p>
      {/if}
    </div>
  </section>

  <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold text-slate-900">Hint track</h2>
      <span class="text-xs uppercase tracking-widest text-slate-400">{revealedHints}/{totalHints} revealed</span>
    </div>
    <div class="mt-4 space-y-4">
      {#if revealedHints === 0}
        <p class="text-sm text-slate-500">Hints unlock sequentially so learners commit to an idea before peeking.</p>
      {/if}
      {#each problem.hints.slice(0, revealedHints) as hint, index}
        <article class="rounded-xl border border-slate-100 bg-slate-50 p-4 shadow-inner">
          <h3 class="text-sm font-semibold uppercase tracking-wide text-indigo-500">{hint.title}</h3>
          <p class="mt-2 text-sm text-slate-700">{hint.body}</p>
          {#if hint.expression}
            <KatexBlock expression={hint.expression} />
          {/if}
          <p class="mt-2 text-[11px] uppercase tracking-[0.2em] text-slate-400">Hint {index + 1}</p>
        </article>
      {/each}
    </div>
  </section>

  {#if solutionUnlocked}
    <section class="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-emerald-700">Solution walkthrough</h2>
        {#if gaveUp}
          <span class="text-xs uppercase tracking-widest text-emerald-600">Revealed on request</span>
        {:else}
          <span class="text-xs uppercase tracking-widest text-emerald-600">Unlocked by success</span>
        {/if}
      </div>
      <ol class="mt-4 space-y-3 text-sm text-emerald-900">
        {#each problem.solution as step, stepIndex}
          <li class="rounded-lg border border-emerald-100 bg-white/80 p-4 shadow-sm">
            <p class="font-medium">Step {stepIndex + 1}</p>
            <p class="mt-1">{step.text}</p>
            {#if step.expression}
              <KatexBlock expression={step.expression} />
            {/if}
          </li>
        {/each}
      </ol>
    </section>
  {/if}
</div>
