// pages/index.tsx
"use client"
import React from 'react';
// import FeatureCard from '@/components/FeatureCard';

export default function LandingPage() {
  return (
    <div className="bg-black text-white">
      <div className="relative isolate px-6 lg:px-8">
        <div className="fixed inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
        </div>
        <div className='flex items-center h-screen'>
          <div className="mx-auto max-w-2xl mt-20">
            <div className="text-center">
              <img className='m-auto' src="detectivegpt_white.png" alt="" />
              <p className="mt-6 text-lg leading-8 text-gray-300">Prepárate para una aventura inolvidable con DETECTIVE GPT! Ponte en la piel de un detective y sumérgete en misterios llenos de sorpresas. Interroga a los testigos que tienen información clave y sigue las pistas en casos generados por IA. Cada caso es único y cada elección puede cambiarlo todo. ¿Tienes lo necesario para resolver el misterio?</p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <a href="/choose-case" className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-2xl font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 hover:scale-110">Resuelve el misterio</a>
              </div>
            </div>
          </div>
        </div>
        {/* <div className='flex gap-3 flex-wrap'>
          <div className="mx-auto max-w-2xl">
            <FeatureCard title="Resuelve misterios" description="Sumérgete en misterios llenos de sorpresas y sigue las pistas en casos generados por IA." img="detectivegpt_white.png" onClick={() => { }} />
          </div>
          <div className="mx-auto max-w-2xl">
            <FeatureCard title="Resuelve misterios" description="Sumérgete en misterios llenos de sorpresas y sigue las pistas en casos generados por IA." img="detectivegpt_white.png" onClick={() => { }} />
          </div>
          <div className="mx-auto max-w-2xl">
            <FeatureCard title="Resuelve misterios" description="Sumérgete en misterios llenos de sorpresas y sigue las pistas en casos generados por IA." img="detectivegpt_white.png" onClick={() => { }} />
          </div>
        </div> */}
      </div>
    </div>
  );
};
