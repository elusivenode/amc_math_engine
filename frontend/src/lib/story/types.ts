export type StoryContext = 'path' | 'problem';

export type StoryBeat = {
  id: string;
  pathSlug: string;
  sequence: number;
  context: StoryContext;
  title: string;
  narrative: string[];
  image: string;
  imageAlt: string;
  caption?: string;
  problemOrder?: number;
  problemId?: string;
};
