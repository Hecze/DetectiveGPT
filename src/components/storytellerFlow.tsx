"use client"
import Speech from "speak-tts";
import Image from "next/image";
import { useState, useEffect, useRef, SetStateAction, ChangeEvent } from "react";
import { IoSendSharp } from "react-icons/io5";
import Option from "./option";
import { CoreAssistantMessage, CoreMessage, CoreSystemMessage, CoreUserMessage } from "ai";
import Endgame from "./endgame";
import { resumeStory } from "@/app/actions";
import { fetchOpenAI } from "@/app/utils";

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

type Voice = {
    name: string;
    lang: string;
    default?: boolean;
    localService?: boolean;
    voiceURI?: string;
};

const initialPrompt = 'Al inicio de la historia me permetiras hablar con dos personajes. Maria o Pedro'

const initialStorytellerMessages: CoreMessage[] = [
    { content: 'Antes de comenzar la historia te daré alguans instrucciones', role: "user" },
    { content: 'Prestaré atencion a las intrucciones antes de entrar en mi rol como narrador', role: "assistant" },
    { content: initialPrompt, role: "user" },
    { content: 'Anotado ¿Estas Listo para empezar la historia?', role: "assistant" },
    { content: 'Sí, entra en tu papel de narrador y no vuelvas a salir de ahi', role: "user" },
]
// const initialPrompt = `
// Las decisiones del investigador deberan tener consecuencias claras en la historia. Cada cierta cantidad de interacciones, dale al investigador la opcion de volver a conversar con los personajes sobre los avances realizados. La historia inicia presentandonos la escena de crimen y diciendonos el nombre de la victima.La historia se desarrolla desde un punto de vista de primera persona, el jugador es el investigador. Cuando sea necesario detallar algun hecho, puedes usar como medio de comunicacion de los personajes la conversacion.

// El investigador puede sufrir secuestro, robo, hurto o ser asesinado, si es que es confrontado directamente con el criminal o es imprudente, tiene opcion de escape.

// El investigador no sabe la identidad del criminal al inicio de la historia, lo descubrira conforme va avanzando la historia. La historia concluye si es que el investigador atrapa al criminal, se conoce su identidad y los motivos tras el crimen. Tambien la historia puede concluir si es que el investigador es asesinado. 

// Define al criminal al inicio del juego, incluyendo nombre, perfil, y motivo. Mantén esta identidad constante a lo largo de la narrativa. El motivo del crimen y la identidad del asesino deben ser inalterables. No permitas cambios en estos elementos debido a las decisiones del jugador. Asegúrate de que todos los eventos y giros en la trama se basen en la historia establecida al inicio. Las decisiones del jugador pueden influir en la revelación de pruebas y en la dinámica de la investigación, pero no en la identidad de los personajes clave.

// Hay momentos donde las opciones no permiten actuar (como ser secuestrado o gravemente herido). Advierte ante situaciones peligrosas y da opciones donde el investigador pueda escapar. No introduzcas nuevos personajes en las opciones, solo en los resultados de las acciones elegidas. Los personajes deben de tener antecedentes, pero no deben de ser muy ocultos. El investigador puede descrubrir estos antecedentes por medio de los mismos personajes o por otros medios.

// La trama es un crimen sin resolver. La narrativa debe ser de crimen, miedo, intriga, realismo y tiene giros de guion. La trama de la historia debe ser muy elaborada. Deja que el detective saque sus propias conclusiones sin resolver el caso. No tomes decisiones por el jugador, solo sugiérelas. La narrativa puede ser terrorífica; el investigador puede sentir miedo y es vulnerable. 

// El usuario es un detective o investigador que toma las decisiones. El investigador está en desventaja, no sabe usar armas y debe usar estrategia. El investigador no tiene conocimiento previo de las víctimas ni de los demás personajes, salvo si otro personaje le da esa información. El investigador no tiene conocimiento de las ubicaciones de los personajes o de sus numeros de telefono.

// Los criminales son inteligentes, manipuladores, evasivos y pueden mentir. Son peligrosos y pueden matar si se ven acorralados; no dejan testigos vivos. Pueden lastimar al investigador o a otros personajes. Pueden secuestrar, herir o asesinar al investigador si es que  

// La policía no ayuda al detective si no se le presentan pruebas contundentes. La policia puede ayudar a hallar más pruebas. La policia no resuelve el caso o atrapa al criminal.

// Cuando el jugador resuelve el crimen debes responder con el desenlace de la historia`

export default function StorytellerFlow() {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isAudioPlaying, setIsAudioPlaying] = useState(false);
    const [agentContextManager, setAgentContextManager] = useState({
        storyteller: initialStorytellerMessages,
        maria: [] as CoreMessage[],
        pedro: [] as CoreMessage[],
    });
    const [currentAgent, setCurrentAgent] = useState<"storyteller" | "maria" | "pedro">("storyteller");
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
    const [selectedVoice, setSelectedVoice] = useState<string>('Google español');
    const [inputValue, setInputValue] = useState<string>('');
    const [storySummary, setStorySummary] = useState<string>('')

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

    const createStorySummary = async () => {
        const initialValue = '';
        const sumWithInitial = agentContextManager.storyteller.reduce(
            (accumulator, currentValue) => accumulator + `${currentValue.role}: ${currentValue.content}\n`,
            initialValue,
        );
        const storySummary = await resumeStory(sumWithInitial)
        console.log(storySummary)
        return storySummary
    }

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
        // setStorySummary(await createStorySummary())
        setIsAudioPlaying(true);
        setIsLoading(true);
        console.log("opcion seleccionada: " + text);
        if (text !== "") {
            //Nuestra respuesta debe almacenarse en el ultimo agente, al que respondimos.                  
            const lastAgentMessages = [
                ...agentContextManager[currentAgent],
                { role: 'user', content: text } as CoreUserMessage
            ];

            const newAgentsMessages = {
                ...agentContextManager,
                [currentAgent]: lastAgentMessages,
            }

            try {

                const data = await fetchOpenAI(newAgentsMessages);
                console.log(data)
                const newCurrentAgent: "storyteller" | "maria" | "pedro" = data.currentAgent;
                console.log("Le hablamos al agente: " + currentAgent);
                console.log("Nos responde el agente: " + newCurrentAgent)
                const formattedResponse = data.formattedResponse;
                setformattedResponse(formattedResponse);

                //Nuestra respuesta debe almacenarse en el ultimo agente, al que respondimos, no en el agente actual                     
                const lastAgentMessages = [
                    ...agentContextManager[currentAgent],
                    { role: 'user', content: text } as CoreUserMessage
                ];

                //El mensaje del agente debe almacenarse en el agente actual   
                const newAgentMessages = [
                    ...agentContextManager[newCurrentAgent],
                    { role: 'assistant', content: data.agentResponse } as CoreAssistantMessage
                ];

                const newMessages = {
                    ...agentContextManager,
                    [currentAgent]: lastAgentMessages,
                    [newCurrentAgent]: newAgentMessages
                }

                setAgentContextManager(newMessages);
                setNpcDialogue(data.agentResponse);
                setCurrentAgent(data.currentAgent)

            } catch (e) {
                setformattedResponse({ ...formattedResponse, paragraph: "Fin del Juego" });
                console.log(e);
                setStorySummary(await createStorySummary())
                setGameOver(true)
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


    const handleSendResponse = async () => {
        console.log(inputValue);
        setInputValue("");
        console.log(currentAgent);

        if (inputValue !== "") {
            const newAgentMessages = [
                ...agentContextManager[currentAgent],
                { role: 'user', content: inputValue } as CoreUserMessage
            ];

            const newMessages = {
                ...agentContextManager,
                [currentAgent]: newAgentMessages
            }

            setAgentContextManager(newMessages);

            try {
                const data = await fetchOpenAI(newMessages);

                console.log(data);
                const newCurrentAgent: "storyteller" | "maria" | "pedro" = data.currentAgent;
                if (currentAgent) {
                    const newAgentMessages = [
                        ...agentContextManager[newCurrentAgent],
                        { role: 'user', content: inputValue } as CoreUserMessage,
                        { role: 'assistant', content: data.agentResponse } as CoreAssistantMessage
                    ];

                    const newMessages = {
                        ...agentContextManager,
                        [newCurrentAgent]: newAgentMessages
                    }

                    setAgentContextManager(newMessages);;
                    setNpcDialogue(data.agentResponse);
                }
                else {
                    console.log("Error del servidor")
                }

            } catch (e) {
                console.log(e);
            }
        }


    };


    // const Input = () => (
    //     <div className="bg-[#413A32] rounded-xl flex flex-row mt-12 justify-center items-center">
    //         <input
    //             type="text"
    //             placeholder={`Escribe una respuesta para ${currentAgent}...`}
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
        <>
            {!gameOver ?
                <div className="xl:w-2/4 w-screen min-h-screen md:bg-contain bg-center bg-no-repeat" style={{ backgroundImage: "url('/fondoPrincipal.webp')" }}>
                    <audio ref={audioRef} loop>
                        <source src="soundtrack.mp3" type="audio/mp3" />
                        Your browser does not support the audio element.
                    </audio>
                    <div className="h-full flex flex-col justify-center text-gray-300 px-4 sm:px-36 max-w-[50rem] mx-auto">
                        <h1 className="hidden 2xl:block text-2xl font-bold mb-12">{gameOver ? 'Fin del juego' : 'Criminologia Procedural'}</h1>
                        <h1 className="font-bold">{currentAgent !== "storyteller" && currentAgent.toUpperCase() + " :"}</h1>
                        <p>{currentAgent === "storyteller" ? formattedResponse && formattedResponse.paragraph : npcDialogue}</p>
                        <VoiceSelector />
                        <Image
                            src="/separador.webp"
                            alt="separador"
                            width={850}
                            height={50}
                            className="xl:max-w-2/4"
                            priority
                        />
                        {currentAgent === "storyteller" ? <Options /> :
                            <div className="bg-[#413A32] rounded-xl flex flex-row mt-12 justify-center items-center">
                                <input
                                    type="text"
                                    placeholder={`Escribe una respuesta para ${currentAgent}...`}
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
                :
                <Endgame storyConclusion={agentContextManager.storyteller.slice(-1)[0].content.toString()} storySummary={storySummary} />}
        </>
    );
}
