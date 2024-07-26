'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // Importar el router de Next.js
import StorytellerFlow from '@/components/storytellerFlow';
import Image from 'next/image';

export default function Game() {
  const router = useRouter(); // Crear una instancia del router
  const [gameIsStarted, setGameIsStarted] = useState(false);
  const [selectedPersonalities, setSelectedPersonalities] = useState([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState('Sobrenatural');
  let savedCase: any = {};

  useEffect(() => {
    // Verificar si hay datos en el localStorage
    savedCase = localStorage.getItem('selectedCase');
    if (!savedCase) {
      // Si no hay datos, redirigir a /personalize
      router.push('/personalize');
    }
  }, [router]);

  return (
    <main className="flex min-h-screen w-screen justify-center bg-[#18130F] overflow-hidden">
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
          agentPrompts={savedCase.agents}
        />
        <Image
          src="/fondoSecundarioDerecho.webp"
          alt="fondoSecundarioDerecho"
          width={388}
          height={1024}
          className="max-w-1/4 max-h-screen hidden xl:block"
          priority
        />
      </>
    </main>
  );
}
