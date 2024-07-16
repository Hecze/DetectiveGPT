import React from 'react';
import { Button } from "@nextui-org/button";

interface OptionProps {
    text: string;
    onClick?: () => void; // Definir la propiedad onClick como una función opcional
}

export default function Option({ text, onClick }: OptionProps) {
    return (
        <Button 
            size="md" 
            className='bg-[#413A32] text-[#E9DDCF] py-6 font-semibold opacity-90 break-words whitespace-normal'
            onClick={onClick} // Pasar la función onClick al botón
        >
            {text}
        </Button>
    );
}
