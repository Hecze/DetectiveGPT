import { CoreMessage } from "ai";
import { z } from 'zod';

// AgentContextManager se encarga de la gestión del contexto para todos los agentes involucrados
interface AgentContextManager {
    storyteller: CoreMessage[];
    [key: string]: CoreMessage[]; // Claves adicionales con CoreMessage[]
}

// Definición del esquema con zod
const formattedResponseSchema = z.object({
    paragraph: z.string(),
    option1: z.string(),
    option2: z.string(),
    option3: z.string(),
});

const openaiResponseSchema = z.object({
    agentResponse: z.string(),
    currentAgent: z.string(),
    formattedResponse: formattedResponseSchema,
});

type OpenaiResponse = z.infer<typeof openaiResponseSchema>;

/**
 * Fetches the response from OpenAI API and validates its structure.
 * 
 * @param {AgentContextManager} agentContextManager - An object that manages the context for multiple agents. 
 *   Example:
 *   {
 *     storyteller: [{...}, {...}],
 *     juan: [{...}, {...}],
 *     pedro: [{...}, {...}]
 *   }
 * 
 * @returns {Promise<OpenaiResponse>} - A promise that resolves to an object representing the response from OpenAI API.
 *   Example:
 *   {
 *     agentResponse: "The response message",
 *     currentAgent: "storyteller", // The current agent's name
 *     formattedResponse: {
 *       paragraph: "The paragraph response",
 *       option1: "Option 1",
 *       option2: "Option 2",
 *       option3: "Option 3"
 *     }
 *   }
 * 
 * @throws {Error} - Throws an error if the response structure is invalid or if the HTTP request fails.
 */
export async function fetchOpenAI(agentContextManager: AgentContextManager): Promise<OpenaiResponse> {
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ messages: agentContextManager }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json(); // Recibe los datos como 'any' o 'unknown'

        console.log(data);

        // Validar la estructura de los datos con zod
        const result = openaiResponseSchema.safeParse(data);
        if (result.success) {
            console.log('Valid data structure received from OpenAI');
            return result.data; // Realiza la aserción de tipo si la validación es exitosa
        } else {
            console.log('Invalid data structure received from OpenAI');
            throw new Error('Invalid data structure received from OpenAI');
        }
    } catch (error) {
        console.error('Error fetching OpenAI response:', error);
        throw error;
    }
}
