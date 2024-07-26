import { openai } from '@ai-sdk/openai';
import { generateText, generateObject, tool, CoreMessage } from 'ai';
import { z } from 'zod';
import { NextResponse } from 'next/server';
import { AgentResponse, agentResponseSchema } from '../../../types/agentResponse'; // Asegúrate de ajustar la ruta según la ubicación de types.ts
import { exec } from 'child_process';

// Allow streaming responses up to 30 seconds
export const maxDuration = 60;


export async function POST(req: Request) {
  try {
    const { messages, currentAgent } = await req.json();
    // console.log(messages[currentAgent] as CoreMessage[]);
    const agentResponse = await speakWithAgent(currentAgent, messages[currentAgent] as CoreMessage[]);
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
  console.log("    executing textToJson: ", text);
  const { object } = await generateObject({
    model: openai('gpt-4o-mini'),
    system: `Transformas texto a formato JSON. siguiendo el esquema: paragraph, option1, option2, option3. No te inventes informacion. Si no hay opciones, escribe "..." en las respectivas opciones vacias`,
    prompt: text,
    maxTokens: 200,
    schema: z.object({
      paragraph: z.string().describe('Parrafo principal'),
      option1: z.string().describe('Primera opción. Puede estar vacia.'),
      option2: z.string().describe('Segunda opción. Puede estar vacia.'),
      option3: z.string().describe('Tercera opción. Puede estar vacia.'),
    }),
  });
  console.log("    result textToJson: ", object);


  return object;
}

async function speakWithAgent(name: string, messages: CoreMessage[]): Promise<AgentResponse> {
  console.log(`\nFunction speakWithAgent  ----------------------------------------------------------------------------------------------------------------- \n\n  Name: ${name}`, `\n  N° Messages: ${messages.length}`);
  let currentAgent = name.toLowerCase();
  let changeAgent = { executed: false, newAgent: '', prompt: '' };
  let messageAgent = '';
  let gameOver = false;
  let toolChoiceConfiguration: "auto" | "required" | "none" = "auto";
  const lastMessage = Array.isArray(messages) ? messages[messages.length - 1] : null;
  // console.log("messages: ", messages);
  console.log("  lastMessage: " + JSON.stringify(lastMessage));
  if (lastMessage && typeof lastMessage.content === 'string' && lastMessage.content.includes("Hablar con")) {
    toolChoiceConfiguration = "required";
    console.log("Tool is required")
  }
  const result = await generateText({
    model: openai('gpt-4o-mini'),
    messages: messages as CoreMessage[],
    maxTokens: 200,
    toolChoice: toolChoiceConfiguration,
    tools: {
      endConversation: tool({
        description: `Se ejecuta cuando se termina la conversación. Solo disponible si: "storyteller" != "${name}"`,
        parameters: z.object({
          cause: z.enum(['muerte', 'crimen resuelto', 'despedida']).describe('Motivo del final de la conversación. en la mayoria de casos es "despedida", es decir cuando "termina la conversación" de manera natural.'),
          resume: z.string().describe('Resumen detallado y extenso en tercera persona de la informacion recaudada. Usa los parrafos necesarios. Maximo 600 caracteres'),
        }),
        execute: async ({ cause, resume }) => {
          ({ messageAgent, gameOver, currentAgent } = await handleEndConversation(cause, resume, name));
        },
      }),
      changeAgent: tool({
        description: 'Se ejecuta cuando el usuario dice : "Hablar con [nombre del agente]". por ejemplo "Hablar con German"',
        parameters: z.object({
          newAgent: z.string().describe('Nombre del nuevo agente.'),
          personality: z.string().describe('Descripcion larga y detallada de la personalidad'),
          knowledge: z.string().describe('Descripcion larga y detallada de los conocimientos del personaje sobre la historia. Conocimientos sobre el crimen, pesca, agricultura, etc. No tiene que tener conocimientos relevantes necesariamente'),
          context: z.string().describe('Descripcion en tercera persona del lugar y circunstancia de como el agente se encontró con el investigador. por ejemplo: en un bar, en la escena del crimen, en un hospital, etc'),
        }),
        execute: async ({ newAgent, personality, knowledge, context }) => {
          const prompt = `personalidad: ${personality}\nconocimiento: ${knowledge}\n`;
          console.log('    changeAgent tool executed --> newAgent: '+ newAgent);
          changeAgent = { executed: true, newAgent: newAgent, prompt  };
        },
      }),
    },
  });



  if (!gameOver && currentAgent === name.toLowerCase()) {
    messageAgent = result.text;
  }

  let formattedResponse;

  if (currentAgent === 'storyteller' && !messageAgent.includes('Anotas')) {
    console.log(`\n  messageAgent: ${messageAgent}`);
    formattedResponse = await textToJson(messageAgent);
  } else {
    formattedResponse = {
      paragraph: messageAgent,
      option1: 'Continuar',
      option2: '',
      option3: ''
    };
  }
  

  const agentResponse: AgentResponse = {
    name: currentAgent,
    content: {
      text: messageAgent,
      formatted: formattedResponse
    },
    tools: {
      gameOver: { executed: gameOver },
      changeAgent
    }
  };

  // console.log('  agentResponse: ', agentResponse);
  console.log(`\n------------------------------------------------------------------------------------------------------------------------------------------`)
  return agentResponse;
}

async function handleEndConversation(cause: "muerte" | "crimen resuelto" | "despedida", resume: string, name: string) {
  let messageAgent = `Te despides de ${name} y anotas todo lo conversado en tu libreta: ${resume}.`;
  console.log(`\n  ---> handleEndConversation(\n    cause: ${cause},\n    resume: ${resume},\n    name: ${name})`);
  let gameOver = false;

  if (cause === 'muerte') {
    messageAgent = `El investigador ha muerto. ${resume}`;
    gameOver = true;
  } else if (cause === 'crimen resuelto') {
    messageAgent = `El investigador ha resuelto el crimen. ${resume}`;
    gameOver = true;
  } else {
    messageAgent = `Anotas todo lo conversado con ${name} en tu libreta: ${resume}`;
  }

  console.log(`    La conversacion ha terminado por: ${cause}`);

  return { messageAgent, gameOver, currentAgent: 'storyteller' };
}
