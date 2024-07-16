
"use client"
import Image from "next/image";
import { useState, useEffect } from "react";
import Option from "./option";
import { generate } from '@/app/actions';
import { readStreamableValue } from 'ai/rsc';
// import { Message, useChat } from 'ai/react';
import { CoreAssistantMessage, CoreMessage, CoreSystemMessage, CoreUserMessage } from "ai";

// Force the page to be dynamic and allow streaming responses up to 30 seconds
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export default function StorytellerFlow() {
    const [generation, setGeneration] = useState({
        "consequence": 'Eres contratado por un museo,  te enfrentas a un escenario complejo: la desaparición de la curadora en medio de un evento de alta sociedad. Una nota de rescate en la oficina de Isabel. Mientras tanto, rumores sobre un subasta en el mercado negro comienzan a circular, y las cámaras de seguridad del museo parecen haber sido manipuladas. Los medios de comunicación presionan para obtener respuestas, y el museo teme por su reputación.', 
        "option 1": 'Investigar la escena del crimen',
        "option 2": 'Entrevistas a los familiares de la trabajadora',
        "option 3": 'Abandonar caso'
    });
    // const { messages, input, append, reload } = useChat({ api: 'api/chat' });
    const [messages, setMessages] = useState<CoreMessage[]>([])
    const [gameOver, setGameOver] = useState(false)


    //cada que se actualize generation se revisa las opciones, si son strings vacios entonces se acaba el juego
    useEffect(() => {
        if (generation && generation["option 1"] === "" && generation["option 2"] === "" && generation["option 3"] === "") {
            setGameOver(true);
        }
        console.log(generation);
    }, [generation]);
    

    const selectOption = async (text: string) => {
        console.log("opcion seleccionada: " + text)
        // await append({ content: options[index].text, role: 'user' })
        if(text != ""){
            let assistantMessage: CoreAssistantMessage = {
                role: 'assistant',
                content: generation.consequence
            }
            let userMessage: CoreUserMessage = {
                role: 'user',
                content: text
            }
            let currentMessages = [...messages, assistantMessage, userMessage]
            const { object } = await generate(currentMessages);
            for await (const partialObject of readStreamableValue(object)) {
                if (partialObject) {
                    setGeneration(
                        partialObject.notification
                    );
                }
            }
            // console.log(generation)
            //console.log(currentMessages)
            setMessages(currentMessages)
        }

    }


    return (
        <div className="xl:w-2/4  w-screen min-h-screen md:bg-contain bg-center bg-no-repeat" style={{ backgroundImage: "url('/fondoPrincipal.webp')" }}>
            <div className="h-full flex flex-col justify-center text-gray-300 px-4 sm:px-24 max-w-[50rem] mx-auto">
                <h1 className="text-2xl font-bold mb-12">{gameOver ? 'Fin del juego' : 'Criminologia Procedural'}</h1>
            <p>{generation && generation.consequence}</p>
            {/* {messages.map(m => (
                <div key={m.id} className="whitespace-pre-wrap">
                    {m.role === 'user' ? 'Investigador: ' : 'Narrador: '}
                    {m.content}
                </div>
            ))} */}
            <Image
                src="/separador.webp"
                alt="separador"
                width={850}
                height={50}
                className="xl:max-w-2/4"
                priority
            />
            <div className="flex flex-col gap-4 mt-12">
                {/* {options.map((option, index) => ( */}
                    {/* <Option key={index} text={option.text} onClick={() => selectOption(index)} /> */}
                {/* ))} */}
                    {generation && <Option text={generation["option 1"]} onClick={() => selectOption(generation["option 1"])} />}
                    {generation && generation["option 2"] !== "" && <Option text={generation["option 2"]} onClick={() => selectOption(generation["option 2"])} />}
                    {generation && generation["option 3"] !== "" && <Option text={generation["option 3"]} onClick={() => selectOption(generation["option 3"])} />}
            </div>
        </div>
        </div>

    );
}
