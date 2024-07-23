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
    const { messages, currentAgent: newCurrentAgent } = await req.json();
    const agentResponse = await getAgentResponse(newCurrentAgent, messages);

    const { message, gameOver, name: currentAgent } = agentResponse;

    if (newCurrentAgent === 'storyteller') {
      const formattedResponse = await textToJson(message);
      return createJsonResponse({ message, formattedResponse, currentAgent, gameOver });
    }

    return createJsonResponse({
      message,
      formattedResponse: { paragraph: message, option1: 'Continuar', option2: '', option3: '' },
      currentAgent,
      gameOver,
    });

  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: 'Error procesando la solicitud' },
      { status: 400 }
    );
  }
}

async function getAgentResponse(newCurrentAgent: string, messages: any): Promise<AgentResponse> {
  if (newCurrentAgent === "storyteller") {
    return await speakWithStoryteller(messages);
  } else {
    return await speakWithNpc(newCurrentAgent, messages[newCurrentAgent]);
  }
}

function createGameOverResponse(message: string) {
  console.log('Game over');
  return NextResponse.json(
    {
      gameOver: true,
      agentResponse: message,
      formattedResponse: {
        paragraph: message,
        option1: '',
        option2: '',
        option3: '',
      },
      currentAgent: 'storyteller',
    },
    { status: 200 }
  );
}

function createJsonResponse({ message, formattedResponse, currentAgent, gameOver }: any) {
  return NextResponse.json(
    {
      agentResponse: message,
      formattedResponse,
      currentAgent,
      gameOver,
    },
    { status: 200 }
  );
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

async function speakWithNpc(name: string, messages: CoreMessage[], prompt?: string): Promise<AgentResponse> {
  console.log("function speakWithNpc called", `name: ${name}`, `prompt: ${prompt}`, `messages: ${JSON.stringify(messages)}`);

  let currentAgent = name.toLowerCase();
  let messageAgent = '';
  let gameOver = false;

  const result = await generateText({
    model: openai('gpt-4o-mini'),
    system: `Maximo 150 caracteres. Eres un personaje secuncario en una novela de misterio. Tu nombre es ${name}. Habla en primera persona. Estas hablando con el investigador del caso. ${prompt}`,
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

  if (!gameOver && currentAgent !== 'storyteller') {
    messageAgent = result.text;
  }

  const agentResponse: AgentResponse = {
    name: currentAgent,
    message: messageAgent,
    gameOver,
  };

  console.log('agentResponse: ', agentResponse);
  return agentResponse;
}


async function handleEndConversation(cause: string, resume: string, name: string) {
  let messageAgent = `Anotas todo lo conversado con ${name} en tu libreta: ${resume}.`;
  console.log(`handleEndConversation -> messageAgent: ${messageAgent}`);
  let gameOver = false;

  if (cause === 'muerte') {
    messageAgent = `El investigador ha muerto. ${resume}`;
    gameOver = true;
  } else if (cause === 'crimen resuelto') {
    messageAgent = `El investigador ha resuelto el crimen. ${resume}`;
    gameOver = true;
  }

  return { messageAgent, gameOver, currentAgent: 'storyteller' };
}

async function speakWithStoryteller(messages: any): Promise<AgentResponse> {
  console.log('messages: ', messages);

  let toolChoiceConfiguration: "auto" | "required" = "auto";
  let currentAgent = "storyteller";
  let messageAgent = '';
  let gameOver = false;

  // Verifica si messages.storyteller es un array y obtiene el último mensaje
  const storytellerMessages = messages.storyteller;
  const lastMessage = Array.isArray(storytellerMessages) ? storytellerMessages[storytellerMessages.length - 1] : null;
  console.log("speakWithStoryteller -> lastMessage: ", lastMessage);
  if (lastMessage && lastMessage.content.includes("Hablar con")) {
    toolChoiceConfiguration = "required";
    console.log("Tool is required")
  }

  const result = await generateText({
    model: openai('gpt-4o-mini'),
    messages: messages.storyteller,
    maxTokens: 200,
    toolChoice: toolChoiceConfiguration,
    tools: {
      investigatorIsDead: tool({
        description: 'Se ejecuta cuando el investigador muere',
        parameters: z.object({
          reasonOfDead: z.string().describe('Razón de la muerte'),
        }),
        execute: async ({ reasonOfDead }) => {
          ({ messageAgent, gameOver, currentAgent } = await handleInvestigatorIsDead(reasonOfDead));
          console.log(`Generate Text -> tool InvestigatorIsDead invoked -> ${messageAgent}`);
        }
      }),
      solvedCase: tool({
        description: 'Se ejecuta cuando el investigador resuelve el caso',
        parameters: z.object({
          epilogue: z.string().describe('Epilogo de la historia. Futuro de los personajes despues de que el investigador resuelva el caso.'),
        }),
        execute: async ({ epilogue }) => {
          ({ messageAgent, gameOver, currentAgent } = await handleSolvedCase(epilogue));
        }
          
      }),
      speakWithNpc: tool({
        description: 'se ejecuta cuando el jugador dice "Hablar con [personaje]"',
        parameters: z.object({
          name: z.string().describe('Nombre del personaje. nunca usar nombres con tilde'),
          prompt: z.string().describe('Caracteristicas del persona y su rol en la historia.'),
        }),
        execute: async ({ name, prompt }) => {
          console.log('speakingWithNpc', `name: ${name}`, `prompt: ${prompt}`);
          const agentResponse = await speakWithNpc(name, messages[name.toLowerCase()] || [], prompt);
          currentAgent = agentResponse.name;
          messageAgent = agentResponse.message;
          gameOver = agentResponse.gameOver;
          console.log('Nombre del npc: ', agentResponse.name);
          console.log('Respuesta del npc: ', agentResponse.message);
        },
      }),
    },
  });

  if (currentAgent === 'storyteller' && !gameOver) {
    //La partida sigue en curso y se está hablando con el storyteller
    messageAgent = result.text;
  }

  console.log(`Generate Text -> ${messageAgent}`);


  const agentResponse: AgentResponse = {
    name: currentAgent,
    message: messageAgent,
    gameOver,
  };

  console.log('speak with storyteller -> agentResponse: ', agentResponse);
  return agentResponse;
}

async function handleInvestigatorIsDead(reasonOfDead: string) {
  console.log('Game over', `Razón de la muerte: ${reasonOfDead}`);
  return {
    messageAgent: `Razón de la muerte: ${reasonOfDead}`,
    gameOver: true,
    currentAgent: 'storyteller',
  };
}

async function handleSolvedCase(epilogue: string) {
  console.log('Game over', `epilogue: ${epilogue}`);
  return {
    messageAgent: epilogue,
    gameOver: true,
    currentAgent: 'storyteller',
  };
}
