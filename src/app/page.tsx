// pages/index.tsx
"use client"
import React from 'react';

const LandingPage: React.FC = () => {
  return (
    <div className="bg-black text-white">
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
        </div>
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <img className='m-auto' src="detectivegpt_white.png" alt="" />
            <p className="mt-6 text-lg leading-8 text-gray-300">¡Embárcate en una aventura donde cada decisión cuenta! DETECTIVE GPT es una innovadora web app que te pone en la piel de un detective, resolviendo misterios generados por IA. Utilizando la más avanzada tecnología de IA generativa, te ofrecemos una experiencia única llena de intriga, desafíos y emociones.</p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <a href="/choose-case" className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-2xl font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Resuelve el misterio</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
