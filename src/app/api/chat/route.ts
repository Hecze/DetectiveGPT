import { openai } from '@ai-sdk/openai';
import { generateText, generateObject, tool, CoreMessage } from 'ai';
import { z } from 'zod';
import { NextResponse } from 'next/server';

// Allow streaming responses up to 30 seconds
export const maxDuration = 60;

interface AgentResponse {
  name: string;
  message: string;
  gameOver: boolean;
}

export async function POST(req: Request) {
  try {
    const { messages, currentAgent: lastCurrentAgent } = await req.json();
    const agentResponse = await speakWithNpc(lastCurrentAgent, messages[lastCurrentAgent]);
    const { message, gameOver, name: currentAgent } = agentResponse;
    let formattedResponse = { paragraph: message, option1: 'Continuar', option2: '', option3: '' }

    if (lastCurrentAgent === 'storyteller') {
      //Solo darle un formato Json a la respuesta si se está hablando con el historyteller
      formattedResponse = await textToJson(message);
    }

    return NextResponse.json({ agentResponse: message, formattedResponse, currentAgent, gameOver }, { status: 200 });

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

async function speakWithNpc(name: string, messages: CoreMessage[]): Promise<AgentResponse> {
  //console.log("function speakWithNpc called", `name: ${name}`, `messages: ${JSON.stringify(messages)}`);
  console.log(`\nFunction speakWithNpc  -------------------------------------------------------------------------------------------------------------------- \n\n  Name: ${name}`, `\n  N° Messages: ${messages.length}`);
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
    },
  });


  if (!gameOver) {
    //Se sigue hablando con el npc
    messageAgent = result.text;
  }

  const agentResponse: AgentResponse = {
    name: currentAgent,
    message: messageAgent,
    gameOver,
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
  }
  else {
    messageAgent = `    Anotados toco lo conversado con ${name} en tu libreta: ${resume}`;
  }

  console.log(`    La conversacion ha terminado por: ${cause}`);

  return { messageAgent, gameOver, currentAgent: 'storyteller' };
}
