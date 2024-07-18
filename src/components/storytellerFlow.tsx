"use client"
import Speech from "speak-tts";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import Option from "./option";
import { CoreAssistantMessage, CoreMessage, CoreSystemMessage, CoreUserMessage } from "ai";
import { useRouter } from 'next/navigation';

// Force the page to be dynamic and allow streaming responses up to 30 seconds
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

type Voice = {
    name: string;
    lang: string;
    default?: boolean;
    localService?: boolean;
    voiceURI?: string;
};

export default function StorytellerFlow() {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isAudioPlaying, setIsAudioPlaying] = useState(false);
    const [messages, setMessages] = useState<CoreMessage[]>([{ content: 'Ya hace mas de un mes que no hay ningun crimen. Hasta que una llamada de un viejo amigo irrumpe tu noche lluviosa. opciones: 1. contestar, 2. ignorar, 3. colgar', role: "assistant" }]);
    const [gameOver, setGameOver] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formattedResponse, setformattedResponse] = useState({
        "paragraph": 'Una llamada de un viejo amigo irrumpe tu noche lluviosa',
        "option 1": 'Contestar LLamada',
        "option 2": '',
        "option 3": ''
    });
    const [speech, setSpeech] = useState<Speech | null>(null);
    const [voices, setVoices] = useState<Voice[]>([]);
    const [selectedVoice, setSelectedVoice] = useState<string>('');
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
                    const defaultVoice = formattedVoices.find(voice => voice.name === "Microsoft Sabina - Spanish (Mexico)");
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

    const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const voiceName = e.target.value;
        setSelectedVoice(voiceName);
        if (speech) {
            speech.setVoice(voiceName);
        }
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
            const newMessages = [...messages, { role: 'user', content: text }];
            setMessages(newMessages as CoreUserMessage[]);

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
                // console.log(data)
                const textResponse = data.message.text;
                // console.log(textResponse);
                const formattedResponse = data.formattedResponse;
                // console.log(formattedResponse);
                setMessages(prevMessages => [...prevMessages, { role: 'assistant', content: textResponse }]);
                setformattedResponse({
                    "paragraph": formattedResponse.paragraph,
                    "option 1": formattedResponse.option_one,
                    "option 2": formattedResponse.option_two,
                    "option 3": formattedResponse.option_three,
                });
            } catch (e) {
                setformattedResponse({ ...formattedResponse, "paragraph": "Fin del Juego" });
                console.log(e);
                setTimeout(()=> {
                    router.push('/endgame');
                }, 2000)
            }
        }
        setIsLoading(false);
    };

    return (
        <div className="xl:w-2/4 w-screen min-h-screen md:bg-contain bg-center bg-no-repeat" style={{ backgroundImage: "url('/fondoPrincipal.webp')" }}>
            <audio ref={audioRef} loop>
                <source src="soundtrack.mp3" type="audio/mp3" />
                Your browser does not support the audio element.
            </audio>
            <div className="h-full flex flex-col justify-center text-gray-300 px-4 sm:px-36 max-w-[50rem] mx-auto">
                <h1 className="hidden 2xl:block text-2xl font-bold mb-12">{gameOver ? 'Fin del juego' : 'Criminologia Procedural'}</h1>
                <p>{formattedResponse && formattedResponse.paragraph}</p>
                <select onChange={handleVoiceChange} value={selectedVoice} className="hidden">
                    {voices.map(voice => (
                        <option key={voice.name} value={voice.name}>
                            {voice.name} ({voice.lang})
                        </option>
                    ))}
                </select>
                <Image
                    src="/separador.webp"
                    alt="separador"
                    width={850}
                    height={50}
                    className="xl:max-w-2/4"
                    priority
                />
                <div className="flex flex-col gap-4 mt-12">
                    {formattedResponse && <Option isLoading={isLoading} text={formattedResponse["option 1"]} onClick={() => selectOption(formattedResponse["option 1"])} />}
                    {formattedResponse && formattedResponse["option 2"] !== "" && <Option isLoading={isLoading} text={formattedResponse["option 2"]} onClick={() => selectOption(formattedResponse["option 2"])} />}
                    {formattedResponse && formattedResponse["option 3"] !== "" && <Option isLoading={isLoading} text={formattedResponse["option 3"]} onClick={() => selectOption(formattedResponse["option 3"])} />}
                </div>
            </div>
        </div>
    );
}
