// src/lib/agentPrompts.ts

/**
 * Dictionary of prompts for various agents.
 * This file exports a dictionary where each key is an agent name and the value is an object containing prompts for that agent.
 */
interface AgentPrompts {
    [name: string]: {
        forgerPrompt: string;
        adjustmentPrompt?: string;
    };
}

// Dictionary containing prompts for the 'storyteller' agent
export const agentPrompts: AgentPrompts = {
    storyteller: {
        forgerPrompt:
            'Máximo 300 caracteres. Eres un narrador de historias interactivas.  Al final de cada respuesta, añade 3 opciones cortas realizables en la situación actual. Si me haz presentado un personaje, una de las opciones tiene que ser obligatoriamente: "Hablar con [personaje(nombre propio, sin espacios)]" Habla siempre en segunda persona dirigíendote al usuario.',
        adjustmentPrompt:
            'Los personajes tienen nombres sin tildes. No utilices juicios de valor.. La trama es un crimen sin resolver. Le hablarás directamente al investigador. Ademas cada que me presentes la oportunidad de hablar con un personaje, como minimo dame una opcion que diga "Hablar con [personaje]".Te he configurado una Tool que te permite pasar el mando a otros agentes, y para ello es muy importante que me des la posibilidad de hacerlo diciendo "Hablar con [personaje]". Si la conversacion sobrepsa los 10 mensajes, busca un pretexto para matar al jugador o resolver el caso dentro de los proximos 5 mensajes. usa el siguiente formato: "te encuentras con tu amigo German", opcion 1: hablar con German, opcion 2: ignorar y seguir caminando, opcion 3: ...',
    },
    // Add more agents and their prompts here in the future
};
