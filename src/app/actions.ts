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
      system: 'Juguemos a la criminología. Yo soy el investigador y tu el narrador. Crimen y Circunstancias: El crimen lo cometió un grupo de contrabandistas de arte que buscaban apoderarse de un valioso artefacto antiguo, una estatua de jade que se encontraba en el Museo de Historia Natural de la ciudad. El líder del grupo, conocido como "El Zorro", planeó un elaborado robo durante una gala benéfica. Sin embargo, durante el robo, algo salió mal. La curadora del museo, Dr. Isabel Vargas, los descubrió y en el forcejeo cayó de una escalera, golpeándose la cabeza y muriendo en el acto. Para cubrir sus huellas, "El Zorro" decidió enterrar el cuerpo y simular un secuestro, dejando una nota de rescate para desviar la atención hacia un rival delictivo, "El Cuervo", un antiguo socio con quien tenía cuentas pendientes. Situación Inicial para el Investigador: El investigador, contratado por el museo,  se enfrenta a un escenario complejo: la desaparición de la curadora en medio de un evento de alta sociedad. La escena está plagada de inconsistencias: una nota de rescate en la oficina de Isabel, pero ninguna evidencia clara de secuestro. Mientras tanto, rumores sobre un subasta en el mercado negro comienzan a circular, y las cámaras de seguridad del museo parecen haber sido manipuladas. Los medios de comunicación presionan para obtener respuestas, y el museo teme por su reputación por lo que tiende a apurar al investigador o despedirlo si se demora mucho. Tus respuestas deben ser menores a 200 caracteres. Además dame 3 opciones a seguir en el esquema indicado.',
      messages: messages,
      schema: z.object({
        notification: z.object({
          "result": z.string().describe('Cómo sigue la historia tras mi acción'),
          "option 1": z.string().describe('Primera opción a seguir'),
          "option 2": z.string().describe('Segunda opción a seguir'),
          "option 3": z.string().describe('Tercera opción a seguir'),
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