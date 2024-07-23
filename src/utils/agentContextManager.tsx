import { CoreMessage } from 'ai';
import { fetchOpenAI } from './fetchOpenAI';
import { resumeStory } from '@/app/actions';
import { AgentResponse } from '@/types/agentResponse';

/**
 * Interface representing the pool of agent contexts.
 * 
 * This interface maintains a collection of message histories for different agents.
 */
interface AgentContextPool {
  [key: string]: CoreMessage[];
}

/**
 * Interface for parameters required to add a message to an agent's context.
 * 
 * @property {keyof AgentContextPool} agentName - The name of the agent to add the message to.
 * @property {string} content - The content of the message to add.
 * @property {'user' | 'assistant' | 'system'} role - The role of the message sender.
 */
interface AddMessageParams {
  agentName: keyof AgentContextPool;
  content: string;
  role: 'user' | 'assistant' | 'system';
}

/**
 * Interface for parameters required to create a new agent context.
 * 
 * @property {keyof AgentContextPool} agentName - The unique identifier for the agent.
 * @property {string} forgerPrompt - The initial prompt that defines the agent's role and behavior.
 * @property {string} [adjustmentPrompt] - An optional prompt to provide additional instructions or refine the agent's behavior.
 */
interface CreateAgentContextParams {
  /**
   * The unique identifier for the agent.
   */
  agentName: keyof AgentContextPool;

  /**
   * The initial prompt that defines the agent's role and behavior.
   * 
   * **Recommended Maximum Characters**: 250
   */
  forgerPrompt: string;

  /**
   * An optional prompt to provide additional instructions or refine the agent's behavior.
   * 
   * **Recommended Maximum Characters**: 2500
   */
  adjustmentPrompt?: string;
}

/**
 * Interface for parameters required to get a reply from an agent.
 * 
 * @property {keyof AgentContextPool} agentName - The name of the agent from which to get the reply.
 * @property {string} content - The user input or message to be sent to the agent.
 */
interface GetAgentReplyParams {
  agentName: keyof AgentContextPool;
  content: string;
}

// Agent context pool to store messages for each agent
let agentContextPool: AgentContextPool = {};

/**
 * Adds a new message to the context of a specific agent and updates the pool.
 * 
 * @param {AddMessageParams} params - The parameters for adding a message.
 */
const addMessageToAgentContext = ({ agentName, content, role }: AddMessageParams): void => {
  // console.log('Adding message to agent context:', agentName, content, role);
  agentContextPool = {
    ...agentContextPool,
    [agentName.toString().toLowerCase()]: [...(agentContextPool[agentName.toString().toLowerCase()] || [] as CoreMessage[]), { role, content }],
  };
};

/**
 * Initializes the context for a new agent with the provided forger prompt and optional adjustment prompt.
 * 
 * @param {CreateAgentContextParams} params - The parameters for creating the agent context.
 */
const initializeAgentContext = ({
  agentName,
  forgerPrompt,
  adjustmentPrompt,
}: CreateAgentContextParams): void => {
  addMessageToAgentContext({ agentName, content: forgerPrompt, role: 'system' });

  if (adjustmentPrompt) {
    const instructions = [
      { role: 'user', content: 'Initializing instructions' },
      { role: 'user', content: 'Before starting the story, I will provide some instructions' },
      { role: 'assistant', content: 'I will pay attention to the instructions before entering my role' },
      { role: 'user', content: adjustmentPrompt },
      { role: 'assistant', content: 'Noted. Are you ready to start the story?' },
      { role: 'user', content: 'Yes' },
      { role: 'user', content: 'Enter your role and do not step out of it' },
    ];
    instructions.forEach((msg) =>
      addMessageToAgentContext({ agentName, content: msg.content, role: msg.role as 'user' | 'assistant' })
    );
  }
};

/**
 * Creates a new agent with the specified context.
 * 
 * @param {CreateAgentContextParams} params - The parameters for creating the agent.
 * 
 * @throws Will throw an error if the agent already exists.
 */
export const createAgent = ({
  agentName,
  forgerPrompt,
  adjustmentPrompt,
}: CreateAgentContextParams): void => {
  if (agentName in agentContextPool) {
    throw new Error('Agent already exists');
  }
  initializeAgentContext({ agentName, forgerPrompt, adjustmentPrompt });
  if (!agentContextPool[agentName]) {
    throw new Error('Agent creation failed');
  }
  // console.log(JSON.stringify(agentContextPool[agentName]));
  // console.log(`Agent ${agentName} created successfully`);

};

/**
 * Gets a reply from the specified agent based on the provided user input.
 * 
 * This function sends the user input to the specified agent and retrieves the agent's response.
 * It also updates the agent's context with the new user message and the agent's reply.
 * 
 * @param {GetAgentReplyParams} params - The parameters for getting a reply from the agent.
 * @param {keyof AgentContextPool} params.agentName - The name of the agent from which to get the reply.
 * @param {string} params.content - The user input or message to be sent to the agent.
 * 
 * 
 * @returns {Promise<AgentResponse>} - A promise that resolves to an object representing the agent's response. The structure of the response is as follows:
 * 
 * ```typescript
 * type AgentResponse = {
 *   name: string;
 *   content: {
 *     text: string;
 *     formatted: {
 *       paragraph: string;
 *       option1?: string;
 *       option2?: string;
 *       option3?: string;
 *     };
 *   };
 *   tools: {
 *     gameOver: {
 *       executed: boolean;
 *     };
 *     changeAgent: {
 *       executed: boolean;
 *       newAgent?: string;
 *     };
 *   };
 * };
 * ```
 * 
 * @throws {Error} - Throws an error if there is a problem with the API request or if the response structure does not match the expected format.
 * 
 * @example
 * const reply = await getAgentReply({ agentName: 'storyteller', content: 'What happens next?' });
 * console.log(reply.name); // 'storyteller'
 * console.log(reply.content.text); // 'The next part of the story...'
 * console.log(reply.content.formatted.paragraph); // 'The paragraph response'
 * console.log(reply.tools.gameOver.executed); // false
 */
export const getAgentReply = async ({ agentName, content }: GetAgentReplyParams): Promise<AgentResponse> => {
  // console.log(agentName)
  // console.log(content)
  addMessageToAgentContext({ agentName, content, role: 'user' });
  const response = await fetchOpenAI(agentContextPool, agentName.toString().toLowerCase());

  console.log("agregando mensaje en rol assistant al agente: " + agentName.toString().toLowerCase() + ": " + content);

  addMessageToAgentContext({
    agentName,
    content: response.content.text,
    role: 'assistant',
  });
  // console.log("agentContextPool: " + JSON.stringify(agentContextPool));

  return response;
};

/**
 * Gets all messages for a specific agent, excluding certain initialization messages and ranges.
 * 
 * @param {keyof AgentContextPool} agentName - The name of the agent to retrieve messages for.
 * 
 * @returns {CoreMessage[]} - An array of messages for the specified agent.
 * 
 * @throws Will throw an error if the agent does not exist.
 */
export const getMessages = (agentName: keyof AgentContextPool): CoreMessage[] => {
  if (!(agentName in agentContextPool)) {
    console.log("agentContextPool: " + JSON.stringify(agentContextPool));
    throw new Error(`Agent "${agentName}" does not exist.`);
  }

  const messages = agentContextPool[agentName];
  let inRemovalRange = false;

  const filteredMessages = messages.filter((message) => {
    if (message.role === 'system') {
      return false;
    }

    if (message.content === 'Initializing instructions') {
      inRemovalRange = true;
      return false;
    }
    if (message.content === 'Enter your role and do not step out of it') {
      inRemovalRange = false;
      return false;
    }

    return !inRemovalRange;
  });

  return filteredMessages;
};

/**
 * Creates a summary of the story from the messages of the 'storyteller' agent.
 * 
 * If the concatenated story length is greater than 500 characters, a summary is created using the `resumeStory` function.
 * 
 * @returns {Promise<string>} - A promise that resolves to the story summary or an error message if the story is too short.
 */
export const createStorySummary = async () => {
  const initialValue = '';
  const sumWithInitial = getMessages('storyteller').reduce(
    (accumulator, currentValue) => accumulator + `${currentValue.role}: ${currentValue.content}\n`,
    initialValue
  );
  if (sumWithInitial.length > 800) {
    const storySummary = await resumeStory(sumWithInitial);
    return storySummary;
  }
  else {
    return "Error: Historia demasiado corta: " + sumWithInitial;
  }
};

// Export the agent context pool and other functions if necessary
export { agentContextPool };
