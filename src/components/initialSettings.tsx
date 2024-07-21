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
  ]);
  const [currentSubcategory, setCurrentSubcategory] = useState("Sobrenatural");

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 text-center">
        <p className="text-2xl">Personalidad:</p>
        <PersonalitySlider
          options={["Impaciente", "Neutral", "Paciente"]}
        ></PersonalitySlider>
        <PersonalitySlider
          options={["Pesimista", "Positivo", "Optimista"]}
        ></PersonalitySlider>
        <PersonalitySlider
          options={["Amable", "Cortés", "Maleducado"]}
        ></PersonalitySlider>
        <PersonalitySlider
          options={["Metódico", "Adaptable", "Espontáneo"]}
        ></PersonalitySlider>
      </div>
      <p className="text-2xl">Subcategorías:</p>
      <div className="flex gap-3 items-center">
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
