export interface GlossaryEntry {
  term: string;
  aliases?: string[];
  oneline: string;
  category?: 'hw' | 'sw' | 'net' | 'data' | 'cloud';
}

export const GLOSSARY: GlossaryEntry[] = [];
