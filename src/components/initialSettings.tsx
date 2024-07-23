'use client';
import { Button } from '@nextui-org/button';
import { useState } from 'react';
import PersonalitySlider from './PersonalitySlider';

export default function InitialSettings({ handleStartGame }: { handleStartGame: any }) {
  const availablePersonalities = [
    { tag: 'Paciencia', options: ['Impaciente', 'Neutral', 'Paciente'] },
    { tag: 'Optimismo', options: ['Pesimista', 'Neutral', 'Optimista'] },
    { tag: 'Cortesía', options: ['Maleducado', 'Netural', 'Cortés'] },
    { tag: 'Espontaneidad', options: ['Metódico', 'Neutral', 'Espontáneo'] },
  ];

  const [availableSubcategories, setAvailableSubcategories] = useState([
    'Sobrenatural',
    'Policial',
    'Terror',
    'Realístico',
    'Pasional',
    'Asesinato en serie',
    'Infantil',
    'Anime',
  ]);

  const [currentPersonalities, setCurrentPersonalities] = useState(
    availablePersonalities.map((personality) => ({
      tag: personality.tag,
      optionSelected: personality.options[1],
    }))
  );
  const [currentSubcategory, setCurrentSubcategory] = useState('Sobrenatural');

  const handlePersonalitySelection = (tag: string, value: string) => {
    const newCurrentPersonalities = currentPersonalities.map((personality) =>
      personality.tag === tag ? { ...personality, optionSelected: value } : personality
    );
    setCurrentPersonalities(newCurrentPersonalities);
    console.log('Se seleccionó', tag, value);
    console.log('Nuevos valores', newCurrentPersonalities);
  };

  const handleSubcategorySelection = (subcategory: string) => {
    setCurrentSubcategory(subcategory);
    handleStartGame(currentPersonalities, subcategory);
  };

  return (
    <div className="text-white bg-[#18130F] m-auto flex flex-col items-center p-3 pb-5">
      <img width="200" height="200" src="logo.png" />
      <div className="mb-4 text-center">
        <p className="text-2xl pt-3">Elige la personalidad del detective</p>
        {availablePersonalities.map((personality) => (
          <PersonalitySlider
            key={personality.tag}
            tag={personality.tag}
            options={personality.options}
            handleChange={(tag: string, value: string) => handlePersonalitySelection(tag, value)}
          />
        ))}
      </div>
      <p className="text-2xl pt-10 pb-5">Elige la trama de la historia</p>
      <div className="flex flex-wrap align-middle gap-3 items-center justify-center">
        {availableSubcategories.map((subcategory) => (
          <Button key={subcategory} size="lg" onClick={() => handleSubcategorySelection(subcategory)}>
            {subcategory}
          </Button>
        ))}
      </div>
    </div>
  );
}
