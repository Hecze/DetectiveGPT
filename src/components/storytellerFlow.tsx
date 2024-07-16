
"use client"
import Image from "next/image";
import { useState } from "react";
import Option from "./option";

export default function StorytellerFlow() {

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

    return (
        <div className="text-wrap text-gray-300 px-12">
            <p>
                Eres contratado por un museo,  te enfrentas a un escenario complejo: la desaparición de la curadora en medio de un evento de alta sociedad. Una nota de rescate en la oficina de Isabel. Mientras tanto, rumores sobre un subasta en el mercado negro comienzan a circular, y las cámaras de seguridad del museo parecen haber sido manipuladas. Los medios de comunicación presionan para obtener respuestas, y el museo teme por su reputación.
            </p>
            <Image
                src="/separador.webp"
                alt="separador"
                width={850}
                height={50}
                className="xl:max-w-2/4"
                priority
            />
            <div className="flex flex-col gap-4 mt-12">
            {options.map((option) => (
                <Option text={option.text} />
            ))}
            </div>
        </div>


    );
}
