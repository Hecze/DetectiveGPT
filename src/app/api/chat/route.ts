import { openai } from '@ai-sdk/openai';
import { generateText, generateObject, tool, CoreMessage } from 'ai';
import { z } from 'zod';
import { NextResponse } from 'next/server';

// Allow streaming responses up to 30 seconds
export const maxDuration = 60;

export async function POST(req: Request) {

  let actualFlow: "storyteller" | "maria" | "pedro" = "storyteller";
  let gameOver = false;
  let npcResponse = "";

  try {
    const { messages } = await req.json();
    console.log('messages: ', messages);

    const result = await generateText({
      // model: openai('gpt-4-turbo'), // $5.00 x millon de requests
      model: openai('gpt-3.5-turbo'), // $0.50 x millon de requests
      system: `maximo 300 caracteres. Eres una narrador de historias interactivas. El usuario es un detective. El usuario es quien toma las decisiones. La trama es un crimen sin resolver. No uses un tono conversacional. No le hagas preguntas al usuario. La trama es profunda, similar a una historia de sherlock holmes. La historia tiene giros de guion. Al final de cada respuesta añade 3 opciones cortas. Ejemplo:
      parrafo de la historia: por ejemplo "te encuentras con tu amiga maria",
      opcion 1: hablar con maria,
      opcion 2: hablar con juan,
      opcion 3: ...,
      `,
      messages: messages.
        storyteller,
      tools: {
        gameOver: tool({
          //Cuando llamar a la tool
          description: 'Se ejecuta cuando el jugador resuelve el crimen',
          parameters: z.object({}),
          //Funcion que se ejecuta cuando se llama a la tool
          execute: async () => {
            console.log("Game over");
            gameOver = true;
            return {};
          }
        }),

        speakWithNpc: tool({
          //Cuando llamar a la tool
          description: 'Se ejecuta cuando el jugador empieza a hablar con un npc',
          parameters: z.object({
            name: z.string().describe('El nombre del npc. Puede ser maria o pedro'),
            prompt: z.string().describe('Contexto que el npc necesita para cumplir su papel. por ejemplo: "eres maria, una chica implicada en un crimen"'),
            // messages: messages
          }),
          //Funcion que se ejecuta cuando se llama a la tool
          execute: async ({ name, prompt }) => {
            console.log("speakingWithNpc");
            console.log("name: " + name, "\nprompt: " + prompt);
            actualFlow = name.toLowerCase() as "maria" | "pedro";
            const response = await speakWithNpc(name, prompt);
            npcResponse = response;
            console.log(response);
          }
        }),
      },
      //maxTokens: 400,
    });
    if (npcResponse != "") {
      return NextResponse.json({ message: npcResponse, actualFlow }, { status: 200 });
    }

    if (gameOver) {
      console.log("Game over");
      return NextResponse.json({ error: 'El juego ha terminado' }, { status: 400 });
    }
    if (result.text != "") {
      const resultTextFormated = await textToJson(result.text);
      console.log(result.text)
      console.log(resultTextFormated);
      return NextResponse.json({ message: result, formattedResponse: resultTextFormated, actualFlow }, { status: 200 });
    }
    else {
      console.log(result.text);
      return NextResponse.json({ error: 'El texto de retorno está vacio' }, { status: 400 });
    }

    // Retornar una respuesta JSON válida
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error procesando la solicitud' }, { status: 500 });
  }
}

async function textToJson(text: string) {
  'use server';

  const { object } = await generateObject({
    model: openai('gpt-3.5-turbo'),
    system: `Transformas texto a formato JSON. siguiendo el esquema: paragraph, option_one, option_two, option_three. No modifiques el texto.`,
    prompt: text,
    maxTokens: 200,
    schema: z.object({
      "paragraph": z.string().describe('Parrafo principal'),
      "option_one": z.string().describe('Primera opción posible.'),
      "option_two": z.string().describe('Segunda opción posible.'),
      "option_three": z.string().describe('Tercera opción posible.'),
    }),
  });

  return object;
}


async function speakWithNpc(name: string, prompt: string) {
  'use server';
  console.log("name: " + name, "\nprompt: " + prompt);
  const npcName = name.toLowerCase();
  // console.log(messages[npcName]);
  const result = await generateText({
    model: openai('gpt-3.5-turbo'),
    system: `Eres un personaje en una novela de misterio. Tu nombre es ${name}. Habla en primera persona, con respuestas cortas. `,
    // messages: messages[npcName],
    prompt: prompt,
    maxTokens: 200,
    tools: {
      endFlow: tool({
        //Cuando llamar a la tool
        description: 'Se ejecuta cuando se termina la conversacion con el personaje',
        parameters: z.object({ resume: z.string().describe('Resumen de la conversacion') }),
        //Funcion que se ejecuta cuando se llama a la tool
        execute: async ({ resume }) => {
          console.log("Resumen: " + resume);
          return resume;
        }
      })
    }
  });

  return result.text;
}




//falta crear el message con todos los nombres en el frontend