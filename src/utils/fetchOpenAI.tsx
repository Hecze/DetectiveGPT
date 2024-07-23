// fetchOpenAI.ts
import { CoreMessage } from 'ai';
import { AgentResponse, agentResponseSchema } from '@/types/agentResponse'; // Asegúrate de ajustar la ruta según la ubicación de types.ts

// AgentContextManager se encarga de la gestión del contexto para todos los agentes involucrados
interface AgentContextManager {
  [key: string]: CoreMessage[]; // Claves adicionales con CoreMessage[]
}

/**
 * Fetches the response from OpenAI API and validates its structure.
 *
 * @param {AgentContextManager} agentContextManager - An object that manages the context for multiple agents.
 * @param {string} currentAgent - The name of the current agent.
 * @returns {Promise<AgentResponse>} - A promise that resolves to an object representing the response from OpenAI API.
 * @throws {Error} - Throws an error if the response structure is invalid or if the HTTP request fails.
 */
export async function fetchOpenAI(agentContextManager: AgentContextManager, currentAgent: string): Promise<AgentResponse> {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages: agentContextManager, currentAgent: currentAgent }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json() as AgentResponse; 

    // console.log('Received data:', data);
    // Validar la estructura de los datos con zod
    const result = agentResponseSchema.safeParse(data);
    if (result.success) {
      console.log('Valid data structure received from OpenAI');
      return result.data; // Realiza la aserción de tipo si la validación es exitosa
    } else {
      console.error('Invalid data structure received from OpenAI');
      // Imprimir detalles del error para diagnóstico
      console.error('Validation issues:', result.error.issues);
      throw new Error('Invalid data structure received from OpenAI');
    }
  } catch (error) {
    console.error('Error fetching OpenAI response:', error);
    throw error;
  }
}
