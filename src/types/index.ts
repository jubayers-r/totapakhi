export interface Category {
  id: string;
  label: string;
  subtitle: string;
}

export interface Topic {
  id: string;
  topic: string;
  category: string;
  gender: string;
  hints?: string[];
  enTopic?: string;
  enHints?: string[];
}

export type AppMode = 'topics' | 'interview' | 'timer';

export type GenderFilter = 'all' | 'male' | 'female';
