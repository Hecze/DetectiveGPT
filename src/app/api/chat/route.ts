import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    // model: openai('gpt-4-turbo'), // $5.00 x millon de requests
    model: openai('gpt-3.5-turbo'), // $0.50 x millon de requests
    system: 'Juguemos a la criminología. Yo soy el jugador y tu el narrador. Crimen y Circunstancias: El crimen lo cometió un grupo de contrabandistas de arte que buscaban apoderarse de un valioso artefacto antiguo, una estatua de jade que se encontraba en el Museo de Historia Natural de la ciudad. El líder del grupo, conocido como "El Zorro", planeó un elaborado robo durante una gala benéfica. Sin embargo, durante el robo, algo salió mal. La curadora del museo, Dr. Isabel Vargas, los descubrió y en el forcejeo cayó de una escalera, golpeándose la cabeza y muriendo en el acto. Para cubrir sus huellas, "El Zorro" decidió enterrar el cuerpo y simular un secuestro, dejando una nota de rescate para desviar la atención hacia un rival delictivo, "El Cuervo", un antiguo socio con quien tenía cuentas pendientes. Situación Inicial para el Investigador: El investigador, contratado por el museo,  se enfrenta a un escenario complejo: la desaparición de la curadora en medio de un evento de alta sociedad. La escena está plagada de inconsistencias: una nota de rescate en la oficina de Isabel, pero ninguna evidencia clara de secuestro. Mientras tanto, rumores sobre un subasta en el mercado negro comienzan a circular, y las cámaras de seguridad del museo parecen haber sido manipuladas. Los medios de comunicación presionan para obtener respuestas, y el museo teme por su reputación por lo que tiende a apurar al investigador o despedirlo si se demora mucho. Tus respuestas deben ser menores a 200 caracteres.',
    messages,
    // maxTokens: 50,
  });

  return result.toAIStreamResponse();
}