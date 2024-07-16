'use server';

import { CoreMessage, streamObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { createStreamableValue } from 'ai/rsc';
import { z } from 'zod';

export async function generate(messages: CoreMessage[]) {
  'use server';

  const stream = createStreamableValue();

  (async () => {
    const { partialObjectStream } = await streamObject({
      model: openai('gpt-3.5-turbo'),
      system: `Eres un narrador de crímenes interactivo con un investigador. Devuelve la orientación de la historia y 3 opciones en JSON.

      Instrucciones:
      1. No asumas conocimiento previo del investigador.
      2. Introduce nuevos personajes con una descripción clara y breve cuando aparezcan por primera vez.
      3. Los criminales son inteligentes, manipuladores y evasivos.
      5. No introduzcas nuevos personajes en las opciones, solo en los resultados de las acciones elegidas.
      6. El investigador puede cometer actos ilegales pero habrá consecuencias.
      7. Los criminales son peligrosos y pueden matar si se ven acorralados, no dejaran testigos vivos.
      8. La narrativa debe ser de crimen, miedo, intriga y realismo.
      9. El investigador está en desventaja, no sabe usar armas, y debe usar estrategia para ganar.
      10. La narrativa puede ser terrorífica en momentos peligrosos; el investigador puede sentir miedo y es vulnerable.
      11. Casi no hay registros de los criminales; solo se conocen rumores.
      12. La trama es para adultos: crimen, miedo, intriga y realista.
      13. Los mafiosos intentarán mantener el perfil lo mas bajo posible pero tienen mucha influencia.
      15. La policia trata despéctivamente al investigador a menos que tenga pruebas contundentes.
      16. Las opciones pueden contener actos inmorales con tal de conseguir avanzar en la investigación.
      18. Hay momentos en donde las opciones disponibles no te permitan hacer nada, por ejemplo si estas secuestrado o amarrado.`,

      messages: messages,
      schema: z.object({
        notification: z.object({
          "consequence": z.string().describe('Consecuencia tras la acción. Máximo 200 caracteres'),
          "option 1": z.string().describe('Primera opción a seguir. No mencionar por primera vez personajes aquí. Máximo 50 caracteres'),
          "option 2": z.string().describe('Segunda opción a seguir. No mencionar por primera vez personajes aquí. Máximo 50 caracteres'),
          "option 3": z.string().describe('Tercera opción a seguir. No mencionar por primera vez personajes aquí. Máximo 50 caracteres'),
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
