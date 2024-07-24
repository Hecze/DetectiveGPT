import { z } from 'zod';

// Define el esquema Zod para validar el tipo AgentResponse
export const agentResponseSchema = z.object({
  name: z.string(),
  content: z.object({
    text: z.string(),
    formatted: z.object({
      paragraph: z.string(),
      option1: z.string(),
      option2: z.string(),
      option3: z.string(),
    }),
  }),
  tools: z.object({
    gameOver: z.object({
      executed: z.boolean(),
    }),
    changeAgent: z.object({
      executed: z.boolean(),
      newAgent: z.string(),
      prompt: z.string(),
    }),
  }),
});

// Usa el esquema para definir el tipo de datos
export type AgentResponse = z.infer<typeof agentResponseSchema>;

/**
 * Type representing the response from an agent.
 * 
 * @typedef {Object} AgentResponse
 * @property {string} name - The name of the agent providing the response.
 * @property {Object} content - The content of the agent's response.
 * @property {string} content.text - The plain text of the response.
 * @property {Object} content.formatted - The formatted version of the response.
 * @property {string} content.formatted.paragraph - The main paragraph of the response.
 * @property {string} [content.formatted.option1] - The first response option, if applicable.
 * @property {string} [content.formatted.option2] - The second response option, if applicable.
 * @property {string} [content.formatted.option3] - The third response option, if applicable.
 * @property {Object} tools - Tools used in the response.
 * @property {Object} tools.gameOver - Indicates if the conversation has ended.
 * @property {boolean} tools.gameOver.executed - True if the game-over condition was triggered.
 * @property {Object} tools.changeAgent - Indicates if the agent has been changed.
 * @property {boolean} tools.changeAgent.executed - True if the agent was changed.
 * @property {string} [tools.changeAgent.newAgent] - The name of the new agent, if applicable.
 * @property {string} [tools.changeAgent.prompt] - The prompt for the new agent, if applicable.
 */
