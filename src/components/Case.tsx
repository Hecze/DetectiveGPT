// components/Case.tsx
interface CaseType {
  title: string;
  description: string;
  img: string;
  onClick: () => void; // Agregar el callback onClick
}

export default function Case({ title, description, img, onClick }: CaseType) {
  return (
    <div
      className="shadow-md rounded-lg p-4 m-4 w-full max-w-md bg-[#5e4d2f] text-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
      onClick={onClick} // Añadir el manejador de clics
    >
      <img src={img} alt={title} width={400} height={200} className="rounded-lg"/>
      <h2 className="text-xl font-bold mt-4">{title}</h2>
      <p className="text-gray-300 mt-2">{description}</p>
    </div>
  );
}
