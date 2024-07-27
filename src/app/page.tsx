// pages/index.tsx
'use client';
import Case from '@/components/Case';
import { useState } from 'react';

interface AgentType {
  name: string;
  forgerPrompt: string;
  adjustmentPrompt: string;
}

interface CaseType {
  title: string;
  description: string;
  img: string;
  agents: AgentType[];
}

export default function Home() {
  const cases: CaseType[] = [
    {
      title: "El robo del Siglo", description: "Este es el unico que funciona maomeno", img: "/cases/example.jpg",
      agents: [
        { name: "storyteller", forgerPrompt: 'Máximo 300 caracteres. Eres un narrador de historias interactivas.  Al final de cada respuesta, añade 3 opciones cortas realizables en la situación actual. Si me haz presentado un personaje, una de las opciones tiene que ser obligatoriamente: "Hablar con [personaje(nombre propio, sin espacios)]" Habla siempre en segunda persona dirigíendote al usuario. El usuario es el único investigador en la trama, el resto son civiles comunes', adjustmentPrompt: "Al empezar presentame a 2 grandes personajes. Fulanito y Menganito" },
        { name: "fulanito", forgerPrompt: "Eres un personaje secundario en una novela de misterio. Hablarás con el investigador, dile todo lo que sabes", adjustmentPrompt: "Tu viste a Menganito, tu vecino, la noche del crimen y crees fervientemente que es él" },
        { name: "menganito", forgerPrompt: "Eres un personaje secundario en una novela de misterio. Hablarás con el investigador, dile todo lo que sabes", adjustmentPrompt: "Tu viste a Fulanito, tu vecino, la noche del crimen y crees fervientemente que es él" },
      ]
    },
    {
      title: "Este es un titulo", description: "Lorem ipsum dolor sit amet consectetur adipisicing elit...", img: "/cases/example.jpg",
      agents: [
        { name: "storyteller", forgerPrompt: "Prompt Principal", adjustmentPrompt: "Prompt de Ajuste" },
        { name: "Fulanito", forgerPrompt: "Prompt Principal", adjustmentPrompt: "Prompt de Ajuste" },
        { name: "Menganito", forgerPrompt: "Prompt Principal", adjustmentPrompt: "Prompt de Ajuste" },
      ]
    },
    {
      title: "Este es un titulo", description: "Lorem ipsum dolor sit amet consectetur adipisicing elit...", img: "/cases/example.jpg",
      agents: [
        { name: "storyteller", forgerPrompt: "Prompt Principal", adjustmentPrompt: "Prompt de Ajuste" },
        { name: "Fulanito", forgerPrompt: "Prompt Principal", adjustmentPrompt: "Prompt de Ajuste" },
        { name: "Menganito", forgerPrompt: "Prompt Principal", adjustmentPrompt: "Prompt de Ajuste" },
      ]
    },
  ];

  const handleCaseClick = (caseData: CaseType) => {
    // Guarda el caso seleccionado en el localStorage
    localStorage.setItem('selectedCase', JSON.stringify(caseData));

    // Redirigir a la nueva página
    window.location.href = '/game';
  };

  const handlePersonalizeClick = () => {
    // Redirigir a la nueva página
    window.location.href = '/personalize';
  };

  return (
    <main className="flex min-h-screen w-screen justify-center bg-[#18130F] overflow-hidden">
      <div className="flex flex-wrap justify-center items-center p-6">
        {cases.map((caseItem, index) => (
          <Case
            key={index}
            title={caseItem.title}
            description={caseItem.description}
            img={caseItem.img}
            onClick={() => handleCaseClick(caseItem)} // Agrega el onClick
          />
        ))}
        <Case
          key={0}
          title={"Personalizar"}
          description={"Configura manualmente tu caso"}
          img={"/cases/example.jpg"}
          onClick={() => handlePersonalizeClick()} // Agrega el onClick
        />
      </div>
    </main>
  );
}
