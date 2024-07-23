'use client';
import Speech from 'speak-tts';
import Image from 'next/image';
import {
  useState,
  useEffect,
  useRef,
  SetStateAction,
  ChangeEvent,
} from 'react';
import { IoSendSharp } from 'react-icons/io5';
import Option from './option';
import {
  CoreAssistantMessage,
  CoreMessage,
  CoreSystemMessage,
  CoreUserMessage,
} from 'ai';
import Endgame from './endgame';
import {
  createAgent,
  getAgentReply,
  createStorySummary,
} from '@/utils/agentContextManager';
import { agentPrompts } from '@/utils/agentPrompts';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

type Voice = {
  name: string;
  lang: string;
  default?: boolean;
  localService?: boolean;
  voiceURI?: string;
};

export default function StorytellerFlow({
  investigatorPersonalities,
  storySubcategory,
}: {
  investigatorPersonalities: any;
  storySubcategory: string;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [currentAgent, setCurrentAgent] = useState('storyteller');
  const [gameOver, setGameOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [assitantResponse, setAssitantResponse] = useState('');
  const [formattedResponse, setformattedResponse] = useState({
    paragraph: 'Bienvenido a una historia de misterio generada por IA',
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
    try {
      const prompts = agentPrompts['storyteller'];
      if (!prompts) {
        throw new Error('Prompts for storyteller agent not found');
      }

      createAgent({
        agentName: 'storyteller',
        forgerPrompt: prompts.forgerPrompt,
        adjustmentPrompt: prompts.adjustmentPrompt,
      });

      console.log('Storyteller agent created successfully.');
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
        rate: 1,
        pitch: 1,
        listeners: {
          onvoiceschanged: (voices: any) => {
            console.log('Voices changed', voices);
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
        console.log('Speech is ready', data);
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
    if (audioRef && audioRef.current) {
      audioRef.current.play();
      audioRef.current.volume = 0.04;
    }

    setIsAudioPlaying(true);
    setIsLoading(true);

    if (userMessage === '') {
      setIsLoading(false);
      return; // Salir si text está vacío
    }

    setInputValue('');
    try {
      // Obtener la respuesta del asistente
      let {
        currentAgent: nextAgent,
        formattedResponse,
        agentResponse,
        gameOver: agentGameOver,
      } = await getAgentReply({
        agentName: currentAgent,
        content: userMessage,
      });

      console.log('Le hablamos al agente: ' + currentAgent);
      console.log('Nos responde el agente: ' + nextAgent);
      console.log('La respuesta del agente es: ' + agentResponse);

      // if(formattedResponse.option1 === "" && formattedResponse.option2 === "" && formattedResponse.option3 === "" && nextAgent === "storyteller") {
      if (agentGameOver) {
        // Si no hay opciones, establecer el final del juego
        setEpilogue(agentResponse);
        setStorySummary(await createStorySummary());
        setGameOver(true);
      }

      // Actualizar estados
      setformattedResponse(formattedResponse);
      setAssitantResponse(agentResponse);
      setCurrentAgent(nextAgent);
    } catch (error) {
      setformattedResponse({
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
          style={{ backgroundImage: "url('/fondoPrincipal.webp')" }}
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
                : assitantResponse}
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
                    className={`p-2 mr-4 ${
                      isLoading ? 'opacity-20' : 'opacity-100 cursor-pointer'
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
