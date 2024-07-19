import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

export async function resumeHistory(text: string) {
  'use server';

  const { object } = await generateObject({
    model: openai('gpt-3.5-turbo'),
    system: 'Recibes una historia de investigadores y la resumes en un párrafo',
    prompt: text,
    maxTokens: 200,
    schema: z.object({
        "resume": z.string().describe('Parrafo principal'),
      }),
  });

  return object;
}