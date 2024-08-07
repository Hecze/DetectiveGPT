'use client';
import Speech from 'speak-tts';
import Image from 'next/image';
import { AgentResponse } from '@/types/agentResponse';
import {
  useState,
  useEffect,
  useRef,
  SetStateAction,
  ChangeEvent,
} from 'react';
import { IoSendSharp } from 'react-icons/io5';
import Option from './option';
import Endgame from './endgame';
import {
  createAgent,
  getAgentReply,
  createStorySummary,
  addMessageToAgentContext,
  agentContextPool,
} from '@/utils/agentContextManager';
import { agentPromptsDefault, gameSettings } from '@/utils/agentPrompts';

export const dynamic = 'force-dynamic';

type Voice = {
  name: string;
  lang: string;
  default?: boolean;
  localService?: boolean;
  voiceURI?: string;
};

import { SelectedPersonality } from '@/types/initialSettings';

export default function StorytellerFlow({
  investigatorPersonalities = [],
  storySubcategory = "Misterio",
  agentPrompts = undefined,

}: {
  investigatorPersonalities?: SelectedPersonality[];
  storySubcategory?: string;
  agentPrompts?: { name: string; forgerPrompt: string; adjustmentPrompt: string }[];

}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [currentAgent, setCurrentAgent] = useState('storyteller');
  const [gameOver, setGameOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [assistantResponse, setAssistantResponse] = useState('');
  const [formattedResponse, setFormattedResponse] = useState({
    paragraph: 'Bienvenido detective, necesitamos de tu ayuda para resolver este caso. ¿Estás listo para comenzar?',
    option1: 'Empezar Historia',
    option2: '',
    option3: '',
  });

  const [speech, setSpeech] = useState<Speech | null>(null);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('Google español');
  const [inputValue, setInputValue] = useState<string>('');
  const [epilogue, setEpilogue] = useState<string>('');
  const [storySummary, setStorySummary] = useState<string>('');
  const createStorytellerAgent = () => {
    console.log(agentPrompts)
    let difficultyPrompt = "";
    let violencePrompt = "";
    let durationPrompt = "";

    // Mapping de la dificultad seleccionada por el usuario a la configuración del juego
    if (investigatorPersonalities[0] !== undefined) {
      if (investigatorPersonalities[0].optionSelected === 'Fácil') {
        difficultyPrompt = gameSettings['dificulty']['low'];
      } else if (investigatorPersonalities[0].optionSelected === 'Medio') {
        difficultyPrompt = gameSettings['dificulty']['mid'];
      }
      else {
        difficultyPrompt = gameSettings['dificulty']['high'];
      }

      if (investigatorPersonalities[1].optionSelected === 'Bajo') {
        violencePrompt = gameSettings['violence']['low'];
      }
      else if (investigatorPersonalities[1].optionSelected === 'Medio') {
        violencePrompt = gameSettings['violence']['mid'];
      }
      else {
        violencePrompt = gameSettings['violence']['high'];
      }

      if (investigatorPersonalities[2].optionSelected === '10 minutos') {
        durationPrompt = gameSettings['duration']['low'];
      }
      else if (investigatorPersonalities[2].optionSelected === '30 minutos') {
        durationPrompt = gameSettings['duration']['mid'];
      }
      else {
        durationPrompt = gameSettings['duration']['high'];
      }
    }

    try {
      if (agentPrompts === undefined) {
        agentPrompts = [{ name: 'storyteller', forgerPrompt: agentPromptsDefault.storyteller.forgerPrompt + `El tipo de misterio es ${storySubcategory}.` + difficultyPrompt + violencePrompt + durationPrompt, adjustmentPrompt: agentPromptsDefault.storyteller.adjustmentPrompt as string }]
      }

      const storytellerPrompt = agentPrompts.find((prompt) => prompt.name === 'storyteller');
      if (!storytellerPrompt) {
        throw new Error('Prompts for storyteller agent not found');
      }
      console.log(Object.keys(agentContextPool));
      console.log(agentPrompts);
      agentPrompts.forEach((prompt) => {
        console.log(prompt.name);

        createAgent({
          agentName: prompt.name.toLowerCase(),
          forgerPrompt: prompt.forgerPrompt,
          adjustmentPrompt: prompt.adjustmentPrompt,
        });
      });

      // createAgent({
      //   agentName: 'storyteller',
      //   forgerPrompt: storytellerPrompt.forgerPrompt + `El tipo de misterio es ${storySubcategory}.` + difficultyPrompt + violencePrompt + durationPrompt,
      //   adjustmentPrompt: storytellerPrompt.adjustmentPrompt + "",
      // });

      console.log('Storyteller agent created successfully.');
      console.log(Object.keys(agentContextPool));
    } catch (error) {
      console.error('Error creating storyteller agent:', error);
    }
  };

  useEffect(() => {
    console.log('Investigator personalities', investigatorPersonalities);
    console.log('Story subcategories', storySubcategory);
    // Call the function to create the agent
    createStorytellerAgent();
    const speechInstance = new Speech();
    speechInstance
      .init({
        volume: 0.5,
        lang: 'es-MX',
        rate: 1.1,
        pitch: 1,
        listeners: {
          onvoiceschanged: (voices: any) => {
            // console.log('Voices changed', voices);
            const formattedVoices: Voice[] = voices.map(
              (voice: SpeechSynthesisVoice) => ({
                name: voice.name,
                lang: voice.lang,
                default: voice.default,
                localService: voice.localService,
                voiceURI: voice.voiceURI,
              })
            );
            setVoices(formattedVoices);
            const defaultVoice = formattedVoices.find(
              (voice) => voice.name === 'Google español'
            );
            if (defaultVoice) {
              setSelectedVoice(defaultVoice.name);
              speechInstance.setVoice(defaultVoice.name);
            }
          },
        },
      })
      .then((data) => {
        // console.log('Speech is ready', data);
        setSpeech(speechInstance);
      })
      .catch((e) => {
        console.error('An error occurred while initializing : ', e);
      });
  }, []);

  useEffect(() => {
    if (speech) {
      speech
        .speak({
          text: formattedResponse.paragraph,
          queue: false,
        })
        .then((data) => {
          console.log('Success !', data);
        })
        .catch((e) => {
          console.error('An error occurred :', e);
        });
    }
  }, [formattedResponse, speech]);

  useEffect(() => {
    if (speech && selectedVoice) {
      speech.setVoice(selectedVoice);
      speech
        .speak({
          text: formattedResponse.paragraph,
          queue: false,
        })
        .then((data) => {
          console.log('Success !', data);
        })
        .catch((e) => {
          console.error('An error occurred :', e);
        });
    }
  }, [selectedVoice]);

  const sendUserMessage = async (userMessage: string) => {
    // Reproducir el audio si está disponible
    if (audioRef && audioRef.current) {
      audioRef.current.play();
      audioRef.current.volume = 0.04;
    }

    setIsAudioPlaying(true);
    setIsLoading(true);

    // Salir si el mensaje está vacío
    if (userMessage.trim() === '') {
      setIsLoading(false);
      return;
    }

    // Limpiar el valor de entrada
    setInputValue('');

    try {
      // Obtener la respuesta del asistente
      const response = await getAgentReply({
        agentName: currentAgent,
        content: userMessage,
      });
      console.log('Response: ', response);

      // Destructurar los valores del objeto de respuesta
      let {
        name: agentName,
        content: {
          text: agentReplyText,
          formatted: agentReplyFormatted,
        },
        tools: {
          gameOver: { executed: isGameOver },
          changeAgent: { executed: agentChanged, newAgent: newAgentName, prompt: agentPrompt },
        }
      } = response;

      console.log('Le hablamos al agente: ' + agentName);
      console.log('La respuesta del agente es: ' + agentReplyText);

      if (isGameOver) {
        // Establecer el epílogo y el resumen de la historia si el juego ha terminado
        setEpilogue(agentReplyText);
        setStorySummary(await createStorySummary());
        setGameOver(true);
      }

      // Actualizar estados

      if (agentChanged) {
        console.log('El nuevo agente es: ' + newAgentName);
        //buscar si el nombre ya esta en el pool de agente
        console.log(newAgentName)
        console.log(Object.keys(agentContextPool))
        if (newAgentName.toLowerCase() in agentContextPool) {

          console.log('El agente ya existe');
        }
        else {
          console.log("el agente no existe");
          createAgent({ agentName: newAgentName, forgerPrompt: `Eres ${newAgentName}, un personaje secundario en una novela de misterio. No tengas una personalidad exagerada. No seas servicial. No seas ambiguo. No hables de manera poética. Responde textos cortos.`, adjustmentPrompt: `Habla en primera persona. Tu objetivo es conversar naturalmente no brindar informacion.El investigador debe ganarse tu confianza. No conoces al investigador hasta ahora a menos que la siguiente data diga lo contrario:  ${agentPrompt}. No repitas esta informacion textualmente, es solo contexto para que sepas como actuar. No acabes tus frases con preguntas. Empieza tu conversacion con una frase de como te sientes con respecto a los ultimos sucesos. No seas tan ambiguo` });
          addMessageToAgentContext({ agentName: "storyteller", content: `*definicion:${agentPrompt} . Cuando te diga "continuar" narra la trama que ocurre inmediatamente despues de que la conversacion culmine, no le repitas la informacion anteriormente mencionada*`, role: "user" });

        }

        addMessageToAgentContext({ agentName: "storyteller", content: `*Conversacion terminada con ${newAgentName}\n  *`, role: "user" });


        const response = await getAgentReply({
          agentName: newAgentName,
          content: "",
        })
        console.log(agentPrompt)
        agentReplyText = response.content.text;
        agentReplyFormatted = response.content.formatted;
        setCurrentAgent(newAgentName as string);
        //aca deberia hacer otra peticion a la api para que el agentesea el primero en hablar
      }
      else {
        setCurrentAgent(agentName as string);
      }
      console.log("Formatted response: ", agentReplyFormatted);
      setFormattedResponse(agentReplyFormatted);
      console.log("Assistant response: ", agentReplyText);
      setAssistantResponse(agentReplyText);
    } catch (error) {
      // Manejo de errores
      setFormattedResponse({
        paragraph: 'Fin del Juego',
        option1: '',
        option2: '',
        option3: '',
      });
      console.log(error);
      setStorySummary(await createStorySummary());
      setGameOver(true);
    }

    setIsLoading(false);
  };

  // Función para agregar un mensaje al contexto de un agente

  const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const voiceName = e.target.value;
    console.log('voice selected: ' + voiceName);
    setSelectedVoice(voiceName);
  };

  const VoiceSelector = () => (
    <div className="hidden xl:block">
      <h6 className="font-semibold mt-4">Voz de lectura:</h6>
      <select
        onChange={handleVoiceChange}
        className="max-w-xs bg-[#413A32] rounded-xl px-4 py-2 mt-2"
        value={selectedVoice}
      >
        {voices.map((voice) => (
          <option key={voice.name} value={voice.name} className="text-white">
            {voice.name}
          </option>
        ))}
      </select>
    </div>
  );

  const Options = () => (
    <div className="flex flex-col gap-4 mt-12">
      {formattedResponse && (
        <Option
          isLoading={isLoading}
          text={formattedResponse.option1}
          onClick={() => sendUserMessage(formattedResponse.option1)}
        />
      )}
      {formattedResponse && formattedResponse.option2 !== '' && (
        <Option
          isLoading={isLoading}
          text={formattedResponse.option2}
          onClick={() => sendUserMessage(formattedResponse.option2)}
        />
      )}
      {formattedResponse && formattedResponse.option3 !== '' && (
        <Option
          isLoading={isLoading}
          text={formattedResponse.option3}
          onClick={() => sendUserMessage(formattedResponse.option3)}
        />
      )}
    </div>
  );

  return (
    <>
      {!gameOver ? (
        <div
          className="xl:w-2/4 w-screen min-h-screen md:bg-contain bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/fondoPrincipal.png')" }}
        >
          <audio ref={audioRef} loop>
            <source src="soundtrack.mp3" type="audio/mp3" />
            Your browser does not support the audio element.
          </audio>
          <div className="h-full flex flex-col justify-center text-gray-300 px-4 sm:px-36 max-w-[50rem] mx-auto">
            <h1 className="hidden 2xl:block text-2xl font-bold mb-12">
              {gameOver ? 'Fin del juego' : 'Criminologia Procedural'}
            </h1>
            <h1 className="font-bold">
              {currentAgent !== 'storyteller' &&
                currentAgent.toUpperCase() + ' :'}
            </h1>
            <p>
              {currentAgent === 'storyteller'
                ? formattedResponse && formattedResponse.paragraph
                : assistantResponse}
            </p>
            <VoiceSelector />
            <Image
              src="/separador.webp"
              alt="separador"
              width={850}
              height={50}
              className="xl:max-w-2/4"
              priority
            />
            {currentAgent === 'storyteller' ? (
              <Options />
            ) : (
              <>
                <div className="bg-[#413A32] rounded-xl flex flex-row mt-12 justify-center items-center mb-12">
                  <input
                    type="text"
                    placeholder={`Escribe una respuesta para ${currentAgent}...`}
                    value={inputValue}
                    key="input"
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === 'Enter' && sendUserMessage(inputValue)
                    }
                    className="p-4 bg-[#413A32] rounded-xl w-full focus:outline-none"
                    disabled={isLoading}
                  />
                  <button
                    disabled={isLoading}
                    className={`p-2 mr-4 ${isLoading ? 'opacity-20' : 'opacity-100 cursor-pointer'
                      }`}
                    onClick={() => sendUserMessage(inputValue)}
                  >
                    <IoSendSharp size={24} />
                  </button>
                </div>
                <Option
                  isLoading={isLoading}
                  text="Terminar Conversación"
                  onClick={() => sendUserMessage('Terminar Conversación')}
                />
              </>
            )}
          </div>
        </div>
      ) : (
        <Endgame storyConclusion={epilogue} storySummary={storySummary} />
      )}
    </>
  );
}
