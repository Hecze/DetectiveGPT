import { openai } from '@ai-sdk/openai';
import { generateText, generateObject, tool, CoreMessage } from 'ai';
import { z } from 'zod';
import { NextResponse } from 'next/server';
import { AgentResponse, agentResponseSchema } from '../../../types/agentResponse'; // Asegúrate de ajustar la ruta según la ubicación de types.ts

// Allow streaming responses up to 30 seconds
export const maxDuration = 60;


export async function POST(req: Request) {
  try {
    const { messages, currentAgent: currentAgent } = await req.json();
    const agentResponse = await speakWithAgent(currentAgent, messages[currentAgent]);

    return NextResponse.json(agentResponse, { status: 200 });

  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: 'Error procesando la solicitud' },
      { status: 400 }
    );
  }
}

async function textToJson(text: string) {
  const { object } = await generateObject({
    model: openai('gpt-4o-mini'),
    system: `Transformas texto a formato JSON. siguiendo el esquema: paragraph, option1, option2, option3. No modifiques el contenido.`,
    prompt: text,
    maxTokens: 200,
    schema: z.object({
      paragraph: z.string().describe('Parrafo principal'),
      option1: z.string().describe('Primera opción posible.'),
      option2: z.string().describe('Segunda opción posible.'),
      option3: z.string().describe('Tercera opción posible.'),
    }),
  });

  return object;
}

async function speakWithAgent(name: string, messages: CoreMessage[]): Promise<AgentResponse> {
  console.log(`\nFunction speakWithAgent  ----------------------------------------------------------------------------------------------------------------- \n\n  Name: ${name}`, `\n  N° Messages: ${messages.length}`);
  let currentAgent = name.toLowerCase();
  let messageAgent = '';
  let gameOver = false;

  const result = await generateText({
    model: openai('gpt-4o-mini'),
    messages: messages,
    maxTokens: 200,
    tools: {
      endConversation: tool({
        description: 'Se ejecuta cuando termina la conversación',
        parameters: z.object({
          cause: z.enum(['muerte', 'crimen resuelto', 'despedida']).describe('Motivo del final de la conversación. en la mayoria de casos es "despedida", es decir cuando "termina la conversación" de manera natural.'),
          resume: z.string().describe('Resumen detallado y extenso de la informacion recaudada. Usa los parrafos necesarios. Maximo 600 caracteres'),
        }),
        execute: async ({ cause, resume }) => {
          ({ messageAgent, gameOver, currentAgent } = await handleEndConversation(cause, resume, name));
        },
      }),
      changeAgent: tool({
        description: 'Se ejecuta cuando se quiere cambiar de agente',
        parameters: z.object({
          newAgent: z.string().describe('Nombre del nuevo agente.'),
        }),
        execute: async ({ newAgent }) => {
          currentAgent = newAgent;
        },
      }),
    },
  });

  if (!gameOver) {
    messageAgent = result.text;
  }

  const formattedResponse = currentAgent === 'storyteller' ? await textToJson(messageAgent) : {
    paragraph: messageAgent,
    option1: 'Continuar',
    option2: '',
    option3: ''
  };

  const agentResponse: AgentResponse = {
    name: currentAgent,
    content: {
      text: messageAgent,
      formatted: formattedResponse
    },
    tools: {
      gameOver: { executed: gameOver },
      changeAgent: { executed:  false, newAgent: currentAgent }
    }
  };

  console.log('  agentResponse: ', agentResponse);
  console.log(`\n------------------------------------------------------------------------------------------------------------------------------------------`)
  return agentResponse;
}

async function handleEndConversation(cause: "muerte" | "crimen resuelto" | "despedida", resume: string, name: string) {
  let messageAgent = `Anotas todo lo conversado con ${name} en tu libreta: ${resume}.`;
  console.log(`  ---> handleEndConversation`);
  let gameOver = false;

  if (cause === 'muerte') {
    messageAgent = `    El investigador ha muerto. ${resume}`;
    gameOver = true;
  } else if (cause === 'crimen resuelto') {
    messageAgent = `    El investigador ha resuelto el crimen. ${resume}`;
    gameOver = true;
  } else {
    messageAgent = `    Anotados toco lo conversado con ${name} en tu libreta: ${resume}`;
  }

  console.log(`    La conversacion ha terminado por: ${cause}`);

  return { messageAgent, gameOver, currentAgent: 'storyteller' };
}
