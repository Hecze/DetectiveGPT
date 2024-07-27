'use client';
import InitialSettings from '@/components/initialSettings';
import StorytellerFlow from '@/components/storytellerFlow';
import { SelectedPersonality } from '@/types/initialSettings';
import Image from 'next/image';
import { useState } from 'react';

export default function Game() {
  const [gameIsStarted, setGameIsStarted] = useState(false);
  const [selectedPersonalities, setSelectedPersonalities] = useState<SelectedPersonality[]>([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState('Sobrenatural');

  const handleStartGame = (selectedPersonalities: SelectedPersonality[], selectedSubcategory: string) => {
    setSelectedPersonalities(selectedPersonalities);
    setSelectedSubcategory(selectedSubcategory);
    setGameIsStarted(true);
  };
  return (
    <main className="flex min-h-screen w-screen justify-center bg-[#18130F] overflow-hidden">
      <>
        {!gameIsStarted ? (
          <InitialSettings
            handleStartGame={(selectedPersonalities: SelectedPersonality[], selectedSubcategory: string) =>
              handleStartGame(selectedPersonalities, selectedSubcategory)
            }
          />
        ) : (
          <>
            <Image
              src="/fondoSecundarioIzquierdo.webp"
              alt="fondoSecundarioIzquierdo"
              width={388}
              height={1024}
              className="max-w-1/4 max-h-screen hidden xl:block"
              priority
            />
            <StorytellerFlow
              investigatorPersonalities={selectedPersonalities}
              storySubcategory={selectedSubcategory}
            />
            <Image
              src="/fondoSecundarioDerecho.webp"
              alt="fondoSecundarioIzquierdo"
              width={388}
              height={1024}
              className="max-w-1/4 max-h-screen hidden xl:block"
              priority
            />
          </>
        )}
      </>
    </main>
  );
}
