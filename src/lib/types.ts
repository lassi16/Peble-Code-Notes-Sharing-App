export interface UserPublic {
  id: string;
  name: string;
  email: string;
}

export interface NoteListItem {
  note_id: string;
  title: string;
  noteType: "normal" | "code";
  codeLanguage: string;
  tags: string[];
  category: string;
  archived: boolean;
  isPublic: boolean;
  shareId: string | null;
  updated_at: string;
}

export interface AiOutput {
  summary: string;
  action_items: string[];
  suggested_title: string;
}

export interface InsightsData {
  totalNotes: number;
  archivedNotes: number;
  recentlyEdited: NoteListItem[];
  mostUsedTags: { tag: string; count: number }[];
  aiUsageStats: {
    totalGenerations: number;
    thisWeek: number;
    lastGeneration: string | null;
  };
  weeklyActivity: { day: string; count: number }[];
}
