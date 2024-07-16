import StorytellerFlow from "@/components/storytellerFlow";
import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen w-screen justify-center bg-[#18130F] overflow-hidden">
      <Image
        src="/fondoSecundarioIzquierdo.webp"
        alt="fondoSecundarioIzquierdo"
        width={388}
        height={1024}
        className="max-w-1/4 max-h-screen hidden xl:block"
        priority
      />
            <StorytellerFlow />

      <Image
        src="/fondoSecundarioDerecho.webp"
        alt="fondoSecundarioIzquierdo"
        width={388}
        height={1024}
        className="max-w-1/4 max-h-screen hidden xl:block"
        priority
      />

    </main>
  );
}
