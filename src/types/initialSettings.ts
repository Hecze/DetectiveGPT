import { z } from "zod";

const PersonalitySchema = z.object({
  tag: z.string(),
  options: z.array(z.string()),
});

const SelectedPersonalitySchema = z.object({
  tag: z.string(),
  optionSelected: z.string(),
});

export type Personality = z.infer<typeof PersonalitySchema>;
export type SelectedPersonality = z.infer<typeof SelectedPersonalitySchema>;