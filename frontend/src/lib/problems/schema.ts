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
};

export type AnswerDefinition = NumericAnswer; // Future: extend with new discriminated union members

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
  metadata: ProblemMetadata;
};
