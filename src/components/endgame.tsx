'use client';
import { Button } from '@nextui-org/button';

export default function Endgame({
  storyConclusion,
  storySummary,
}: {
  storyConclusion: string;
  storySummary: string;
}) {
  const restartGame = () => {
    location.reload();
  };

  return (
    <main className="text-white flex flex-col min-h-screen w-screen justify-center bg-[#18130F] overflow-hidden">
      <div className="m-3 md:w-1/2 md:m-auto">
        <div className="pb-3">
          <h1 className="font-bold">Fin del juego</h1>
          {/* <p>Isabela fue encontrada sana y salva, sus familiares agradecieron la transparencia en la información y el caso se resolvió en pocas semanas. El zorro fue capturado y todo volvió a la normalidad.</p> */}
          <p>{storyConclusion}</p>
        </div>

        <div className="pb-3">
          <h1 className="font-bold">Resumen de la historia</h1>
          {/* <p>Fuiste contratado por un museo y te enfrentaste a un escenario complejo: la desaparición de la curadora en medio de un evento de alta sociedad. Isabel, la curadora principal, desapareció sin dejar rastro, y se encontró una nota de rescate en su oficina. Los rumores sobre una subasta en el mercado negro comenzaron a circular y las cámaras de seguridad del museo parecían haber sido manipuladas. Mientras los medios de comunicación presionaban por respuestas, tú investigaste incansablemente, descubriendo que las grabaciones de las horas cruciales habían sido borradas.
                    Finalmente, seguiste una pista clave que te llevó a una transacción sospechosa entre uno de los coleccionistas presentes en el evento y una figura del tráfico de arte. Localizaste el escondite donde Isabel estaba retenida y, con la ayuda de las autoridades, la rescataste sana y salva. La noticia de su liberación restableció la reputación del museo y desmanteló una red criminal dedicada al robo y tráfico de arte, devolviendo la paz y la normalidad a la institución.</p> */}
          <p>{storySummary}</p>
        </div>

        <div className="flex flex-col gap-2">
          <Button className="bg-[#413a32] text-[#e9ddcf] py-6 font-semibold opacity-90 break-words whitespace-normal">
            Descargar reporte (PDF)
          </Button>
          <Button
            onClick={restartGame}
            className="bg-[#413a32] text-[#e9ddcf] py-6 font-semibold opacity-90 break-words whitespace-normal"
          >
            Resolver otro caso
          </Button>
        </div>
      </div>
    </main>
  );
}
