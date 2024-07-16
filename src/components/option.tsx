import React from 'react';
import { Button } from "@nextui-org/button";

interface OptionProps {
    text: string;
}

export default function Option({ text }: OptionProps) {
    return (
        <Button size="md" className='bg-[#413A32] text-[#E9DDCF] py-6 font-semibold opacity-90'>
            {text}
        </Button>
    );
}
