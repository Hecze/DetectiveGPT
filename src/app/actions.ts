'use server';

import { CoreMessage, generateText, streamObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { createStreamableValue } from 'ai/rsc';
import { z } from 'zod';

export async function generate(messages: CoreMessage[]) {
  'use server';
  const stream = createStreamableValue();

  (async () => {
    const { partialObjectStream } = await streamObject({
      model: openai('gpt-3.5-turbo'),
      system: `Transformas texto a formato JSON.`,
      messages: messages,
      maxTokens: 200,
      schema: z.object({
        notification: z.object({
          consequence: z.string().describe('Narrativa principal'),
          'option 1': z.string().describe('Primera opción posible.'),
          'option 2': z.string().describe('Segunda opción posible.'),
          'option 3': z.string().describe('Tercera opción posible.'),
        }),
      }),
    });

    for await (const partialObject of partialObjectStream) {
      stream.update(partialObject);
    }

    stream.done();
  })();

  return { object: stream.value };
}

export async function resumeStory(story: string) {
  console.log(`Story to resume: ${story}`);
  const { text } = await generateText({
    model: openai('gpt-3.5-turbo'),
    system:
      'Recibes una historia de investigadores y la resumes en un párrafo. Hablas en tercera persona, El formato resultante debe ser en tiempo pasado y debes poner énfasis en las partes donde hubo mayor tensión. No des opciones para responder',
    prompt: story,
  });

  return text;
}
