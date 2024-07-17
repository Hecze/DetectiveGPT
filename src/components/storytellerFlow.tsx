"use client"
import Speech from "speak-tts";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import Option from "./option";
import { CoreAssistantMessage, CoreMessage, CoreSystemMessage, CoreUserMessage } from "ai";

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
    const [messages, setMessages] = useState<CoreMessage[]>([]);
    const [gameOver, setGameOver] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [generation, setGeneration] = useState({
        "consequence": 'Eres contratado por un museo,  te enfrentas a un escenario complejo: la desaparición de la curadora en medio de un evento de alta sociedad. Una nota de rescate en la oficina de Isabel. Mientras tanto, rumores sobre un subasta en el mercado negro comienzan a circular, y las cámaras de seguridad del museo parecen haber sido manipuladas. Los medios de comunicación presionan para obtener respuestas, y el museo teme por su reputación.',
        "option 1": 'Investigar la escena del crimen',
        "option 2": 'Entrevistas a los familiares de la trabajadora',
        "option 3": 'Terminar juego'
    });
    const [speech, setSpeech] = useState<Speech | null>(null);
    const [voices, setVoices] = useState<Voice[]>([]);
    const [selectedVoice, setSelectedVoice] = useState<string>('');

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
                text: generation.consequence,
                queue: false
            }).then(data => {
                console.log("Success !", data);
            }).catch(e => {
                console.error("An error occurred :", e);
            });
        }
    }, [generation, speech]);

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
            audioRef.current.volume = 0.04
        }
        setIsAudioPlaying(true)
        setIsLoading(true)
        console.log("opcion seleccionada: " + text)
        // await append({ content: options[index].text, role: 'user' })
        if(text != ""){

            try{
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        messages: [...messages, { role: 'user', content: text }],
                    }),
                });

                const data = await response.json();
                setMessages([...messages, { role: 'assistant', content: JSON.stringify(data.text) }]);
                console.log(data.text);
                setGeneration({
                    "consequence": data.text.consequence,
                    "option 1": data.text.option_one,
                    "option 2": data.text.option_two,
                    "option 3": data.text.option_three,
                });
            } catch (e) {
                console.log(e);
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
                <p>{generation && generation.consequence}</p>
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
                    {generation && <Option isLoading={isLoading} text={generation["option 1"]} onClick={() => selectOption(generation["option 1"])} />}
                    {generation && generation["option 2"] !== "" && <Option isLoading={isLoading} text={generation["option 2"]} onClick={() => selectOption(generation["option 2"])} />}
                    {generation && generation["option 3"] !== "" && <Option isLoading={isLoading} text={generation["option 3"]} onClick={() => selectOption(generation["option 3"])} />}
                </div>
            </div>
        </div>
    );
}
