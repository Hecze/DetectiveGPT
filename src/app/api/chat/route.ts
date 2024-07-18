import { openai } from '@ai-sdk/openai';
import { generateText, generateObject, tool } from 'ai';
import { z } from 'zod';
import { NextResponse } from 'next/server';

// Allow streaming responses up to 30 seconds
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    console.log('messages: ', messages);

    const result = await generateText({
      // model: openai('gpt-4-turbo'), // $5.00 x millon de requests
      model: openai('gpt-3.5-turbo'), // $0.50 x millon de requests
      system: `maximo 300 caracteres. Eres una narrador de historias interactivas. El usuario es un detective. El usuario es quien toma las decisiones. La trama es un crimen sin resolver. No uses un tono conversacional. No le hagas preguntas al usaurio. La trama es profunda, similar a una historia de sherlock holmes. La historia tiene giros de guion. Deja que el detective saque sus propias conclusiones. No tomar decisiones por el jugador, solo sugerirlas. Las victimas tienen nombres. Al final de cada respuesta añade 3 opciones cortas.
      `,

      messages,
      tools: {
        gameOver: tool({
          //Cuando llamar a la tool
          description: 'Se ejecuta cuando el jugador resuelve el crimen',
          parameters: z.object({}),
          //Funcion que se ejecuta cuando se llama a la tool
          execute: async () => {
            console.log("Game over");
            return {};
          }
        }),
      },
      //maxTokens: 400,
    });

    if (result.text != "") {
      const resultTextFormated = await textToJson(result.text);
      //Remplazamos el texto por el JSON
      //const resultFormated = { ...result, text: resultTextFormated.notification }
      console.log(result.text)
      console.log(resultTextFormated);
      return NextResponse.json({ message: result, formattedResponse: resultTextFormated }, { status: 200 });
    }
    else {
      console.log(result.text);
      return NextResponse.json({ error: 'Error obteniendo la solicitud' }, { status: 500 });
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
