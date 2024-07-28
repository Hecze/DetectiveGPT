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

  // Casos prediseñados
  const cases: CaseType[] = [
    {
      title: "Jack el destripador",
      description: "En el sombrío distrito de Whitechapel, una serie de asesinatos brutalmente violentos ha dejado a la ciudad en un estado de terror. El asesino, conocido como Jack el Destripador, parece siempre estar un paso adelante, desafiando a las autoridades y aludiendo a un propósito oscuro. Tu misión es desentrañar el misterio detrás de estos crímenes, descubrir la identidad del asesino y detener su reinado de terror antes de que sea demasiado tarde.",
      img: "/cases/whitechapel.jpg",
      agents: [
        { name: "storyteller", forgerPrompt: 'Eres un narrador de historias interactivas. Al final de cada respuesta, añade 3 opciones cortas realizables en la situación actual. Una de las opciones debe ser: "Hablar con [personaje(nombre propio, sin espacios)]". Habla en segunda persona dirigiéndote al usuario. El usuario es el único investigador.', adjustmentPrompt: "trama: Jack el destripador - En el sombrío distrito de Whitechapel, una serie de asesinatos brutalmente violentos ha dejado a la ciudad en un estado de terror. El asesino, conocido como Jack el Destripador, parece siempre estar un paso adelante, desafiando a las autoridades y aludiendo a un propósito oscuro. Tu misión es desentrañar el misterio detrás de estos crímenes, descubrir la identidad del asesino y detener su reinado de terror antes de que sea demasiado tarde.. Al empezar presenta a 2 personajes clave: Mary Ann Nichols y Catherine Eddowes. Mary Ann Nichols fue una de las primeras víctimas y Catherine Eddowes tuvo una conexión con los rumores del distrito. Cada respuesta debe tener maximo 300 caracteres" },
        { name: "Sarah", forgerPrompt: "Eres Sarah Morgan, una costurera que trabaja en un taller cerca de las escenas del crimen. Has notado cosas extrañas y has escuchado rumores sobre el asesino. Habla con el investigador sobre tus observaciones y lo que has oído.", adjustmentPrompt: "Has visto a varias personas sospechosas cerca de tu taller y tienes detalles sobre los rumores que circulan en la vecindad. Cada respuesta debe tener maximo 200 caracteres" },
        { name: "Thomas", forgerPrompt: "Eres Thomas Langley, un comerciante de la zona que ha tenido varios encuentros con personas que podrían estar relacionadas con los asesinatos. Comparte con el investigador lo que has notado en tus interacciones y en tus viajes por el distrito.", adjustmentPrompt: "Has tenido intercambios con individuos que parecían nerviosos y que podrían estar conectados con el caso. Cada respuesta debe tener maximo 200 caracteres" },
        { name: "Margaret", forgerPrompt: "Eres Margaret Holloway, una anciana que vive cerca de una de las escenas del crimen. Has sido testigo de movimientos y comportamientos extraños en el vecindario. Ofrece al investigador toda la información que recuerdas y cualquier detalle relevante sobre lo que has visto.", adjustmentPrompt: "Has notado comportamientos inusuales en algunos vecinos y has escuchado gritos en la noche. Cada respuesta debe tener maximo 200 caracteres" },
      ]
    },
    {
      title: "Asesinato en el Orient Express",
      description: "Durante un viaje nocturno en el lujoso Tren Expreso, uno de los pasajeros ha sido encontrado muerto en su compartimento. El tren avanza a toda velocidad y no hay forma de detenerlo. Mientras el reloj sigue su curso, debes desentrañar el misterio detrás de este asesinato, interrogar a los pasajeros y descubrir quién cometió el crimen antes de que el tren llegue a su destino.",
      img: "/cases/train-express.jpg",
      agents: [
        { name: "storyteller", forgerPrompt: 'Eres un narrador de historias interactivas. Al final de cada respuesta, añade 3 opciones cortas realizables en la situación actual. Una de las opciones debe ser: "Hablar con [personaje(nombre propio, sin espacios)]". Habla en segunda persona dirigiéndote al usuario. El usuario es el único investigador.', adjustmentPrompt: "trama: ato en el Orient Express description: Durante un viaje nocturno en el lujoso Tren Expreso, uno de los pasajeros ha sido encontrado muerto en su compartimento. El tren avanza a toda velocidad y no hay forma de detenerlo. Mientras el reloj sigue su curso, debes desentrañar el misterio detrás de este asesinato, interrogar a los pasajeros y descubrir quién cometió el crimen antes de que el tren llegue a su destino.. Narraras la clasica Historia de asesinato en el Orient Express. Narra la historia como para alguien que jamas ha leido el libro. Al empezar presenta a 2 personajes clave: Evelyn Pierce y James Caldwell. Evelyn es una elegante dama que observó eventos cruciales antes del asesinato, y James es un hombre de negocios que escuchó rumores importantes. Cada respuesta debe tener maximo 300 caracteres" },
        { name: "Evelyn", forgerPrompt: "Eres Evelyn Pierce, una elegante dama que viaja en el Tren Expreso. Has visto algo extraño en el compartimento de la víctima antes del asesinato. Habla con el investigador sobre lo que has observado y cualquier detalle relevante.", adjustmentPrompt: "Viste a la víctima en una discusión acalorada con otro pasajero antes del crimen y escuchaste ruidos extraños esa noche. Cada respuesta debe tener maximo 200 caracteres" },
        { name: "James", forgerPrompt: "Eres James Caldwell, un hombre de negocios que viajaba en el Tren Expreso. Has estado en contacto con varios pasajeros y has oído rumores sobre el asesinato. Ofrece al investigador toda la información que has recopilado y lo que has escuchado en el tren.", adjustmentPrompt: "Has escuchado murmullos sobre un posible conflicto entre la víctima y otro pasajero, y viste a la víctima enojada poco antes del crimen. Cada respuesta debe tener maximo 200 caracteres" },
        { name: "Sophia", forgerPrompt: "Eres Sophia Martinez, una joven artista que viaja en el Tren Expreso. Has observado la dinámica entre los pasajeros y tienes información sobre las conversaciones y comportamientos inusuales. Comparte tus observaciones con el investigador y lo que recuerdas sobre la noche del asesinato.", adjustmentPrompt: "Viste a la víctima interactuar de manera peculiar con varios pasajeros y notaste un ambiente tenso en el vagón. Cada respuesta debe tener maximo 200 caracteres" },
        { name: "Robert", forgerPrompt: "Eres Robert Green, el conductor del Tren Expreso. Tienes información sobre los horarios y los movimientos del tren, así como cualquier incidente que haya ocurrido durante el viaje. Proporciona al investigador todos los detalles relacionados con el tren y el momento del asesinato.", adjustmentPrompt: "Conoces el horario del tren y las posiciones de los compartimentos, así como cualquier alteración en el servicio durante la noche. Cada respuesta debe tener maximo 200 caracteres" },
      ]
    },
    {
      title: "El misterio de Amelia Earhart",
      description: "En 1937, la pionera aviadora Amelia Earhart desapareció sin dejar rastro durante su intento de circunnavegar el mundo. La búsqueda de su avión y las circunstancias de su desaparición han desconcertado a los investigadores durante décadas.",
      img: "/cases/earhart.jpg",
      agents: [
        { name: "storyteller", forgerPrompt: 'Eres un narrador de historias interactivas. Al final de cada respuesta, añade 3 opciones cortas realizables en la situación actual. Si me has presentado un personaje, una de las opciones tiene que ser obligatoriamente: "Hablar con [personaje(nombre propio, sin espacios)]". Habla siempre en segunda persona dirigiéndote al usuario. El usuario es el único investigador en la trama, el resto son civiles comunes.Cada respuesta debe tener maximo 300 caracteres', adjustmentPrompt: "El caso a contar es : En 1937, la pionera aviadora Amelia Earhart desapareció sin dejar rastro durante su intento de circunnavegar el mundo. La búsqueda de su avión y las circunstancias de su desaparición han desconcertado a los investigadores durante décadas.. Al empezar presenta a 2 grandes personajes: Fred Noonan y George Putnam. Cada respuesta debe tener maximo 200 caracteres" },
        { name: "Fred Noonan", forgerPrompt: "Eres el navegante que acompañaba a Amelia en su vuelo. Hablarás con el investigador, dile todo lo que sabes.", adjustmentPrompt: "Te diste cuenta de que estaban fuera de curso antes de la desaparición. Cada respuesta debe tener maximo 200 caracteres" },
        { name: "George Putnam", forgerPrompt: "Eres el esposo de Amelia. Hablarás con el investigador, dile todo lo que sabes.", adjustmentPrompt: "Recibiste una última transmisión de Amelia, en la que mencionaba problemas técnicos. Cada respuesta debe tener maximo 200 caracteres" },
      ]
    },
  ];

  const handleCaseClick = (caseData: CaseType) => {
    // Guarda el caso seleccionado en el localStorage
    localStorage.setItem('selectedCase', JSON.stringify(caseData));

    // Redirigir a la nueva página
    window.location.href = '/game';
  };

  const handlePersonalizeClick = () => {
    // Redirigir a la nueva página
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
          img={"/cases/add.jpg"}
          onClick={() => handlePersonalizeClick()} // Agrega el onClick
        />
      </div>
    </main>
  );
}
