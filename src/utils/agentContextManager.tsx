import { CoreMessage } from 'ai';
import { fetchOpenAI } from './fetchOpenAI';
import { resumeStory } from '@/app/actions';

/**
 * Interface representing the pool of agent contexts.
 */
interface AgentContextPool {
  [key: string]: CoreMessage[];
}

/**
 * Interface for parameters required to add a message to an agent's context.
 */
interface AddMessageParams {
  agentName: keyof AgentContextPool;
  content: string;
  role: 'user' | 'assistant' | 'system';
}

/**
 * Interface for parameters required to create a new agent context.
 */
interface CreateAgentContextParams {
  /**
   * The unique identifier for the agent.
   */
  agentName: keyof AgentContextPool;

  /**
   * The initial prompt that defines the agent's role and behavior.
   * This is typically a concise statement describing the agent's function or role.
   * For example: "You are a baker", "You are a story narrator", "You are a restaurant assistant".
   *
   * This prompt is used with the 'system' role and sets the foundational context for the agent.
   *
   * **Recommended Maximum Characters**: 250
   */
  forgerPrompt: string;

  /**
   * An optional prompt to provide additional instructions or refine the agent's behavior.
   * This can include more detailed or extensive instructions that shape the agent's personality or responses.
   * For example: "You are friendly and helpful. When responding, always ask if the user needs further assistance."
   *
   * This prompt is used with the 'user' role and helps to adjust or add specifics to the agent's behavior beyond the initial role.
   *
   * **Recommended Maximum Characters**: 2500
   */
  adjustmentPrompt?: string;
}

/**
 * Interface for parameters required to get a reply from an agent.
 */
interface GetAgentReplyParams {
  agentName: keyof AgentContextPool;
  content: string;
}

// Agent context pool to store messages for each agent
let agentContextPool: AgentContextPool = {};

// Auxiliary Functions

/**
 * Adds a new message to the context of a specific agent and updates the pool.
 *
 * @param {AddMessageParams} params - The parameters for adding a message.
 */
const addMessageToAgentContext = ({ agentName, content, role }: AddMessageParams): void => {
  agentContextPool = {
    ...agentContextPool,
    [agentName]: [...(agentContextPool[agentName] || []), { role, content }],
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
  // Add the foundational role description for the agent
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

// Main Functions

/**
 * Creates a new agent with the specified context.
 *
 * @param {CreateAgentContextParams} params - The parameters for creating the agent.
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
};

/**
 * Gets a reply from the specified agent based on the provided user input.
 *
 * @param {GetAgentReplyParams} params - The parameters for getting a reply from the agent.
 * @returns The response from the agent.
 */
export const getAgentReply = async ({ agentName, content }: GetAgentReplyParams) => {
  // Store the new user message in the agent's context
  console.log('Before adding user message:', agentContextPool);
  console.log('User message:', agentName, content);
  addMessageToAgentContext({ agentName, content, role: 'user' });
  console.log('After adding user message:', agentContextPool);

  // Call the API to get the agent's reply
  const response = await fetchOpenAI(agentContextPool, agentName as string);
  console.log('API response:', response);

  // Add the assistant's response to the agent's context
  addMessageToAgentContext({
    agentName: response.currentAgent,
    content: response.agentResponse,
    role: 'assistant',
  });
  console.log('After adding assistant message:', agentContextPool);

  return response;
};

/**
 * Gets all messages for a specific agent, excluding certain initialization messages and ranges.
 *
 * @param {string} agentName - The name of the agent to retrieve messages for.
 * @returns {CoreMessage[]} An array of messages for the specified agent, excluding certain initialization messages and ranges.
 * @throws Will throw an error if the agent does not exist.
 */
export const getMessages = (agentName: keyof AgentContextPool): CoreMessage[] => {
  if (!(agentName in agentContextPool)) {
    throw new Error(`Agent "${agentName}" does not exist.`);
  }

  const messages = agentContextPool[agentName];
  let inRemovalRange = false;

  const filteredMessages = messages.filter((message) => {
    // Check if the message is a 'system' role message
    if (message.role === 'system') {
      return false;
    }

    // Determine if we are in the removal range
    if (message.content === 'Initializing instructions') {
      inRemovalRange = true;
      return false;
    }
    if (message.content === 'Enter your role and do not step out of it') {
      inRemovalRange = false;
      return false;
    }

    // Include messages outside the removal range
    return !inRemovalRange;
  });

  return filteredMessages;
};

export const createStorySummary = async () => {
  const initialValue = '';
  const sumWithInitial = getMessages('storyteller').reduce(
    (accumulator, currentValue) => accumulator + `${currentValue.role}: ${currentValue.content}\n`,
    initialValue
  );
  if(sumWithInitial.length > 2000){ 
    const storySummary = await resumeStory(sumWithInitial);
    console.log(storySummary);
    return storySummary; 
  }
  else{
    return "Error: Historia demasiado corta: " + sumWithInitial;
  }

};

// Export the agent context pool and other functions if necessary
export { agentContextPool };
