import { CoreMessage } from "ai";
import { z } from 'zod';
import { fetchOpenAI } from "./fetchOpenAI";
import { resumeStory } from "@/app/actions";

interface AgentContextPool {
    storyteller: CoreMessage[];
    [key: string]: CoreMessage[];
}

interface AddMessageParams {
    agent: keyof AgentContextPool;
    content: string;
    role: 'user' | 'assistant';
}

const initialPrompt = 'Hay Dos personajes muy importantes de tu historia son esther y hector. me permitiras hablar con ellos al principio. Luego puedes presentar a otros personajes con que hablar. todoslos personajes deben tener nombre propio, sin tilde';

const initialStorytellerMessages: CoreMessage[] = [
    { content: 'Antes de comenzar la historia te daré alguans instrucciones', role: "user" },
    { content: 'Prestaré atencion a las intrucciones antes de entrar en mi rol como narrador', role: "assistant" },
    { content: initialPrompt, role: "user" },
    { content: 'Anotado ¿Estas Listo para empezar la historia?', role: "assistant" },
    { content: 'Sí, entra en tu papel de narrador y no vuelvas a salir de ahi', role: "user" },
]

let agentContextPool: AgentContextPool = {
    storyteller: initialStorytellerMessages as CoreMessage[],
};

// Agregar un nuevo mensaje al contexto de un agente específico y actualizar el pool
const addMessageToAgentContext = ({ agent, content, role }: AddMessageParams): void => {
    agentContextPool = {
        ...agentContextPool,
        [agent]: [...(agentContextPool[agent] || []), { role, content }]
    };
};

// Obtener la respuesta de un agente específico
export const getAgentReply = async ({ agent, content }: { agent: keyof AgentContextPool, content: string }) => {
    // Almacenar el nuevo mensaje del usuario en el contexto del agente
    console.log('Antes de agregar mensaje de usuario:', agentContextPool);
    console.log('Mensaje de usuario:', agent, content);
    addMessageToAgentContext({ agent, content, role: 'user' });
    console.log('Después de agregar mensaje de usuario:', agentContextPool);

    // Llamar a la API para obtener la respuesta
    const response = await fetchOpenAI(agentContextPool);
    console.log('Respuesta de la API:', response);

    // La API detecta automáticamente con qué agente queremos hablar y nos responde 
    addMessageToAgentContext({ agent: response.currentAgent, content: response.agentResponse, role: 'assistant' });
    console.log('Después de agregar mensaje de asistente:', agentContextPool);

    return response;
}

export const createStorySummary = async () => {
    const initialValue = '';
    const sumWithInitial = agentContextPool.storyteller.reduce(
        (accumulator, currentValue) => accumulator + `${currentValue.role}: ${currentValue.content}\n`,
        initialValue,
    );
    const storySummary = await resumeStory(sumWithInitial);
    console.log(storySummary);
    return storySummary;
}
