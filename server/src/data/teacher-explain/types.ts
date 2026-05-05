import { z } from 'zod';

const qaIdSchema = z.string().regex(/^ch(0[1-9]|10)_q(0[1-9]|10)$/);

export const teacherExplainPromptSchema = z.object({
  q: z.string().trim().min(1).max(80),
  a: z.string().trim().min(1).max(200),
});

export const teacherExplainAdvancedSchema = z.object({
  technicalSpec: z.string().trim().min(1).max(500),
  friendlyExplanation: z.string().trim().min(1).max(500),
});

export const teacherExplainDemoTipSchema = z.object({
  scenarioOrder: z.string().trim().min(1).max(300),
  studentReaction: z.string().trim().min(1).max(300),
});

export const teacherExplainBlockSchema = z.object({
  qaId: qaIdSchema,
  tldr: z.string().trim().min(30).max(50),
  misconception: z.string().trim().min(1).max(250),
  relatedQas: z.array(qaIdSchema).min(1).max(3),
  goal: z.string().trim().min(1).max(200),
  cue: z.string().trim().min(1).max(150),
  concept: z.string().trim().min(1).max(300),
  mechanism: z.string().trim().min(1).max(300),
  realLife: z.string().trim().min(1).max(250),
  prompts: z.array(teacherExplainPromptSchema).min(3).max(5),
  beforeDemo: z.string().trim().min(1).max(200),
  note: z.string().trim().min(1).max(200),
  advanced: teacherExplainAdvancedSchema.optional(),
  demoTip: teacherExplainDemoTipSchema.optional(),
});

export type TeacherExplainPrompt = z.infer<typeof teacherExplainPromptSchema>;
export type TeacherExplainAdvanced = z.infer<typeof teacherExplainAdvancedSchema>;
export type TeacherExplainDemoTip = z.infer<typeof teacherExplainDemoTipSchema>;
export type TeacherExplainBlock = z.infer<typeof teacherExplainBlockSchema>;
