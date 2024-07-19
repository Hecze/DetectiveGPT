"use client"
import Speech from "speak-tts";
import Image from "next/image";
import { useState, useEffect, useRef, SetStateAction, ChangeEvent } from "react";
import { IoSendSharp } from "react-icons/io5";
import Option from "./option";
import { CoreAssistantMessage, CoreMessage, CoreSystemMessage, CoreUserMessage } from "ai";
import { useRouter } from 'next/navigation';
import { Input } from "postcss";

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

type Voice = {
    name: string;
    lang: string;
    default?: boolean;
    localService?: boolean;
    voiceURI?: string;
};

const initialPrompt = 'Al inicio de la historia me permetiras hablar con dos personajes. Maria o Juan '

const initialStorytellerMessages: CoreMessage[] = [
    { content: 'Antes de comenzar la historia te daré alguans instrucciones', role: "user" },
    { content: 'Prestaré atencion a las intrucciones antes de entrar en mi rol como narrador', role: "assistant" },
    { content: initialPrompt, role: "user" },
    { content: 'Anotado ¿Estas Listo para empezar la historia?', role: "assistant" },
    { content: 'Sí, entra en tu papel de narrador y no vuelvas a salir de ahi', role: "user" },
]

export default function StorytellerFlow() {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isAudioPlaying, setIsAudioPlaying] = useState(false);
    const [messages, setMessages] = useState({
        storyteller: initialStorytellerMessages,
        maria: [] as CoreMessage[],
        pedro: [] as CoreMessage[],
    });
    const [actualFlow, setActualFlow] = useState("storyteller");
    const [gameOver, setGameOver] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formattedResponse, setformattedResponse] = useState({
        paragraph: 'Bienvenido a una historia de misterio generada por IA',
        option1: 'Empezar Historia',
        option2: '',
        option3: ''
    });

    const [npcDialogue, setNpcDialogue] = useState('');
    const [speech, setSpeech] = useState<Speech | null>(null);
    const [voices, setVoices] = useState<Voice[]>([]);
    const [selectedVoice, setSelectedVoice] = useState<string>('');
    const [inputValue, setInputValue] = useState<string>('');
    const router = useRouter();

    useEffect(() => {
        const speechInstance = new Speech();
        speechInstance.init({
            volume: 0.5,
            lang: "es-MX",
            rate: 1,
            pitch: 1,
            listeners: {
                onvoiceschanged: (voices: any) => {
                    console.log("Voices changed", voices);
                    const formattedVoices: Voice[] = voices.map((voice: SpeechSynthesisVoice) => ({
                        name: voice.name,
                        lang: voice.lang,
                        default: voice.default,
                        localService: voice.localService,
                        voiceURI: voice.voiceURI
                    }));
                    setVoices(formattedVoices);
                    const defaultVoice = formattedVoices.find(voice => voice.name === "Google español");
                    if (defaultVoice) {
                        setSelectedVoice(defaultVoice.name);
                        speechInstance.setVoice(defaultVoice.name);
                    }
                }
            }
        }).then(data => {
            console.log("Speech is ready", data);
            setSpeech(speechInstance);
        }).catch(e => {
            console.error("An error occurred while initializing : ", e);
        });
    }, []);

    useEffect(() => {
        if (speech) {
            speech.speak({
                text: formattedResponse.paragraph,
                queue: false
            }).then(data => {
                console.log("Success !", data);
            }).catch(e => {
                console.error("An error occurred :", e);
            });
        }
    }, [formattedResponse, speech]);

    useEffect(() => {
        if (speech && selectedVoice) {
            speech.setVoice(selectedVoice);
            speech.speak({
                text: formattedResponse.paragraph,
                queue: false
            }).then(data => {
                console.log("Success !", data);
            }).catch(e => {
                console.error("An error occurred :", e);
            });
        }
    }, [selectedVoice]);

    const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const voiceName = e.target.value;
        console.log("voice selected: " + voiceName);
        setSelectedVoice(voiceName);
    };

    const selectOption = async (text: string) => {
        if (audioRef && audioRef.current) {
            audioRef.current.play();
            audioRef.current.volume = 0.04;
        }
        setIsAudioPlaying(true);
        setIsLoading(true);
        console.log("opcion seleccionada: " + text);
        if (text !== "") {
            const newStorytellerMessages = [
                ...messages.storyteller,
                { role: 'user', content: text } as CoreUserMessage
            ];

            const newMessages = {
                ...messages,
                storyteller: newStorytellerMessages
            }

            setMessages(newMessages);

            try {
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        messages: newMessages,
                    }),
                });

                const data = await response.json();
                const actualFlow = data.actualFlow;
                if (actualFlow === "storyteller") {
                    setActualFlow("storyteller");
                    const textResponse = data.message.text;
                    const formattedResponse = data.formattedResponse;
                    setformattedResponse({
                        paragraph: formattedResponse.paragraph,
                        option1: formattedResponse.option_one,
                        option2: formattedResponse.option_two,
                        option3: formattedResponse.option_three,
                    });
                    const newStorytellerMessages = [
                        ...messages.storyteller,
                        { role: 'assistant', content: textResponse } as CoreAssistantMessage
                    ];

                    const newMessages = {
                        ...messages,
                        storyteller: newStorytellerMessages
                    }
                    setMessages(newMessages);
                }
                else {
                    console.log("se está hablando con un npc")
                    console.log(data);
                    setActualFlow(data.actualFlow);
                    setNpcDialogue(data.message);
                }

            } catch (e) {
                setformattedResponse({ ...formattedResponse, paragraph: "Fin del Juego" });
                console.log(e);
                setTimeout(() => {
                    router.push('/endgame');
                }, 2000)
            }
        }
        setIsLoading(false);
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
                    <option
                        key={voice.name}
                        value={voice.name}
                        className="text-white"
                    >
                        {voice.name}
                    </option>
                ))}
            </select>
        </div>
    );



    const Options = () => (
        <div className="flex flex-col gap-4 mt-12">
            {formattedResponse && <Option isLoading={isLoading} text={formattedResponse.option1} onClick={() => selectOption(formattedResponse.option1)} />}
            {formattedResponse && formattedResponse.option2 !== "" && <Option isLoading={isLoading} text={formattedResponse.option2} onClick={() => selectOption(formattedResponse.option2)} />}
            {formattedResponse && formattedResponse.option3 !== "" && <Option isLoading={isLoading} text={formattedResponse.option3} onClick={() => selectOption(formattedResponse.option3)} />}
        </div>
    )


    const handleSendResponse = () => {
        console.log(inputValue);
        selectOption(inputValue);
        setInputValue("");

    };


    // const Input = () => (
    //     <div className="bg-[#413A32] rounded-xl flex flex-row mt-12 justify-center items-center">
    //         <input
    //             type="text"
    //             placeholder={`Escribe una respuesta para ${actualFlow}...`}
    //             value={inputValue}
    //             key="input"
    //             onChange={e => setInputValue(e.target.value)}
    //             className="p-4 bg-[#413A32] rounded-xl w-full focus:outline-none"
    //         />
    //         <button
    //             disabled={isLoading}
    //             className="cursor-pointer p-2 mr-4"
    //             onClick={handleSendResponse}
    //         >
    //             <IoSendSharp size={24} />
    //         </button>
    //     </div>
    // )

    return (
        <div className="xl:w-2/4 w-screen min-h-screen md:bg-contain bg-center bg-no-repeat" style={{ backgroundImage: "url('/fondoPrincipal.webp')" }}>
            <audio ref={audioRef} loop>
                <source src="soundtrack.mp3" type="audio/mp3" />
                Your browser does not support the audio element.
            </audio>
            <div className="h-full flex flex-col justify-center text-gray-300 px-4 sm:px-36 max-w-[50rem] mx-auto">
                <h1 className="hidden 2xl:block text-2xl font-bold mb-12">{gameOver ? 'Fin del juego' : 'Criminologia Procedural'}</h1>
                <h1 className="font-bold">{actualFlow !== "storyteller" && actualFlow.toUpperCase() + " :"}</h1>
                <p>{actualFlow === "storyteller" ? formattedResponse && formattedResponse.paragraph : npcDialogue}</p>
                <VoiceSelector />
                <Image
                    src="/separador.webp"
                    alt="separador"
                    width={850}
                    height={50}
                    className="xl:max-w-2/4"
                    priority
                />
                {actualFlow === "storyteller" ? <Options /> :
                    <div className="bg-[#413A32] rounded-xl flex flex-row mt-12 justify-center items-center">
                        <input
                            type="text"
                            placeholder={`Escribe una respuesta para ${actualFlow}...`}
                            value={inputValue}
                            key="input"
                            onChange={e => setInputValue(e.target.value)}
                            className="p-4 bg-[#413A32] rounded-xl w-full focus:outline-none"
                        />
                        <button
                            disabled={isLoading}
                            className="cursor-pointer p-2 mr-4"
                            onClick={handleSendResponse}
                        >
                            <IoSendSharp size={24} />
                        </button>
                    </div>
                }

            </div>
        </div>
    );
}
