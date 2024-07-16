import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    // model: openai('gpt-4-turbo'), // $5.00 x millon de requests
    model: openai('gpt-3.5-turbo'), // $0.50 x millon de requests
    system: 'You are an echo bot. You respond the same as I tell you',
    messages,
  });

  return result.toAIStreamResponse();
}