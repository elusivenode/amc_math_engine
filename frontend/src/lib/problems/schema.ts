import type { ComponentType } from 'svelte';

export type ProblemObjective = string;

export type ProblemHint = {
  title: string;
  body: string;
  expression?: string;
};

export type ProblemSolutionStep = {
  text: string;
  expression?: string;
};

export type NumericAnswer = {
  type: 'numeric';
  value: number;
  tolerance?: number;
  success: string;
  failure: string;
  supportsRadicals?: boolean;
  inputHint?: string;
};

export type PairAnswer = {
  type: 'pair';
  expected: {
    first: number;
    second: number;
  };
  separator?: string;
  firstLabel?: string;
  secondLabel?: string;
  tolerance?: {
    first?: number;
    second?: number;
  };
  inputHint?: string;
  success: string;
  failure: string;
};

export type RatioAnswer = {
  type: 'ratio';
  value: string;
  success: string;
  failure: string;
  inputHint?: string;
};

export type FractionAnswer = {
  type: 'fraction';
  value: string;
  success: string;
  failure: string;
  format?: string;
  inputHint?: string;
};

export type ExpressionAnswer = {
  type: 'expression';
  value: string;
  success: string;
  failure: string;
  variables?: string[];
  inputHint?: string;
};

export type AnswerDefinition =
  | NumericAnswer
  | PairAnswer
  | RatioAnswer
  | FractionAnswer
  | ExpressionAnswer;

export type ProblemDiagram =
  | {
      type: 'image';
      src: string;
      alt: string;
      caption?: string;
    }
  | {
      type: 'component';
      component: ComponentType;
      caption?: string;
    };

export type ProblemMetadata = {
  competition: 'AMC';
  division: 'Junior' | 'Intermediate' | 'Senior' | 'Upper Primary' | 'Lower Primary';
  year: number;
  questionNumber: number;
};

export type ProblemDefinition = {
  id: string;
  title: string;
  tagline: string;
  difficulty: string;
  objectives: ProblemObjective[];
  question: string;
  hints: ProblemHint[];
  solution: ProblemSolutionStep[];
  answer: AnswerDefinition;
  diagram?: ProblemDiagram;
  pathSlug?: string;
  metadata: ProblemMetadata;
};
