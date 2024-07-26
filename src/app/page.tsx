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
      title: "El robo del Siglo", description: "Lorem ipsum dolor sit amet consectetur adipisicing elit...", img: "/cases/example.jpg",
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
