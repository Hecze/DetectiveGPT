"use client";
import { Button } from "@nextui-org/button";
import { useState } from "react";
import PersonalitySlider from "./PersonalitySlider";

export default function StorytellerFlow() {
  // const [availablePersonalities, setAvailablePersonalities] = useState([""])
  const [availableSubcategories, setAvailableSubcategories] = useState([
    "Sobrenatural",
    "Policial",
    "Terror",
    "Realístico",
    "Pasional",
    "Asesinato en serie",
    "Infantil",
    "Anime",
  ]);
  const [currentSubcategory, setCurrentSubcategory] = useState("Sobrenatural");

  return (
    <div className="flex flex-col items-center">
      <img width="200" height="200" src="logo.png" />
      <div className="mb-4 text-center">
        <p className="text-2xl">Elige la personalidad del detective</p>
        <PersonalitySlider
          tag="Paciencia"
          options={["Impaciente", "Neutral", "Paciente"]}
        ></PersonalitySlider>
        <PersonalitySlider
          tag="Optimismo"
          options={["Pesimista", "Positivo", "Optimista"]}
        ></PersonalitySlider>
        <PersonalitySlider
          tag="Actitud"
          options={["Maleducado", "Amable", "Cortés"]}
        ></PersonalitySlider>
        <PersonalitySlider
          tag="Espontaneidad"
          options={["Adaptable", "Espontáneo", "Metódico"]}
        ></PersonalitySlider>
      </div>
      <p className="text-2xl">Elige la trama de la historia:</p>
      <div className="flex flex-wrap align-middle gap-3 items-center justify-center">
        {availableSubcategories.map((subcategory) => (
          <Button
            key={subcategory}
            size="lg"
            onClick={() => setCurrentSubcategory(subcategory)}
          >
            {subcategory}
          </Button>
        ))}
      </div>
    </div>
  );
}
