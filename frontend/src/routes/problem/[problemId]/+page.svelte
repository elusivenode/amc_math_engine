<script lang="ts">
  import { goto } from '$app/navigation';
  import { onDestroy, onMount } from 'svelte';
  import { get } from 'svelte/store';
  import MathInput from '$components/MathInput.svelte';
  import TextWithMath from '$components/TextWithMath.svelte';
  import KatexBlock from '$components/KatexBlock.svelte';
  import { apiFetch } from '$lib/api';
  import type { AnswerDefinition, ExpressionAnswer, NumericAnswer, ProblemDefinition } from '$lib/problems';
  import StoryPanelModal from '$lib/components/StoryPanelModal.svelte';
  import SubpathCompletionModal from '$lib/components/SubpathCompletionModal.svelte';
  import {
    getStoryBeatForPath,
    getStoryBeatForProblem,
    getStoryBeatByProblemId,
  } from '$lib/story';
  import { renderTextWithMath } from '$lib/utils/textWithMath';
  import type { StoryBeat } from '$lib/story';
  import { authStore } from '$lib/stores/auth';
  import {
    markStoryBeatAcknowledged,
    hasAcknowledgedStoryBeat,
  } from '$lib/stores/story-progress';
  import { hasCelebratedSubpath, markSubpathCelebrated } from '$lib/stores/subpath-celebrations';
  import { resolveJourneyMessage } from '$lib/journey/messages';
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

  type ProblemTileStatus = 'LOCKED' | 'READY' | 'IN_PROGRESS' | 'MASTERED' | 'COMING_SOON';

  type ProblemTileSummary = {
    order: number;
    title: string;
    status: ProblemTileStatus;
    isPlaceholder: boolean;
    isAccessible: boolean;
    problemId?: string;
  };

  type LevelSummary = {
    id: string;
    title: string;
    subtitle?: string | null;
    description?: string | null;
    tiles: ProblemTileSummary[];
    isCompleted: boolean;
  };

  type SubpathStats = {
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
    stats: SubpathStats;
  };

  type PathProgressResponse = {
    id: string;
    slug: string;
    title: string;
    description?: string | null;
    subpaths: SubpathSummary[];
  };

  type SubpathContext = {
    pathSlug: string;
    pathTitle: string;
    subpathId: string;
    subpathTitle: string;
    subpathStage: string;
    nextStage: string | null;
    nextSubpathTitle: string | null;
    wasCompleted: boolean;
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
  let mathInputRef: { insertAtCursor?: (text: string) => void } | null = null;
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
  let formattedFeedback = '';
  let showRadicalShortcut = false;
  let showExpressionShortcuts = false;
  let expressionShortcuts: string[] = [];
  let includeExponentShortcut = false;
  let diagramPopoverVisible = false;
  let diagramPopoverElement: HTMLDivElement | null = null;
  let diagramTriggerButton: HTMLButtonElement | null = null;
  let subpathContext: SubpathContext | null = null;
  let subpathContextLoading = false;
  let journeyModalOpen = false;
  let journeyHeading = 'Stage Complete';
  let journeyMessageText = 'Well done.';
  let journeyCtaLabel = 'CONTINUE YOUR JOURNEY';
  let journeySubpathTitle: string | null = null;
  let journeyNextSubpathTitle: string | null = null;
  let lastProblemReference: string | null = null;
  let answerInstruction = '';

  $: {
    if (problem?.answer?.type === 'numeric') {
      const numericAnswer = problem.answer as NumericAnswer;
      showRadicalShortcut = numericAnswer.supportsRadicals === true;
    } else {
      showRadicalShortcut = false;
    }

    if (problem?.answer?.type === 'expression') {
      const expressionAnswer = problem.answer as ExpressionAnswer;
      expressionShortcuts =
        Array.isArray(expressionAnswer.shortcuts) && expressionAnswer.shortcuts.length > 0
          ? expressionAnswer.shortcuts
          : expressionAnswer.variables && expressionAnswer.variables.length > 0
            ? expressionAnswer.variables
            : ['x', 'y'];
      includeExponentShortcut =
        expressionAnswer.includeExponentTwo === undefined
          ? true
          : expressionAnswer.includeExponentTwo;
      showExpressionShortcuts = expressionShortcuts.length > 0 || includeExponentShortcut;
    } else {
      expressionShortcuts = [];
      includeExponentShortcut = false;
      showExpressionShortcuts = false;
    }
  }

  function insertToken(token: string) {
    if (mathInputRef?.insertAtCursor) {
      mathInputRef.insertAtCursor(token);
    } else {
      attemptValue = `${attemptValue ?? ''}${token}`;
    }
  }

  function insertSquareRootSymbol() {
    insertToken('√');
  }

  function insertExponentTwo() {
    insertToken('²');
  }

  function showDiagramPopover() {
    diagramPopoverVisible = true;
  }

  function hideDiagramPopover() {
    diagramPopoverVisible = false;
  }

  function handleDiagramBlur(event: FocusEvent) {
    const related = event.relatedTarget as HTMLElement | null;
    if (related && diagramPopoverElement && diagramPopoverElement.contains(related)) {
      return;
    }
    hideDiagramPopover();
  }

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

  function findSubpathForProblem(
    progress: PathProgressResponse,
    targetProblemId: string,
  ): { subpath: SubpathSummary; nextSubpath: SubpathSummary | null } | null {
    for (let index = 0; index < progress.subpaths.length; index += 1) {
      const subpath = progress.subpaths[index];
      for (const level of subpath.levels) {
        for (const tile of level.tiles) {
          if (tile.problemId === targetProblemId) {
            return {
              subpath,
              nextSubpath: progress.subpaths[index + 1] ?? null,
            };
          }
        }
      }
    }

    return null;
  }

  async function refreshSubpathContext(): Promise<void> {
    if (!problem || source !== 'remote') {
      return;
    }

    const slug = pathSlugHint ?? problem.pathSlug ?? null;
    const auth = get(authStore);
    if (!slug || !auth) {
      return;
    }

    if (subpathContextLoading) {
      return;
    }

    subpathContextLoading = true;

    try {
      const progress = await apiFetch<PathProgressResponse>(`/paths/progress/${slug}`, {
        token: auth.token,
      });

      const located = findSubpathForProblem(progress, problem.id);
      if (located) {
        subpathContext = {
          pathSlug: progress.slug,
          pathTitle: progress.title,
          subpathId: located.subpath.id,
          subpathTitle: located.subpath.title,
          subpathStage: located.subpath.stage,
          nextStage: located.nextSubpath?.stage ?? null,
          nextSubpathTitle: located.nextSubpath?.title ?? null,
          wasCompleted: located.subpath.isCompleted,
        } satisfies SubpathContext;
      } else {
        subpathContext = null;
      }
    } catch (error) {
      console.warn('Failed to load subpath context', error);
      subpathContext = null;
    } finally {
      subpathContextLoading = false;
    }
  }

  async function maybeShowJourneyCelebration(previouslyCompleted: boolean): Promise<void> {
    if (!problem || source !== 'remote') {
      return;
    }

    const slug = subpathContext?.pathSlug ?? pathSlugHint ?? problem.pathSlug ?? null;
    const auth = get(authStore);
    if (!slug || !auth) {
      return;
    }

    try {
      const progress = await apiFetch<PathProgressResponse>(`/paths/progress/${slug}`, {
        token: auth.token,
      });

      const located = findSubpathForProblem(progress, problem.id);
      if (!located) {
        subpathContext = null;
        return;
      }

      subpathContext = {
        pathSlug: progress.slug,
        pathTitle: progress.title,
        subpathId: located.subpath.id,
        subpathTitle: located.subpath.title,
        subpathStage: located.subpath.stage,
        nextStage: located.nextSubpath?.stage ?? null,
        nextSubpathTitle: located.nextSubpath?.title ?? null,
        wasCompleted: located.subpath.isCompleted,
      } satisfies SubpathContext;

      if (previouslyCompleted || !located.subpath.isCompleted) {
        return;
      }

      if (hasCelebratedSubpath(located.subpath.id)) {
        return;
      }

      const message = await resolveJourneyMessage(
        progress.slug,
        located.subpath.stage,
        located.nextSubpath?.stage ?? null,
      );

      journeyHeading = message.heading ?? 'Stage Complete';
      journeyMessageText = message.message;
      journeyCtaLabel = message.ctaLabel ?? 'CONTINUE YOUR JOURNEY';
      journeySubpathTitle = located.subpath.title;
      journeyNextSubpathTitle = located.nextSubpath?.title ?? null;
      journeyModalOpen = true;

      markSubpathCelebrated(located.subpath.id);
    } catch (error) {
      console.warn('Failed to verify subpath completion', error);
    }
  }

  function closeJourneyModal() {
    journeyModalOpen = false;
  }

  function handleJourneyContinue() {
    closeJourneyModal();
    const slug = subpathContext?.pathSlug ?? pathSlugHint ?? problem?.pathSlug ?? null;
    if (slug) {
      const pathBeat = getStoryBeatForPath(slug);
      if (pathBeat) {
        markStoryBeatAcknowledged(pathBeat.id);
      }
      void goto(`/path/${slug}`);
    } else {
      void goto('/dashboard');
    }
  }

  const defaultNumericAnswer: NumericAnswer = {
    type: 'numeric',
    value: 0,
    tolerance: 0,
    success: 'Great work!',
    failure: 'Keep exploring the algebraic steps.',
    supportsRadicals: false,
  };

  function normalizeAnswer(metadata: unknown): AnswerDefinition {
    if (!metadata || typeof metadata !== 'object') {
      return defaultNumericAnswer;
    }

    const raw = (metadata as Record<string, unknown>).answer as Record<string, unknown> | undefined;
    if (!raw) {
      return defaultNumericAnswer;
    }

    const rawType = typeof raw.type === 'string' ? raw.type.toLowerCase() : 'numeric';

    if (rawType === 'pair') {
      const expected = raw.expected as Record<string, unknown> | undefined;
      const tolerance = raw.tolerance as Record<string, unknown> | undefined;

      if (
        expected &&
        typeof expected.first === 'number' &&
        typeof expected.second === 'number'
      ) {
        return {
          type: 'pair',
          expected: {
            first: expected.first,
            second: expected.second,
          },
          separator: typeof raw.separator === 'string' && raw.separator.length > 0 ? raw.separator : ',',
          firstLabel: typeof raw.firstLabel === 'string' ? raw.firstLabel : undefined,
          secondLabel: typeof raw.secondLabel === 'string' ? raw.secondLabel : undefined,
          tolerance: tolerance
            ? {
                first: typeof tolerance.first === 'number' ? tolerance.first : undefined,
                second: typeof tolerance.second === 'number' ? tolerance.second : undefined,
              }
            : undefined,
          orderMatters: raw.orderMatters === false ? false : true,
          inputHint: typeof raw.inputHint === 'string' ? raw.inputHint : undefined,
          success: typeof raw.success === 'string' ? raw.success : 'Great work!',
          failure: typeof raw.failure === 'string' ? raw.failure : 'Keep exploring the algebraic steps.',
        } satisfies AnswerDefinition;
      }
    }

    if (rawType === 'fraction') {
      const value = typeof raw.value === 'string' ? raw.value.trim() : '';
      if (value.length > 0) {
        return {
          type: 'fraction',
          value,
          success: typeof raw.success === 'string' ? raw.success : 'Great work!',
          failure:
            typeof raw.failure === 'string'
              ? raw.failure
              : 'Express the answer as a simplified fraction such as 3/4.',
          format: typeof raw.format === 'string' ? raw.format : undefined,
          inputHint:
            typeof raw.inputHint === 'string'
              ? raw.inputHint
              : typeof raw.format === 'string'
                ? `Answer format: ${raw.format}`
                : undefined,
        } satisfies AnswerDefinition;
      }
    }

    if (rawType === 'expression') {
      const value = typeof raw.value === 'string' ? raw.value.trim() : '';
      if (value.length > 0) {
        const variables =
          Array.isArray(raw.variables) && raw.variables.length > 0
            ? Array.from(
                new Set(
                  raw.variables
                    .map((item) => (typeof item === 'string' ? item.trim().toLowerCase() : ''))
                    .filter((item) => item.length > 0),
                ),
              )
            : undefined;
        const shortcuts =
          Array.isArray(raw.shortcuts) && raw.shortcuts.length > 0
            ? Array.from(
                new Set(
                  raw.shortcuts
                    .map((item) => (typeof item === 'string' ? item.trim() : ''))
                    .filter((item) => item.length > 0),
                ),
              )
            : undefined;
        const includeExponentTwo =
          raw.includeExponentTwo === undefined ? true : raw.includeExponentTwo === true;

        return {
          type: 'expression',
          value,
          variables,
          shortcuts,
          includeExponentTwo,
          success: typeof raw.success === 'string' ? raw.success : 'Great work!',
          failure:
            typeof raw.failure === 'string'
              ? raw.failure
              : 'Express the answer as a single simplified fraction.',
          inputHint:
            typeof raw.inputHint === 'string'
              ? raw.inputHint
              : 'Enter an algebraic expression such as (5y^2 - 8x)/(6x^2y).',
        } satisfies AnswerDefinition;
      }
    }

    if (rawType === 'ratio') {
      const value = typeof raw.value === 'string' ? raw.value.trim() : '';
      if (value.length > 0) {
        return {
          type: 'ratio',
          value,
          success: typeof raw.success === 'string' ? raw.success : 'Great work!',
          failure:
            typeof raw.failure === 'string'
              ? raw.failure
              : 'Follow the requested ratio format (e.g. 6:5).',
          inputHint:
            typeof raw.inputHint === 'string'
              ? raw.inputHint
              : typeof raw.format === 'string'
                ? `Answer format: ${raw.format}`
                : undefined,
        } satisfies AnswerDefinition;
      }
    }

    return {
      type: 'numeric',
      value: typeof raw.value === 'number' ? raw.value : 0,
      tolerance: typeof raw.tolerance === 'number' ? raw.tolerance : 0,
      success: typeof raw.success === 'string' ? raw.success : 'Great work!',
      failure: typeof raw.failure === 'string' ? raw.failure : 'Keep exploring the algebraic steps.',
      supportsRadicals: raw.supportsRadicals === true,
      inputHint: typeof raw.inputHint === 'string' ? raw.inputHint : undefined,
    } satisfies NumericAnswer;
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

  function getDiagram(metadata: Record<string, unknown>) {
    const raw = metadata.diagram;
    if (!raw || typeof raw !== 'object') {
      return undefined;
    }

    const diagram = raw as Record<string, unknown>;
    const type = typeof diagram.type === 'string' ? diagram.type : 'image';

    if (type === 'image') {
      const src = typeof diagram.src === 'string' ? diagram.src : null;
      const alt = typeof diagram.alt === 'string' ? diagram.alt : '';
      if (!src) {
        return undefined;
      }

      const displayRaw = typeof diagram.display === 'string' ? diagram.display : 'inline';
      const display: 'inline' | 'popover' = displayRaw === 'popover' ? 'popover' : 'inline';

      return {
        type: 'image' as const,
        src,
        alt,
        caption: typeof diagram.caption === 'string' ? diagram.caption : undefined,
        display,
      };
    }

    return undefined;
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
    const diagram = getDiagram(metadata);

    return {
      id: remote.id,
      title: remote.title ?? remote.level.title,
      tagline,
      difficulty: `Worth ${remote.level.points} pts`,
      objectives: objectives.length > 0 ? objectives : [`Stage: ${remote.level.subpath.title}`],
      question: remote.statement,
      diagram,
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

  function computeAnswerInstruction(answer: AnswerDefinition): string {
    if ('inputHint' in answer && typeof answer.inputHint === 'string' && answer.inputHint.length > 0) {
      return answer.inputHint;
    }

    switch (answer.type) {
      case 'pair': {
        const separator = answer.separator ?? ',';
        const firstLabel = answer.firstLabel ?? 'first value';
        const secondLabel = answer.secondLabel ?? 'second value';
        return `Enter your answer as two numbers separated by "${separator}" — ${firstLabel} first, ${secondLabel} second. Example: "12${separator}8".`;
      }
      case 'fraction':
        return 'Enter your answer as a simplified fraction such as $\\tfrac{3}{4}$.';
      case 'ratio':
        return 'Enter the ratio in the requested format (e.g. 6:5).';
      case 'expression':
        return 'Enter the simplified algebraic fraction, such as $\\dfrac{5y^2 - 8x}{6x^2y}$.';
      default:
        return 'Try to reason it out before revealing hints. You can submit a simplified numeric answer or a fraction.';
    }
  }

  $: answerInstruction = problem ? computeAnswerInstruction(problem.answer) : '';

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

  $: formattedFeedback = feedback ? renderTextWithMath(feedback) : '';

  $: if (problem && problem.id !== lastProblemReference) {
    lastProblemReference = problem.id;
    subpathContext = null;
    if (source === 'remote') {
      void refreshSubpathContext();
    }
    diagramPopoverVisible = false;
  }

  async function checkAnswer() {
    console.log('checkAnswer invoked', { problemPresent: !!problem, submitting, attemptValue });
    if (!problem || submitting) return;

    const answerDef = problem.answer;

    let outcome: AttemptOutcome;
    let isCorrect = false;

    if (answerDef.type === 'numeric') {
      const numeric = evaluateResponse(attemptValue);
      if (numeric === null) {
        attemptStatus = 'incorrect';
        feedback = 'Please enter a numeric value. Fractions such as "116/2" or "\\frac{116}{2}" are supported.';
        return;
      }

      const tolerance = answerDef.tolerance ?? 0;
      isCorrect = Math.abs(numeric - answerDef.value) <= tolerance;
      outcome = isCorrect ? 'CORRECT' : 'INCORRECT';

      console.log('Attempt prepared', {
        numeric,
        expected: answerDef.value,
        tolerance,
        outcome,
        attemptValue,
      });
    } else if (answerDef.type === 'pair') {
      const pair = evaluatePairResponse(attemptValue, answerDef.separator ?? ',');
      if (!pair) {
        attemptStatus = 'incorrect';
        feedback =
          answerDef.inputHint ??
          `Please enter two numbers separated by a comma${answerDef.firstLabel || answerDef.secondLabel ? ' (for example: 12,8)' : ''}.`;
        return;
      }

      const toleranceFirst = answerDef.tolerance?.first ?? 0;
      const toleranceSecond = answerDef.tolerance?.second ?? 0;
      const orderMatters = answerDef.orderMatters !== false;

      const firstOk = Math.abs(pair.first - answerDef.expected.first) <= toleranceFirst;
      const secondOk = Math.abs(pair.second - answerDef.expected.second) <= toleranceSecond;
      if (orderMatters) {
        isCorrect = firstOk && secondOk;
      } else {
        const swappedFirstOk = Math.abs(pair.first - answerDef.expected.second) <= toleranceSecond;
        const swappedSecondOk = Math.abs(pair.second - answerDef.expected.first) <= toleranceFirst;
        isCorrect = (firstOk && secondOk) || (swappedFirstOk && swappedSecondOk);
      }
      outcome = isCorrect ? 'CORRECT' : 'INCORRECT';

      console.log('Attempt prepared', {
        pair,
        expected: answerDef.expected,
        toleranceFirst,
        toleranceSecond,
        orderMatters,
        outcome,
        attemptValue,
      });
    } else if (answerDef.type === 'fraction') {
      const normalizedFraction = normalizeFractionString(attemptValue);
      if (!normalizedFraction) {
        attemptStatus = 'incorrect';
        feedback = answerDef.inputHint ?? answerDef.failure;
        return;
      }

      const expectedNormalized = normalizeFractionString(answerDef.value);
      const fallbackExpected = answerDef.value.replace(/\s+/g, '');

      const compareAgainst = expectedNormalized ?? fallbackExpected;
      isCorrect = normalizedFraction === compareAgainst;
      outcome = isCorrect ? 'CORRECT' : 'INCORRECT';

      console.log('Attempt prepared', {
        normalizedFraction,
        expectedNormalized,
        compareAgainst,
        outcome,
        attemptValue,
      });
    } else if (answerDef.type === 'ratio') {
      const normalized = attemptValue?.trim();
      if (!normalized) {
        attemptStatus = 'incorrect';
        feedback = answerDef.failure;
        return;
      }

      const canonicalInput = normalized.replace(/\s+/g, '');
      const canonicalExpected = answerDef.value.replace(/\s+/g, '');

      isCorrect = canonicalInput === canonicalExpected;
      outcome = isCorrect ? 'CORRECT' : 'INCORRECT';

      console.log('Attempt prepared', {
        canonicalInput,
        canonicalExpected,
        outcome,
        attemptValue,
      });
    } else if (answerDef.type === 'expression') {
      const equivalence = expressionsEquivalent(
        attemptValue ?? '',
        answerDef.value,
        answerDef.variables,
      );

      if (equivalence === null) {
        attemptStatus = 'incorrect';
        feedback = answerDef.inputHint ?? answerDef.failure;
        return;
      }

      isCorrect = equivalence;
      outcome = isCorrect ? 'CORRECT' : 'INCORRECT';

      console.log('Attempt prepared', {
        attemptValue,
        expected: answerDef.value,
        allowedVariables: answerDef.variables,
        equivalence,
      });
    } else {
      attemptStatus = 'incorrect';
      feedback = 'This problem is not configured to accept answers yet.';
      return;
    }

    attemptStatus = isCorrect ? 'correct' : 'incorrect';
    feedback = isCorrect ? answerDef.success : answerDef.failure;
    solutionUnlocked = solutionUnlocked || isCorrect;

    let stageWasCompletedBeforeAttempt = false;
    if (isCorrect) {
      stageWasCompletedBeforeAttempt = subpathContext?.wasCompleted ?? false;
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
        await maybeShowJourneyCelebration(stageWasCompletedBeforeAttempt);
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
      .replace(/\\sqrt\s*\{([^{}]+)\}/g, (_match, radicand) => `root(${radicand})`)
      .replace(/√\s*\(([^()]+)\)/g, (_match, radicand) => `root(${radicand})`)
      .replace(/√\s*([0-9.]+)/g, (_match, radicand) => `root(${radicand})`)
      .replace(/\\sqrt/g, 'root')
      .replace(/\\cdot|\\times/g, '*')
      .replace(/\\div/g, '/')
      .replace(/\\left|\\right/g, '')
      .replace(/\\!/g, '')
      .replace(/\\,/g, '')
      .replace(/\\ /g, '')
      .replace(/[{}]/g, '')
      .trim();

    normalized = normalized.replace(/(\d|\))\s*(root|sqrt)\s*\(/gi, (_match, prefix, keyword) => `${prefix}*${keyword}(`);

    normalized = normalized.replace(/(root|sqrt)\s*\(([^()]*)\)/gi, (_match, _keyword, radicand) => {
      const inner = radicand.trim();
      if (!inner) {
        return 'NaN';
      }
      return `(${inner})**0.5`;
    });

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

  type PairValue = { first: number; second: number };

  function evaluatePairResponse(rawInput: string, separator: string): PairValue | null {
    if (!rawInput) return null;

    const trimmed = rawInput.trim();
    if (!trimmed) return null;

    const segments = splitPairSegments(trimmed, separator);
    if (segments.length !== 2) {
      return null;
    }

    const parseSegment = (segment: string): number | null => {
      const normalized = segment.trim();
      if (!normalized) return null;

      const match = normalized.match(/-?[0-9]+(?:\.[0-9]+)?/);
      if (!match) return null;

      const value = Number(match[0]);
      return Number.isFinite(value) ? value : null;
    };

    const first = parseSegment(segments[0]);
    const second = parseSegment(segments[1]);

    if (first === null || second === null) {
      return null;
    }

    return { first, second };
  }

  function splitPairSegments(input: string, separator: string): string[] {
    const trimmedSeparator = separator.trim();

    if (trimmedSeparator && trimmedSeparator !== ' ') {
      const parts = input.split(trimmedSeparator).map((part) => part.trim()).filter(Boolean);
      if (parts.length === 2) {
        return parts;
      }
    }

    const fallback = input.split(/[,;\s]+/).map((part) => part.trim()).filter(Boolean);
    if (fallback.length === 2) {
      return fallback;
    }

    return [];
  }

  function gcdBigInt(a: bigint, b: bigint): bigint {
    let x = a < 0n ? -a : a;
    let y = b < 0n ? -b : b;
    while (y !== 0n) {
      const temp = x % y;
      x = y;
      y = temp;
    }
    return x;
  }

  function normalizeFractionString(raw: string): string | null {
    if (!raw) return null;
    const trimmed = raw.trim();
    if (!trimmed) return null;

    const compact = trimmed.replace(/\s+/g, '');
    const match = compact.match(/^([-+]?\d+)\/([-+]?\d+)$/);
    if (!match) {
      return null;
    }

    let numerator = BigInt(match[1]);
    let denominator = BigInt(match[2]);
    if (denominator === 0n) {
      return null;
    }

    if (denominator < 0n) {
      numerator = -numerator;
      denominator = -denominator;
    }

    const divisor = gcdBigInt(numerator, denominator);
    const simplifiedNumerator = numerator / divisor;
    const simplifiedDenominator = denominator / divisor;

    return `${simplifiedNumerator}/${simplifiedDenominator}`;
  }

  type AlgebraicToken =
    | { type: 'number'; value: string }
    | { type: 'identifier'; value: string }
    | { type: 'operator'; value: string }
    | { type: 'paren'; value: '(' | ')' }
    | { type: 'comma'; value: ',' };

  type NormalizedToken =
    | { type: 'number'; value: string }
    | { type: 'identifier'; value: string }
    | { type: 'function'; value: string }
    | { type: 'operator'; value: string }
    | { type: 'paren-open'; value: '(' }
    | { type: 'paren-close'; value: ')' }
    | { type: 'comma'; value: ',' };

  const algebraicFunctions = new Set(['sqrt']);

  function normalizeLatexLikeExpression(input: string): string | null {
    if (typeof input !== 'string') {
      return null;
    }

    let output = input.replace(/\r?\n/g, ' ').trim();
    if (!output) {
      return null;
    }

    const fractionPattern = /\\(dfrac|tfrac|frac)\s*\{([^{}]+)\}\{([^{}]+)\}/g;

    const replaceFractions = (value: string): string => {
      let previous: string;
      let current = value;
      do {
        previous = current;
        current = current.replace(fractionPattern, (_match, _type, numerator, denominator) => {
          return `(${numerator})/(${denominator})`;
        });
      } while (current !== previous);
      return current;
    };

    output = replaceFractions(output);

    output = output
      .replace(/\\left|\\right/g, '')
      .replace(/\\cdot|\\times/g, '*')
      .replace(/\\div/g, '/')
      .replace(/\\!/g, '')
      .replace(/\\,/g, '')
      .replace(/\\sqrt\s*\{([^{}]+)\}/g, 'sqrt($1)')
      .replace(/√/g, 'sqrt')
      .replace(/²/g, '^2')
      .replace(/\\ /g, '')
      .replace(/\{/g, '(')
      .replace(/\}/g, ')')
      .replace(/\s+/g, ' ')
      .trim();

    return output.length > 0 ? output : null;
  }

  function tokenizeAlgebraicExpression(expr: string): AlgebraicToken[] | null {
    const tokens: AlgebraicToken[] = [];
    for (let index = 0; index < expr.length; ) {
      const char = expr[index];

      if (/\s/.test(char)) {
        index += 1;
        continue;
      }

      if (/[0-9]/.test(char) || (char === '.' && /[0-9]/.test(expr[index + 1] ?? ''))) {
        let end = index + 1;
        let hasDecimal = char === '.';
        while (end < expr.length) {
          const next = expr[end];
          if (/[0-9]/.test(next)) {
            end += 1;
            continue;
          }
          if (next === '.' && !hasDecimal) {
            hasDecimal = true;
            end += 1;
            continue;
          }
          break;
        }

        const value = expr.slice(index, end);
        if (value === '.' || value === '-.' || value === '+.') {
          return null;
        }
        tokens.push({ type: 'number', value });
        index = end;
        continue;
      }

      if (/[a-zA-Z]/.test(char)) {
        let end = index + 1;
        while (end < expr.length && /[a-zA-Z0-9_]/.test(expr[end])) {
          end += 1;
        }
        tokens.push({ type: 'identifier', value: expr.slice(index, end) });
        index = end;
        continue;
      }

      if (char === '*' && expr[index + 1] === '*') {
        tokens.push({ type: 'operator', value: '**' });
        index += 2;
        continue;
      }

      if ('+-*/^()'.includes(char)) {
        if (char === '(' || char === ')') {
          tokens.push({ type: 'paren', value: char });
        } else {
          tokens.push({ type: 'operator', value: char });
        }
        index += 1;
        continue;
      }

      if (char === ',') {
        tokens.push({ type: 'comma', value: char });
        index += 1;
        continue;
      }

      return null;
    }

    return tokens;
  }

  function buildNormalizedExpression(
    tokens: AlgebraicToken[],
    allowedVariables?: string[],
  ): { sanitized: string; variables: string[] } | null {
    if (tokens.length === 0) {
      return null;
    }

    const allowedSet = allowedVariables
      ? new Set(allowedVariables.map((variable) => variable.toLowerCase()))
      : null;
    const normalizedTokens: NormalizedToken[] = [];
    const variables = new Set<string>();

    for (const token of tokens) {
      if (token.type === 'number') {
        normalizedTokens.push({ type: 'number', value: token.value });
        continue;
      }

      if (token.type === 'identifier') {
        const lower = token.value.toLowerCase();
        if (algebraicFunctions.has(lower)) {
          normalizedTokens.push({ type: 'function', value: `Math.${lower}` });
        } else {
          if (allowedSet && !allowedSet.has(lower)) {
            return null;
          }
          variables.add(lower);
          normalizedTokens.push({ type: 'identifier', value: lower });
        }
        continue;
      }

      if (token.type === 'operator') {
        const op = token.value === '^' ? '**' : token.value;
        normalizedTokens.push({ type: 'operator', value: op });
        continue;
      }

      if (token.type === 'paren') {
        if (token.value === '(') {
          normalizedTokens.push({ type: 'paren-open', value: '(' });
        } else {
          normalizedTokens.push({ type: 'paren-close', value: ')' });
        }
        continue;
      }

      if (token.type === 'comma') {
        normalizedTokens.push({ type: 'comma', value: ',' });
        continue;
      }
    }

    const segments: string[] = [];
    for (let index = 0; index < normalizedTokens.length; index += 1) {
      const current = normalizedTokens[index];
      segments.push(current.value);
      if (index < normalizedTokens.length - 1) {
        const next = normalizedTokens[index + 1];
        if (needsImplicitMultiplication(current, next)) {
          segments.push('*');
        }
      }
    }

    const sanitized = wrapImplicitDenominator(segments.join(''));
    if (!sanitized) {
      return null;
    }

    if (!/^[-+*/0-9a-zA-Z().,* ]+$/.test(sanitized.replace(/Math\.sqrt/g, 'Mathsqrt'))) {
      return null;
    }

    return { sanitized, variables: Array.from(variables) };
  }

  function needsImplicitMultiplication(left: NormalizedToken, right: NormalizedToken): boolean {
    if (left.type === 'operator' || left.type === 'comma' || left.type === 'paren-open') {
      return false;
    }

    if (right.type === 'operator' || right.type === 'comma' || right.type === 'paren-close') {
      return false;
    }

    if (left.type === 'function' && right.type === 'paren-open') {
      return false;
    }

    if (right.type === 'function') {
      return left.type === 'number' || left.type === 'identifier' || left.type === 'paren-close';
    }

    if (right.type === 'paren-open') {
      return left.type === 'number' || left.type === 'identifier' || left.type === 'paren-close';
    }

    if (right.type === 'number' || right.type === 'identifier') {
      return left.type === 'number' || left.type === 'identifier' || left.type === 'paren-close';
    }

    return false;
  }

  function wrapImplicitDenominator(expr: string): string {
    if (!expr.includes('/')) {
      return expr;
    }

    let result = '';
    for (let index = 0; index < expr.length; index += 1) {
      const char = expr[index];
      if (char !== '/') {
        result += char;
        continue;
      }

      result += '/';
      let cursor = index + 1;

      while (cursor < expr.length && expr[cursor] === ' ') {
        result += ' ';
        cursor += 1;
      }

      if (cursor >= expr.length) {
        index = cursor - 1;
        continue;
      }

      if (expr[cursor] === '(') {
        index = cursor - 1;
        continue;
      }

      let denominator = '';
      let depth = 0;
      let captured = false;

      for (; cursor < expr.length; cursor += 1) {
        const current = expr[cursor];

        if (current === '(') {
          depth += 1;
          denominator += current;
          captured = true;
          continue;
        }

        if (current === ')') {
          if (depth > 0) {
            depth -= 1;
            denominator += current;
            captured = true;
            continue;
          }
          break;
        }

        if (depth === 0 && (current === '+' || current === '-' || current === '/' || current === ',')) {
          if (!captured) {
            denominator += current;
            captured = true;
            continue;
          }
          break;
        }

        denominator += current;
        captured = true;
      }

      const trimmed = denominator.trim();
      if (trimmed.length > 0) {
        result += `(${trimmed})`;
      }

      index = cursor - 1;
    }

    return result;
  }

  function prepareExpression(
    raw: string | undefined,
    allowedVariables?: string[],
  ): { sanitized: string; variables: string[] } | null {
    if (!raw || typeof raw !== 'string') {
      return null;
    }

    const normalized = normalizeLatexLikeExpression(raw);
    if (!normalized) {
      return null;
    }

    const tokens = tokenizeAlgebraicExpression(normalized);
    if (!tokens) {
      return null;
    }

    return buildNormalizedExpression(tokens, allowedVariables);
  }

  function createExpressionFunction(
    sanitized: string,
    variables: string[],
  ): ((...args: number[]) => number) | null {
    const params = Array.from(new Set(variables.map((name) => name.toLowerCase())));
    try {
      return new Function(...params, `return (${sanitized});`) as (...args: number[]) => number;
    } catch (error) {
      console.warn('Failed to compile expression', sanitized, error);
      return null;
    }
  }

  function expandPlusMinusVariants(expression: string): string[] {
    if (!expression) {
      return [''];
    }
    const normalized = expression.replace(/\\pm/g, '±');
    if (!normalized.includes('±')) {
      return [normalized];
    }
    let variants = [''];
    for (const char of normalized) {
      if (char === '±') {
        const expanded: string[] = [];
        for (const prefix of variants) {
          expanded.push(`${prefix}+`);
          expanded.push(`${prefix}-`);
        }
        variants = expanded;
      } else {
        variants = variants.map((prefix) => `${prefix}${char}`);
      }
    }
    return variants;
  }

  function comparePreparedExpressions(
    expectedPrepared: { sanitized: string; variables: string[] },
    userPrepared: { sanitized: string; variables: string[] },
  ): boolean | null {
    const variableSet = new Set<string>([
      ...expectedPrepared.variables.map((variable) => variable.toLowerCase()),
      ...userPrepared.variables.map((variable) => variable.toLowerCase()),
    ]);
    const variables = Array.from(variableSet);
    const expectedFn = createExpressionFunction(expectedPrepared.sanitized, variables);
    const userFn = createExpressionFunction(userPrepared.sanitized, variables);

    if (!expectedFn || !userFn) {
      return null;
    }

    const tolerance = 1e-6;

    if (variables.length === 0) {
      try {
        const expectedValue = expectedFn();
        const userValue = userFn();
        if (!Number.isFinite(expectedValue) || !Number.isFinite(userValue)) {
          return null;
        }
        return Math.abs(expectedValue - userValue) <= tolerance;
      } catch (error) {
        console.warn('Failed to evaluate constant expression', error);
        return null;
      }
    }

    const sampleValues = [2, -3, 5, -7, 11, -13, 17];
    let evaluations = 0;

    for (let offset = 0; offset < sampleValues.length && evaluations < 6; offset += 1) {
      const scopeValues = variables.map(
        (_variable, index) => sampleValues[(offset + index) % sampleValues.length],
      );

      try {
        const expectedValue = expectedFn(...scopeValues);
        const userValue = userFn(...scopeValues);
        if (!Number.isFinite(expectedValue) || !Number.isFinite(userValue)) {
          continue;
        }
        if (Math.abs(expectedValue - userValue) > tolerance) {
          return false;
        }
        evaluations += 1;
      } catch {
        continue;
      }
    }

    if (evaluations === 0) {
      return null;
    }

    return true;
  }

  function expressionsEquivalent(
    rawInput: string,
    expected: string,
    allowedVariables?: string[],
  ): boolean | null {
    const expectedVariants = expandPlusMinusVariants(expected);
    const expectedPrepared = [];

    for (const variant of expectedVariants) {
      const prepared = prepareExpression(variant, allowedVariables);
      if (!prepared) {
        console.warn('Unable to prepare expected expression', variant);
        return null;
      }
      expectedPrepared.push(prepared);
    }

    const allowedVars =
      allowedVariables ??
      Array.from(new Set(expectedPrepared.flatMap((prepared) => prepared.variables)));
    const allowedSet = new Set(allowedVars.map((variable) => variable.toLowerCase()));

    const inputVariants = expandPlusMinusVariants(rawInput);
    const userPrepared: { sanitized: string; variables: string[] }[] = [];

    for (const variant of inputVariants) {
      const prepared = prepareExpression(variant, allowedVars);
      if (prepared) {
        userPrepared.push(prepared);
      }
    }

    if (userPrepared.length === 0) {
      return null;
    }

    if (userPrepared.length !== expectedPrepared.length) {
      return false;
    }

    const used = new Array(userPrepared.length).fill(false);

    for (const expectedPrep of expectedPrepared) {
      let matched = false;
      for (let index = 0; index < userPrepared.length; index += 1) {
        if (used[index]) {
          continue;
        }
        const candidate = userPrepared[index];
        const variableSet = new Set<string>([
          ...expectedPrep.variables.map((variable) => variable.toLowerCase()),
          ...candidate.variables.map((variable) => variable.toLowerCase()),
        ]);

        for (const variable of variableSet) {
          if (!allowedSet.has(variable)) {
            return null;
          }
        }

        const comparison = comparePreparedExpressions(expectedPrep, candidate);
        if (comparison === null) {
          return null;
        }
        if (comparison) {
          used[index] = true;
          matched = true;
          break;
        }
      }

      if (!matched) {
        return false;
      }
    }

    return true;
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

<SubpathCompletionModal
  open={journeyModalOpen}
  heading={journeyHeading}
  message={journeyMessageText}
  ctaLabel={journeyCtaLabel}
  subpathTitle={journeySubpathTitle}
  nextSubpathTitle={journeyNextSubpathTitle}
  on:close={closeJourneyModal}
  on:continue={handleJourneyContinue}
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
          {#if problem.diagram.display === 'popover'}
            <div
              class="relative inline-block"
              on:mouseenter={showDiagramPopover}
              on:mouseleave={hideDiagramPopover}
              role="presentation"
            >
              <button
                class="rounded-full border border-indigo-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-indigo-600 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                type="button"
                on:click={showDiagramPopover}
                on:focus={showDiagramPopover}
                on:blur={handleDiagramBlur}
                aria-expanded={diagramPopoverVisible}
                aria-haspopup="dialog"
                bind:this={diagramTriggerButton}
              >
                Visualise
              </button>
              {#if diagramPopoverVisible}
                <div
                  class="absolute left-1/2 z-30 mt-3 w-[32rem] -translate-x-1/2 rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-xl"
                  role="dialog"
                  aria-label="Visual diagram"
                  bind:this={diagramPopoverElement}
                >
                  <button
                    class="absolute right-3 top-3 rounded-full border border-slate-200 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
                    type="button"
                    on:click={() => {
                      hideDiagramPopover();
                      diagramTriggerButton?.focus();
                    }}
                    aria-label="Close diagram"
                  >
                    Close
                  </button>
                  {#if problem.diagram.type === 'image'}
                    <img
                      src={problem.diagram.src}
                      alt={problem.diagram.alt}
                      class="mx-auto h-auto max-h-[28rem] w-full object-contain"
                      loading="lazy"
                    />
                  {:else if problem.diagram.type === 'component'}
                    <svelte:component this={problem.diagram.component} />
                  {/if}
                  {#if problem.diagram.caption}
                    <p class="mt-3 text-sm text-slate-500">{problem.diagram.caption}</p>
                  {/if}
                </div>
              {/if}
            </div>
          {:else}
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
        {/if}
        {#if answerInstruction}
          <p class="text-sm text-slate-500">
            <TextWithMath text={answerInstruction} />
          </p>
        {/if}
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
          <div class="flex items-start gap-2">
            <div class="flex-1">
              <MathInput
                bind:this={mathInputRef}
                bind:value={attemptValue}
                placeholder="Type your answer or expression"
              />
            </div>
            {#if showRadicalShortcut || showExpressionShortcuts}
              <div class="flex flex-col gap-2">
                {#if showRadicalShortcut}
                  <button
                    class="rounded-lg border border-slate-300 px-3 py-2 text-xl leading-none text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600"
                    type="button"
                    on:click={insertSquareRootSymbol}
                    aria-label="Insert square root symbol"
                    title="Insert √"
                  >
                    √
                  </button>
                {/if}
                {#if showExpressionShortcuts}
                  {#each expressionShortcuts as shortcut}
                    <button
                      class="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600"
                      type="button"
                      on:click={() => insertToken(shortcut)}
                      aria-label={`Insert ${shortcut}`}
                      title={`Insert ${shortcut}`}
                    >
                      {shortcut}
                    </button>
                  {/each}
                  {#if includeExponentShortcut}
                    <button
                      class="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600"
                      type="button"
                      on:click={insertExponentTwo}
                      aria-label="Insert squared"
                      title="Insert ^2"
                    >
                      <span aria-hidden="true" class="text-base leading-none">^<sup>2</sup></span>
                    </button>
                  {/if}
                {/if}
              </div>
            {/if}
          </div>
          {#if problem.answer.inputHint}
            <p class="text-xs text-slate-500">
              <TextWithMath text={problem.answer.inputHint} />
            </p>
          {/if}
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
              {@html formattedFeedback}
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
