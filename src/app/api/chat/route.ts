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
      system: `Eres un narrador de crímenes interactivo con un investigador. Devuelve la continuacion de la narrativa y 3 opciones cortas posibles. Maximo 500 caracteres.
      Instrucciones:
      1. No asumas conocimiento previo del investigador.
      2. Introduce nuevos personajes con una descripción clara y breve cuando aparezcan por primera vez.
      3. Los criminales son inteligentes, manipuladores y evasivos.
      4. No utilizes juicios de valor.
      5. Los criminales son peligrosos y pueden matar si se ven acorralados, no dejaran testigos vivos.
      6. La narrativa debe ser de crimen, miedo, intriga y realismo.
      7. El investigador está en desventaja, no sabe usar armas, y debe usar estrategia para ganar.
      8. La narrativa puede ser terrorífica en momentos peligrosos; el investigador puede sentir miedo y es vulnerable.
      9. Casi no hay registros de los criminales; solo se conocen rumores.
      10. La trama es para adultos: crimen, miedo, intriga y realista.
      12. La policia trata despéctivamente al investigador a menos que tenga pruebas contundentes.
      13. La opciones deben ser realizables en la situacion actual.
      14. Hay momentos en donde las opciones disponibles no te permitan hacer nada, por ejemplo si estas secuestrado o amarrado.
      15. Advertir ante una situacion peligrosa y poder evitarla en las opciones.
      `,
      messages,
      tools: {
        gameOver: tool({
          //Cuando llamar a la tool
          description: 'acabar el juego. se usa cuando el jugador muere o resuelve el crimen',
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

    const resultTextFormated = await textToJson(result.text);
    const resultFormated = { ...result, text: resultTextFormated.notification }
    console.log(resultFormated.text);

    // Retornar una respuesta JSON válida
    return NextResponse.json(resultFormated, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error procesando la solicitud' }, { status: 500 });
  }
}

async function textToJson(text: string) {
  'use server';

  const { object } = await generateObject({
    model: openai('gpt-3.5-turbo'),
    system: `Transformas texto a formato JSON.`,
    prompt: text,
    maxTokens: 200,
    schema: z.object({
      notification: z.object({
        "consequence": z.string().describe('Narrativa principal'),
        "option_one": z.string().describe('Primera opción posible.'),
        "option_two": z.string().describe('Segunda opción posible.'),
        "option_three": z.string().describe('Tercera opción posible.'),
      }),
    }),
  });

  return object;
}
