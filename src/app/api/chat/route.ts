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

  let currentAgent = "storyteller";
  let messageAgent = "";
  let gameOver = false;

  try {
    const { messages } = await req.json();
    console.log('messages: ', messages);

    const result = await generateText({
      // model: openai('gpt-4-turbo'), // $5.00 x millon de requests
      model: openai('gpt-4o-mini'), // $0.50 x millon de requests
      system: `Máximo 300 caracteres. Eres un narrador de historias interactivas. La trama es un crimen sin resolver.Al final de cada respuesta, añade 3 opciones cortas realizables en la situación actual. Los personajes tienen nombres sin tildes. No utilices juicios de valor. Casi no hay registros de los criminales; solo se conocen rumores. Habla siempre en segunda persona dirigíendote a mí, es decir, el juegador o el usuario.
      parrafo de la historia. parrafo de la historia: por ejemplo "te encuentras con tu amigo German",
      opcion 1: hablar con German,
      opcion 2: hablar con hector
      opcion 3: ...,
      `,
      messages: messages.storyteller,
      tools: {
        investigatorIsDead: tool({
          //Cuando llamar a la tool
          description: 'Se ejecuta cuando el investigador muere',
          parameters: z.object({ reasonOfDead: z.string().describe('Razón de la muerte') }),
          //Funcion que se ejecuta cuando se llama a la tool
          execute: async ({ reasonOfDead }) => {
            console.log("Game over");
            console.log("Razón de la muerte: " + reasonOfDead);
            gameOver = true;
            messageAgent = "Razón de la muerte: " + reasonOfDead;
            return {};
          }
        }),
        solvedCase: tool({
          //Cuando llamar a la tool
          description: 'Se ejecuta cuando el investigador resuelve el caso',
          parameters: z.object({ epilogue: z.string().describe('Epilogo de la historia. Futuro de los personajes despues de que el investigador resuelva el caso.') }),
          //Funcion que se ejecuta cuando se llama a la tool
          execute: async ({ epilogue }) => {
            console.log("Game over");
            console.log("epilogue: " + epilogue);
            gameOver = true;
            messageAgent = epilogue;
            return {};
          }
        }),

        speakWithNpc: tool({
          //Cuando llamar a la tool
          description: 'se ejecuta cuando el jugador dice "Hablar con [personaje]"',
          parameters: z.object({
            name: z.string().describe('Nombre del personaje. nunca usar nombres con tilde'),
            prompt: z.string().describe('Caracteristicas del persona y su rol en la historia. por ejemplo: "eres hector, una chico pescador que vive en la esquina. eras amigo de la victima llamada William"'),
          }),
          //Funcion que se ejecuta cuando se llama a la tool
          execute: async ({ name, prompt }) => {
            console.log("speakingWithNpc");
            console.log("name: " + name, "\nprompt: " + prompt);
            const agentResponse: AgentResponse = await speakWithNpc(name, prompt, messages[name.toLowerCase()] ? messages[name.toLowerCase()] as CoreMessage[] : [] as CoreMessage[]);
            currentAgent = agentResponse.name;
            messageAgent = agentResponse.message;
            gameOver = agentResponse.gameOver;
            console.log("Nombre del npc : " + agentResponse.name);
            console.log("Respuesta del npc : " + agentResponse.message);
          }
        }),
      },
      //maxTokens: 400,
    });
    //console.log(`Chat API's result: ${JSON.stringify(result)}`);

    //Fin del juego
    if (gameOver) {
      console.log("Game over");
      const response = NextResponse.json({ gameOver: true, agentResponse: messageAgent, formattedResponse: { paragraph: messageAgent, option1: "", option2: "", option3: "" }, currentAgent: "storyteller" }, { status: 200 });
      console.log(response)
      return response
    }

    //El mensaje de respuesta es del storyteller
    if (currentAgent === "storyteller") {

      let textToReturn = "";
      let resultTextFormated = { paragraph: messageAgent, option1: "Continuar investigando", option2: "Informar a la policia", option3: "" };

      if (messageAgent !== "") {
        //El mensaje de respuesta es de un NPC que le está pasando el flujo al storyteller
        textToReturn = messageAgent;
        console.log(`Chat API's textToReturn: ${textToReturn}`);
      } else {
        //El mensaje de respuesta es del storyteller
        textToReturn = result.text;
        console.log(`Chat API's textToReturn: ${textToReturn}`);
        resultTextFormated = await textToJson(textToReturn);

      }

      console.log(resultTextFormated)

      //Remplazamos el texto por el JSON
      //const resultFormated = { ...result, text: resultTextFormated.notification }
      console.log(`Chat API's result.text: ${textToReturn}`);
      console.log(`Chat API's resultTextFormated: ${JSON.stringify(resultTextFormated)}`);
      return NextResponse.json({ agentResponse: textToReturn, formattedResponse: resultTextFormated, currentAgent, gameOver }, { status: 200 });
    }

    //El mensaje de respuesta es de un NPC
    if (currentAgent !== "storyteller" && messageAgent != "") {
      console.log(`Chat API's messageAgent: ${messageAgent}`);
      return NextResponse.json({ agentResponse: messageAgent, formattedResponse: { paragraph: messageAgent, option1: "", option2: "", option3: "" }, currentAgent, gameOver }, { status: 200 });
    }

    //El mensaje de respuesta es vacío
    else {
      console.log(`Chat API's result.text: ${result.text}`);
      return NextResponse.json({ error: 'El texto de retorno está vacio' }, { status: 400 });
    }

    // Retornar una respuesta JSON válida
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: 'Error procesando la solicitud' }, { status: 400 });
  }
}

async function textToJson(text: string) {
  'use server';

  const { object } = await generateObject({
    model: openai('gpt-4o-mini'),
    system: `Transformas texto a formato JSON. siguiendo el esquema: paragraph, option1, option2, option3. No modifiques el contenido.`,
    prompt: text,
    maxTokens: 200,
    schema: z.object({
      "paragraph": z.string().describe('Parrafo principal'),
      "option1": z.string().describe('Primera opción posible.'),
      "option2": z.string().describe('Segunda opción posible.'),
      "option3": z.string().describe('Tercera opción posible.'),
    }),
  });

  return object;
}


async function speakWithNpc(name: string, prompt: string, messages: CoreMessage[]) {
  'use server';
  console.log("name: " + name, "\nprompt: " + prompt, "\nmessages: " + JSON.stringify(messages));
  let currentAgent: string = name.toLowerCase();
  let messageAgent = "";
  let resumeOfAllConversation = "";
  let gameOver = false;
  // Define los valores permitidos para 'cause'

  const result = await generateText({
    model: openai('gpt-4o-mini'),
    system: `Maximo 150 caracteres. Eres un personaje en una novela de misterio. Tu nombre es ${name}. Habla en primera persona. Le hablas al investigador. ${prompt}`,
    messages: messages,
    maxTokens: 200,
    tools: {
      endConversation: tool({
        //Cuando llamar a la tool
        description: 'Se ejecuta cuando termina la conversación, ya sea porque el investigador muere, resuelve el caso o se despide de ti ' + name,
        parameters: z.object({ cause: z.enum(['muerte', 'crimen resuelto', 'despedida']).describe('Motivo del final de la conversación: muerte, crimen resuelto o despedida'), resume: z.string().describe('Resumen detallado de la informacion recaudada') }),
        //Funcion que se ejecuta cuando se llama a la tool
        execute: async ({ cause, resume }) => {
          console.log("Anotas todo lo conversado con " + name + " en tu libreta: " + resume);
          if (cause.includes("muerte")) {
            messageAgent = "El investigador ha muerto. " + resume;
            gameOver = true;
          }
          else if (cause.includes("crimen resuelto")) {
            messageAgent = "El investigador ha resuelto el crimen. " + resume;
            gameOver = true;
          }
          else if (cause.includes("despedida")) {
            messageAgent = "Anotas todo lo conversado con " + name + " en tu libreta: " + resume;
            gameOver = false;
          }
          //mensaje que se le pasará al storyteller
          else {
            //la ia ha devuelto un parametro inesperado
            messageAgent = resume;
            console.log("La ia ha devuelto un parametro inesperado: " + cause + "\n. Parametro esperado: muerte, crimen resuelto o se despedida");
          }
          currentAgent = "storyteller";
          return
        }
      }),
    }
  });

  if (!gameOver && currentAgent !== "storyteller") {
    messageAgent = result.text;
  }



  const agentResponse: AgentResponse = { name: currentAgent, message: messageAgent, gameOver: gameOver };
  console.log("agentResponse: " + JSON.stringify(agentResponse))
  return agentResponse;
}




//falta crear el message con todos los nombres en el frontend