
"use client"
import Image from "next/image";
import { useState } from "react";
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
        "result": 'Eres contratado por un museo,  te enfrentas a un escenario complejo: la desaparición de la curadora en medio de un evento de alta sociedad. Una nota de rescate en la oficina de Isabel. Mientras tanto, rumores sobre un subasta en el mercado negro comienzan a circular, y las cámaras de seguridad del museo parecen haber sido manipuladas. Los medios de comunicación presionan para obtener respuestas, y el museo teme por su reputación.', 
        "option 1": 'Investigar la escena del crimen',
        "option 2": 'Revisar las camaras de seguridad',
        "option 3": 'Entrevistas a los familiares de la trabajadora'
    });
    // const { messages, input, append, reload } = useChat({ api: 'api/chat' });
    const [optionSelected, setOptionSelected] = useState("")
    const [messages, setMessages] = useState<CoreMessage[]>([])

    const [options, setOptions] = useState([
        {
            text: "Investigar la escena del crimen",
        },
        {
            text: "Revisar las camaras de seguridad",
        },
        {
            text: "Entrevistas a los familiares de la trabajadora",
        }
    ])

    const selectOption = async (text: string) => {
        console.log("opcion seleccionada: " + text)
        // await append({ content: options[index].text, role: 'user' })
        let assistantMessage: CoreAssistantMessage = {
            role: 'assistant',
            content: generation.result
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
        console.log(generation)
        setOptionSelected(text)
        console.log(currentMessages)
        setMessages(currentMessages)
    }


    return (
        <div className="text-wrap text-gray-300 px-12">
            <p>{generation && generation.result}</p>
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
                    {generation && <Option text={generation["option 2"]} onClick={() => selectOption(generation["option 2"])} />}
                    {generation && <Option text={generation["option 3"]} onClick={() => selectOption(generation["option 3"])} />}
            </div>
        </div>
    );
}
