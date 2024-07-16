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
      <Image
        src="/fondoPrincipal.webp"
        alt="fondoSecundarioIzquierdo"
        width={1000}
        height={1000}
        className="xl:max-w-2/4 max-h-screen"
        priority
      />
      <Image
        src="/fondoSecundarioDerecho.webp"
        alt="fondoSecundarioIzquierdo"
        width={388}
        height={1024}
        className="max-w-1/4 max-h-screen hidden xl:block"
        priority
      />

      <div className="absolute max-w-[900px] bottom-0 h-[50vh]">
            <StorytellerFlow />
      </div>
    </main>
  );
}
