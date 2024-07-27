// components/Case.tsx
import React from 'react';

interface CaseType {
  title: string;
  description: string;
  img: string;
  onClick: () => void;
}

export default function Case({ title, description, img, onClick }: CaseType) {
  return (
    <div
      className="shadow-md rounded-lg p-6 m-4 w-full h-[350px] max-w-3xl bg-slate-700 text-gray-200 cursor-pointer hover:opacity-80 transition-opacity flex gap-4"
      onClick={onClick}
    >
      <div className="flex-shrink-0 w-1/3 shadow-inner">
        <img
          src={img}
          alt={title}
          className="rounded-lg object-cover h-full w-full"
        />
      </div>
      <div className="flex-grow p-4">
        <h2 className="text-xl font-bold">{title}</h2>
        <p className="text-gray-300 mt-2">{description}</p>
      </div>
    </div>
  );
}
