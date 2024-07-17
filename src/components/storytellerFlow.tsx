"use client"
import Speech from "speak-tts";
import Image from "next/image";
import { useState, useEffect } from "react";
import Option from "./option";
import { generate } from '@/app/actions';
import { readStreamableValue } from 'ai/rsc';
import { CoreAssistantMessage, CoreMessage, CoreSystemMessage, CoreUserMessage } from "ai";
import { useChat } from "ai/react";

// Force the page to be dynamic and allow streaming responses up to 30 seconds
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export default function StorytellerFlow() {
    const [messages, setMessages] = useState<CoreMessage[]>([]);
    const [gameOver, setGameOver] = useState(false);
    const [generation, setGeneration] = useState({
        "consequence": 'Eres contratado por un museo,  te enfrentas a un escenario complejo: la desaparición de la curadora en medio de un evento de alta sociedad. Una nota de rescate en la oficina de Isabel. Mientras tanto, rumores sobre un subasta en el mercado negro comienzan a circular, y las cámaras de seguridad del museo parecen haber sido manipuladas. Los medios de comunicación presionan para obtener respuestas, y el museo teme por su reputación.', 
        "option 1": 'Investigar la escena del crimen',
        "option 2": 'Entrevistas a los familiares de la trabajadora',
        "option 3": 'Terminar juego'
    });
    const [speech, setSpeech] = useState(null);
    const [voices, setVoices] = useState([]);
    const [selectedVoice, setSelectedVoice] = useState('');

    useEffect(() => {
        const speechInstance = new Speech();
        speechInstance.init({
            volume: 0.5,
            lang: "es-MX",
            rate: 1,
            pitch: 1,
            listeners: {
                onvoiceschanged: voices => {
                    console.log("Voices changed", voices);
                    setVoices(voices);
                    const defaultVoice = voices.find(voice => voice.name === "Microsoft Sabina - Spanish (Mexico)");
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

    const handleVoiceChange = (e) => {
        const voiceName = e.target.value;
        setSelectedVoice(voiceName);
        if (speech) {
            speech.setVoice(voiceName);
        }
    };

    const selectOption = async (text: string) => {
        console.log("opcion seleccionada: " + text);
        if (text !== "") {
            try {
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
    };

    return (
        <div className="xl:w-2/4 w-screen min-h-screen md:bg-contain bg-center bg-no-repeat" style={{ backgroundImage: "url('/fondoPrincipal.webp')" }}>
            <div className="h-full flex flex-col justify-center text-gray-300 px-4 sm:px-24 max-w-[50rem] mx-auto">
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
                    {generation && <Option text={generation["option 1"]} onClick={() => selectOption(generation["option 1"])} />}
                    {generation && generation["option 2"] !== "" && <Option text={generation["option 2"]} onClick={() => selectOption(generation["option 2"])} />}
                    {generation && generation["option 3"] !== "" && <Option text={generation["option 3"]} onClick={() => selectOption(generation["option 3"])} />}
                </div>
            </div>
        </div>
    );
}
