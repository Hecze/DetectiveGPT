import React from 'react';
import { Button } from '@nextui-org/button';

interface OptionProps {
  isLoading: boolean;
  text: string;
  onClick?: () => void; // Definir la propiedad onClick como una función opcional
}

export default function Option({ isLoading, text, onClick }: OptionProps) {
  return (
    <>
      {isLoading ? (
        <div className="bg-[#413A32] text-[#E9DDCF] py-4 font-semibold opacity-90 break-words whitespace-normal rounded-xl flex justify-center">
          <div className="animate-pulse flex space-x-4 w-3/5">
            <div className="flex-1 space-y-6 py-1">
              <div className="space-y-3">
                <div className="h-2 bg-[#544b41] rounded"></div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <Button
          size="md"
          className="bg-[#413A32] text-[#E9DDCF] py-6 font-semibold opacity-90 break-words whitespace-normal"
          onClick={onClick} // Pasar la función onClick al botón
        >
          {text}
        </Button>
      )}
    </>
  );
}
