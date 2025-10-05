<script lang="ts">
  import { goto } from '$app/navigation';
  import { onDestroy, onMount } from 'svelte';
  import { get } from 'svelte/store';
  import MathInput from '$components/MathInput.svelte';
  import TextWithMath from '$components/TextWithMath.svelte';
  import KatexBlock from '$components/KatexBlock.svelte';
  import { apiFetch } from '$lib/api';
  import type { NumericAnswer, ProblemDefinition } from '$lib/problems';
  import StoryPanelModal from '$lib/components/StoryPanelModal.svelte';
  import {
    getStoryBeatForPath,
    getStoryBeatForProblem,
    getStoryBeatByProblemId,
  } from '$lib/story';
  import type { StoryBeat } from '$lib/story';
  import { authStore } from '$lib/stores/auth';
  import {
    markStoryBeatAcknowledged,
    hasAcknowledgedStoryBeat,
  } from '$lib/stores/story-progress';
  import type { PageData } from './$types';

  type AttemptStatus = 'idle' | 'correct' | 'incorrect';
  type AttemptOutcome = 'CORRECT' | 'INCORRECT' | 'SKIPPED';

  type RemoteProblem = {
    id: string;
    title: string | null;
    statement: string;
    solution: string | null;
    metadata: unknown;
    level: {
      id: string;
      title: string;
      points: number;
      subpath: {
        id: string;
        stage: string;
        title: string;
        path: {
          slug: string;
          title: string;
        };
      };
    };
    hints: { order: number; content: string }[];
    createdAt: string;
  };

  type AttemptResponse = {
    attempt: {
      id: string;
      outcome: AttemptOutcome;
      hintsUsed: number;
      timeSpentSec: number | null;
      submittedAt: string;
    };
    progress: {
      status: string;
      masteryScore: number | null;
      attemptsCount: number;
      hintsUsed: number;
      lastInteraction: string | null;
    };
    level: {
      id: string;
      points: number;
    };
    attempts?: AttemptRecord[];
  };

  type AttemptRecord = AttemptResponse['attempt'];

  type AttemptSummaryPayload = {
    progress: AttemptResponse['progress'] | null;
    attempts: AttemptRecord[];
    level: AttemptResponse['level'];
  };

  export let data: PageData & {
    problemId: string;
    source: 'sample' | 'remote';
    pathSlug: string | null;
    problemOrder: number | null;
  };

  let problem: ProblemDefinition | null = data.problem;
  let source = data.source;
  let problemId = data.problemId;
  let pathSlugHint = data.pathSlug;
  let problemOrderHint = data.problemOrder;

  let loading = source === 'remote';
  let fetchError = '';

  let revealedHints = 0;
  let attemptValue = '';
  let attempts = 0;
  let attemptStatus: AttemptStatus = 'idle';
  let feedback = '';
  let submissionError = '';
  let submitting = false;
  let solutionUnlocked = false;
  let gaveUp = false;
  let elapsedSeconds = 0;
  let startTime = Date.now();
  let timer: ReturnType<typeof setInterval> | undefined;
  let lastProgress: AttemptResponse['progress'] | null = null;
  let lastOutcome: AttemptOutcome | null = null;
  let earnedPoints = 0;
  let attemptHistory: AttemptRecord[] = [];
  let storyPanel: StoryBeat | null = null;
  let storyModalOpen = false;
  let storyInitialized = false;
  let storyContext: StoryBeat['context'] | null = null;
  let storyAcknowledged = true;
  let nextStoryPanel: StoryBeat | null = null;
  let showContinueButton = false;

  function formatStatusLabel(status: string): string {
    const lower = status.toLowerCase().replace(/_/g, ' ');
    return lower
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  $: if (data.problemId !== problemId) {
    source = data.source;
    problemId = data.problemId;
    pathSlugHint = data.pathSlug;
    problemOrderHint = data.problemOrder;
    problem = data.problem;

    loading = source === 'remote';
    fetchError = '';
    storyInitialized = false;
    storyPanel = null;
    storyContext = null;
    storyAcknowledged = true;
    showContinueButton = false;
    nextStoryPanel = null;

    lastProgress = null;
    lastOutcome = null;
    earnedPoints = 0;
    attemptHistory = [];

    resetSession();

    if (source === 'remote') {
      void loadRemoteProblem();
    }
  }

  function handleStoryClose() {
    storyModalOpen = false;
    if (storyContext === 'problem') {
      storyAcknowledged = true;
    }
  }

  function handleStoryContinue() {
    const target = storyPanel;

    storyModalOpen = false;
    storyAcknowledged = true;
    storyPanel = null;
    storyContext = null;
    nextStoryPanel = null;
    showContinueButton = false;

    if (
      target &&
      target.context === 'problem' &&
      target.problemId &&
      target.problemId !== problemId
    ) {
      markStoryBeatAcknowledged(target.id);
      const params = new URLSearchParams();
      const slug = target.pathSlug ?? pathSlugHint ?? problem?.pathSlug ?? null;

      if (slug) {
        params.set('path', slug);
      }

      if (typeof target.problemOrder === 'number') {
        params.set('order', target.problemOrder.toString());
      }

      const query = params.toString();
      void goto(`/problem/${target.problemId}${query ? `?${query}` : ''}`);
    }
  }

  function handleContinuePath() {
    if (!nextStoryPanel) return;
    storyPanel = nextStoryPanel;
    storyContext = nextStoryPanel.context;
    storyModalOpen = true;
    storyAcknowledged = false;
  }

  function normalizeAnswer(metadata: unknown): NumericAnswer {
    if (!metadata || typeof metadata !== 'object') {
      return {
        type: 'numeric',
        value: 0,
        tolerance: 0,
        success: 'Great work!',
        failure: 'Keep exploring the algebraic steps.',
      };
    }

    const raw = (metadata as Record<string, unknown>).answer as Record<string, unknown> | undefined;
    if (!raw) {
      return {
        type: 'numeric',
        value: 0,
        tolerance: 0,
        success: 'Great work!',
        failure: 'Keep exploring the algebraic steps.',
      };
    }

    return {
      type: 'numeric',
      value: typeof raw.value === 'number' ? raw.value : 0,
      tolerance: typeof raw.tolerance === 'number' ? raw.tolerance : 0,
      success: typeof raw.success === 'string' ? raw.success : 'Great work!',
      failure: typeof raw.failure === 'string' ? raw.failure : 'Keep exploring the algebraic steps.',
    };
  }

  function getObjectives(metadata: Record<string, unknown>): string[] {
    const objectives = metadata.objectives;
    if (Array.isArray(objectives)) {
      return objectives
        .filter((item): item is string => typeof item === 'string')
        .map((item) => item.trim())
        .filter(Boolean);
    }
    return [];
  }

  function getSolutionSteps(metadata: Record<string, unknown>, fallback: string | null) {
    const steps = metadata.solutionSteps;
    if (Array.isArray(steps) && steps.length > 0) {
      return steps
        .filter((step): step is { text: string; expression?: string } =>
          typeof step === 'object' && step !== null && typeof step.text === 'string',
        )
        .map((step) => ({
          text: step.text,
          expression: typeof step.expression === 'string' ? step.expression : undefined,
        }));
    }

    if (fallback) {
      return [
        {
          text: fallback,
        },
      ];
    }

    return [
      {
        text: 'Solution steps will appear here soon.',
      },
    ];
  }

  function transformRemoteProblem(remote: RemoteProblem): ProblemDefinition {
    const metadata =
      (remote.metadata && typeof remote.metadata === 'object'
        ? (remote.metadata as Record<string, unknown>)
        : {}) ?? {};
    const answer = normalizeAnswer(metadata);
    const tagline =
      typeof metadata.tagline === 'string' ? metadata.tagline : remote.level.subpath.title;
    const objectives = getObjectives(metadata);
    const solutionSteps = getSolutionSteps(metadata, remote.solution);

    return {
      id: remote.id,
      title: remote.title ?? remote.level.title,
      tagline,
      difficulty: `Worth ${remote.level.points} pts`,
      objectives: objectives.length > 0 ? objectives : [`Stage: ${remote.level.subpath.title}`],
      question: remote.statement,
      hints: remote.hints
        .sort((a, b) => a.order - b.order)
        .map((hint, index) => ({
          title: `Hint ${index + 1}`,
          body: hint.content,
        })),
      solution: solutionSteps,
      answer,
      pathSlug: remote.level.subpath.path?.slug,
      metadata: {
        competition: 'AMC',
        division: 'Junior',
        year: new Date(remote.createdAt ?? Date.now()).getFullYear(),
        questionNumber: 0,
      },
    };
  }

  $: if (!storyInitialized && problem) {
    storyPanel = null;
    storyContext = null;
    storyModalOpen = false;
    storyAcknowledged = true;
    showContinueButton = false;
    nextStoryPanel = null;

    const storySlug = pathSlugHint ?? problem.pathSlug ?? null;
    if (storySlug) {
      let panel = getStoryBeatForProblem(storySlug, problemOrderHint ?? undefined);
      if (!panel) {
        panel = getStoryBeatForPath(storySlug);
      }
      if (panel) {
        storyPanel = panel;
        storyContext = panel.context;
        const alreadySeen =
          panel.context === 'problem' ? hasAcknowledgedStoryBeat(panel.id) : false;
        storyAcknowledged = alreadySeen ? true : false;
        storyModalOpen = alreadySeen ? false : true;
      }
    }
    storyInitialized = true;
  }

  async function loadRemoteProblem(): Promise<void> {
    const auth = get(authStore);
    if (!auth) {
      await goto('/login');
      return;
    }

    try {
      const remote = await apiFetch<RemoteProblem>(`/problems/${problemId}/`, {
        token: auth.token,
      });
      problem = transformRemoteProblem(remote);
      resetSession();
      loading = false;

      try {
        const summary = await apiFetch<AttemptSummaryPayload>(
          `/problems/${problemId}/summary`,
          {
            token: auth.token,
          },
        );
        lastProgress = summary.progress;
        attemptHistory = summary.attempts;
        attempts = summary.progress?.attemptsCount ?? 0;
        earnedPoints = summary.level.points ?? earnedPoints;
        if (summary.progress?.status === 'MASTERED') {
          solutionUnlocked = true;
        }
      } catch (summaryError) {
        console.warn('Failed to load attempt summary', summaryError);
      }
    } catch (error) {
      fetchError = error instanceof Error ? error.message : 'Failed to load problem.';
      loading = false;
    }
  }

  async function submitAttempt(outcome: AttemptOutcome, responseValue: string) {
    const auth = get(authStore);
    if (!auth) {
      await goto('/login');
      return null;
    }

    submitting = true;
    submissionError = '';

    try {
      const payload = await apiFetch<AttemptResponse>(`/problems/${problemId}/attempts/`, {
        method: 'POST',
        token: auth.token,
        body: {
          outcome,
          response: responseValue || undefined,
          hintsUsed: revealedHints,
          timeSpentSec: elapsedSeconds,
        },
      });

      lastProgress = payload.progress;
      lastOutcome = payload.attempt.outcome;
      attempts = payload.progress.attemptsCount ?? attempts + 1;
      earnedPoints = payload.level?.points ?? earnedPoints;
      attemptHistory = [payload.attempt, ...attemptHistory].slice(0, 10);
      return payload;
    } catch (error) {
      submissionError = error instanceof Error ? error.message : 'Failed to record attempt.';
      throw error;
    } finally {
      submitting = false;
    }
  }

  onMount(() => {
    startTime = Date.now();
    timer = setInterval(() => {
      elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
    }, 1000);

    if (source === 'remote') {
      void loadRemoteProblem();
    }
  });

  onDestroy(() => {
    if (timer) {
      clearInterval(timer);
    }
  });

  function revealNextHint() {
    console.log('revealNextHint invoked', { problemPresent: !!problem, submitting, revealedHints });
    if (!problem || submitting) return;
    if (revealedHints < problem.hints.length) {
      revealedHints += 1;
    }
  }

  async function revealSolution() {
    if (!problem) return;
    if (solutionUnlocked) {
      return;
    }

    solutionUnlocked = true;
    gaveUp = true;
    revealedHints = problem.hints.length;
    attemptStatus = 'idle';
    feedback = 'Solution revealed below. Take time to study each step.';

    if (lastOutcome !== 'CORRECT') {
      try {
        await submitAttempt('SKIPPED', attemptValue);
      } catch (error) {
        // swallow error so the UI still reveals the solution
      }
    }
  }

  function resetSession() {
    revealedHints = 0;
    attemptValue = '';
    attempts = lastProgress?.attemptsCount ?? 0;
    attemptStatus = 'idle';
    feedback = '';
    submissionError = '';
    solutionUnlocked = false;
    gaveUp = false;
    startTime = Date.now();
    elapsedSeconds = 0;
    showContinueButton = false;
    nextStoryPanel = null;
  }

  async function checkAnswer() {
    console.log('checkAnswer invoked', { problemPresent: !!problem, submitting, attemptValue });
    if (!problem || submitting) return;

    const answerDef = problem.answer;

    if (answerDef.type !== 'numeric') {
      attemptStatus = 'incorrect';
      feedback = 'This problem is not configured for numeric answers yet.';
      return;
    }

    const numeric = evaluateResponse(attemptValue);
    if (numeric === null) {
      attemptStatus = 'incorrect';
      feedback = 'Please enter a numeric value. Fractions such as "116/2" or "\\frac{116}{2}" are supported.';
      return;
    }

    const tolerance = answerDef.tolerance ?? 0;
    const isCorrect = Math.abs(numeric - answerDef.value) <= tolerance;
    const outcome: AttemptOutcome = isCorrect ? 'CORRECT' : 'INCORRECT';

    console.log('Attempt prepared', {
      numeric,
      expected: answerDef.value,
      tolerance,
      outcome,
      attemptValue,
    });

    attemptStatus = isCorrect ? 'correct' : 'incorrect';
    feedback = isCorrect ? answerDef.success : answerDef.failure;
    solutionUnlocked = solutionUnlocked || isCorrect;

    if (isCorrect) {
      const storySlug = pathSlugHint ?? problem.pathSlug ?? null;
      const currentStoryBeat =
        storySlug && problem.id ? getStoryBeatByProblemId(storySlug, problem.id) : null;
      const baseOrder = currentStoryBeat?.problemOrder ?? problemOrderHint ?? 0;
      const nextOrder = baseOrder + 1;
      if (storySlug) {
        const upcomingPanel = getStoryBeatForProblem(storySlug, nextOrder);
        if (upcomingPanel) {
          nextStoryPanel = upcomingPanel;
          showContinueButton = true;
        } else {
          nextStoryPanel = null;
          showContinueButton = false;
        }
      } else {
        nextStoryPanel = null;
        showContinueButton = false;
      }
    } else {
      nextStoryPanel = null;
      showContinueButton = false;
    }

    try {
      const result = await submitAttempt(outcome, attemptValue);
      console.log('Attempt response', result);
      if (result && outcome === 'CORRECT') {
        feedback = `${answerDef.success} You earned ${result.level.points} pts.`;
      }
    } catch (error) {
      // keep UI state but ensure user sees the submission error message
      console.error('Attempt submission failed', error);
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

  $: totalHints = problem ? problem.hints.length : 0;
  $: canRevealMore = problem ? revealedHints < totalHints : false;
  $: feedbackTone =
    attemptStatus === 'correct'
      ? 'text-emerald-600'
      : attemptStatus === 'incorrect'
        ? 'text-rose-600'
        : 'text-slate-600';
  $: elapsedLabel = formatElapsed(elapsedSeconds);
  $: pageTitle = problem ? `${problem.title} · AMC Math Prototype` : 'AMC Math Prototype';
  $: pageDescription = problem
    ? `Australian Mathematics Competition practice: ${problem.title}`
    : 'Attempt an AMC Math Engine problem.';
  $: masterySummary = lastProgress
    ? `${formatStatusLabel(lastProgress.status)} • ${lastProgress.masteryScore ?? 0} pts`
    : null;

  function formatDuration(seconds: number | null): string {
    if (seconds === null || seconds === undefined) return '—';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  }

  function formatTimestamp(iso: string): string {
    if (!iso) return '—';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleString();
  }
</script>

<svelte:head>
  <title>{pageTitle}</title>
  <meta name="description" content={pageDescription} />
</svelte:head>

<StoryPanelModal
  open={storyModalOpen}
  panel={storyPanel}
  continueLabel={storyPanel?.context === 'problem' ? 'Attempt Problem' : 'Continue'}
  actionHint={storyPanel?.context === 'problem' ? 'leave' : 'close'}
  on:close={handleStoryClose}
  on:continue={handleStoryContinue}
/>

{#if storyAcknowledged || !storyPanel}
  <div class="mx-auto max-w-5xl space-y-8 px-6 py-10">
  {#if loading}
    <div class="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
      Loading problem…
    </div>
  {:else if fetchError}
    <div class="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center text-rose-600 shadow-sm">
      {fetchError}
    </div>
  {:else if problem}
    <header class="space-y-2 text-center">
      <div class="flex items-center justify-between">
        <a class="text-sm font-semibold text-indigo-500 transition hover:text-indigo-700" href="/dashboard">← Back to dashboard</a>
        {#if masterySummary}
          <span class="text-xs uppercase tracking-[0.3em] text-indigo-400">{masterySummary}</span>
        {/if}
      </div>
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
        <TextWithMath text={problem.question} />
          {#if problem.diagram}
            <figure class="rounded-xl border border-slate-100 bg-slate-50 p-4 text-center">
              {#if problem.diagram.type === 'image'}
                <img
                  src={problem.diagram.src}
                  alt={problem.diagram.alt}
                  class="mx-auto h-auto max-h-80 w-full max-w-xl object-contain"
                  loading="lazy"
                />
              {:else if problem.diagram.type === 'component'}
                <svelte:component this={problem.diagram.component} />
              {/if}
              {#if problem.diagram.caption}
                <figcaption class="mt-3 text-sm text-slate-500">{problem.diagram.caption}</figcaption>
              {/if}
            </figure>
          {/if}
          <p class="text-sm text-slate-500">
            Try to reason it out before revealing hints. You can submit a simplified numeric answer or a fraction.
          </p>
        </div>
   </section>
    <div class="grid gap-6 lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)]">
      <aside class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="text-lg font-semibold text-slate-900">Your progress</h2>
        {#if lastProgress}
          <dl class="mt-4 space-y-3 text-sm text-slate-600">
            <div class="flex items-center justify-between">
              <dt>Status</dt>
              <dd class="font-semibold text-indigo-600">{formatStatusLabel(lastProgress.status)}</dd>
            </div>
            <div class="flex items-center justify-between">
              <dt>Total attempts</dt>
              <dd>{lastProgress.attemptsCount}</dd>
            </div>
            <div class="flex items-center justify-between">
              <dt>Hints used</dt>
              <dd>{lastProgress.hintsUsed}</dd>
            </div>
            <div class="flex items-center justify-between">
              <dt>Last interaction</dt>
              <dd>{formatTimestamp(lastProgress.lastInteraction ?? '')}</dd>
            </div>
          </dl>
        {:else}
          <p class="mt-4 text-sm text-slate-500">
            No attempts recorded yet. Submit an answer to start tracking your progress.
          </p>
        {/if}

        {#if attemptHistory.length > 0}
          <div class="mt-6">
            <h3 class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Recent attempts</h3>
            <ul class="mt-3 space-y-2 text-sm text-slate-600">
              {#each attemptHistory as item, index}
                <li class="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                  <p class="flex items-center justify-between">
                    <span>#{attemptHistory.length - index}</span>
                    <span class={item.outcome === 'CORRECT' ? 'text-emerald-600 font-semibold' : item.outcome === 'INCORRECT' ? 'text-rose-600 font-semibold' : 'text-slate-500'}>{item.outcome}</span>
                  </p>
                  <p class="mt-1 text-xs text-slate-500">
                    Hints: {item.hintsUsed} · Time: {formatDuration(item.timeSpentSec)}
                  </p>
                  <p class="mt-1 text-[11px] text-slate-400">{formatTimestamp(item.submittedAt)}</p>
                </li>
              {/each}
            </ul>
          </div>
        {/if}
      </aside>

      <div class="space-y-8">
        <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-slate-900">Submit your attempt</h2>
            <button
              class="text-xs font-semibold uppercase tracking-[0.3em] text-rose-500 transition hover:text-rose-600"
              type="button"
            on:click={resetSession}
          >
            Reset session
          </button>
        </div>

        <div class="mt-4 space-y-4">
          <MathInput bind:value={attemptValue} placeholder="Type your answer or expression" />
          <div class="flex flex-wrap gap-3">
            <button
              class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-indigo-500 disabled:opacity-50"
              type="button"
              on:click={checkAnswer}
              disabled={!attemptValue || submitting}
            >
              Check answer
            </button>
            <button
              class="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600 disabled:opacity-50"
              type="button"
              on:click={revealNextHint}
              disabled={!canRevealMore || submitting}
            >
              Reveal hint
            </button>
            <button
              class="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-amber-700 transition hover:border-amber-300 hover:bg-amber-100 disabled:opacity-60"
              type="button"
              on:click={revealSolution}
              disabled={submitting || solutionUnlocked || !problem || revealedHints < problem.hints.length}
            >
              Give me the solution
            </button>
          </div>
        </div>

          {#if feedback}
            <p class={`mt-4 rounded-lg bg-slate-50 px-4 py-3 text-sm ${feedbackTone}`}>
              <TextWithMath text={feedback} />
            </p>
          {/if}

          {#if showContinueButton && nextStoryPanel && !storyModalOpen}
            <div class="mt-4">
              <button
                class="inline-flex items-center justify-center rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold uppercase tracking-[0.25em] text-white transition hover:bg-indigo-500"
                type="button"
                on:click={handleContinuePath}
              >
                Continue path
              </button>
            </div>
          {/if}

          {#if submissionError}
            <p class="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
              {submissionError}
            </p>
          {/if}
        </section>

        <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <header class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-slate-900">Hints</h2>
            <span class="text-xs uppercase tracking-[0.3em] text-slate-400">{revealedHints}/{totalHints}</span>
          </header>
          <ol class="mt-4 space-y-3">
          {#each problem.hints as hint, index}
            <li class={`rounded-xl border border-slate-200 p-4 transition ${index < revealedHints ? 'bg-white' : 'bg-slate-50'}`}>
              <p class="text-sm font-semibold text-slate-800">{hint.title}</p>
              {#if index < revealedHints}
                <p class="mt-1 text-sm text-slate-600">
                  <TextWithMath text={hint.body} />
                </p>
                {#if hint.expression}
                  <KatexBlock expression={hint.expression} />
                {/if}
              {:else}
                <p class="mt-1 text-xs text-slate-400">Unlock this hint to reveal its guidance.</p>
              {/if}
            </li>
          {/each}
        </ol>
        </section>

        <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 class="text-lg font-semibold text-slate-900">Solution outline</h2>
          <ol class="mt-4 space-y-3">
            {#each problem.solution as step, index}
              <li class={`rounded-xl border border-slate-100 p-4 ${solutionUnlocked ? 'bg-white' : 'bg-slate-50'}`}>
                <div class="flex items-start gap-3">
                <span class="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-sm font-semibold text-indigo-600">
                  {index + 1}
                </span>
                <div class="space-y-2 text-sm text-slate-700">
                  {#if solutionUnlocked}
                    <TextWithMath text={step.text} />
                    {#if step.expression}
                      <KatexBlock expression={step.expression} />
                    {/if}
                  {:else}
                    <p class="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Unlock the solution to view this step.
                    </p>
                  {/if}
                </div>
              </div>
              </li>
            {/each}
          </ol>
          {#if !solutionUnlocked}
            <p class="mt-4 text-xs uppercase tracking-[0.3em] text-slate-400">
              Keep working through hints or check your answer to unlock the full solution.
            </p>
          {/if}
        </section>
      </div>
    </div>
  {/if}
  </div>
{/if}
