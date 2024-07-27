'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import StorytellerFlow from '@/components/storytellerFlow';
import Image from 'next/image';

interface Agent {
  name: string;
  forgerPrompt: string;
  adjustmentPrompt: string;
}

interface SavedCase {
  title: string;
  description: string;
  img: string;
  agents: Agent[];
}

export default function Game() {
  const router = useRouter();
  const [savedCase, setSavedCase] = useState<SavedCase | null>(null);

  useEffect(() => {
    const storedCase = localStorage.getItem('selectedCase');
    if (storedCase) {
      const parsedCase: SavedCase = JSON.parse(storedCase);
      setSavedCase(parsedCase);
      console.log('agentContext', parsedCase.agents);
    } else {
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
        {savedCase && savedCase.agents && savedCase.agents.length > 0 && (
          <StorytellerFlow
            agentPrompts={savedCase.agents}
          />
        )}
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
