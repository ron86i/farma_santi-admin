import NotFoundImage from "@/assets/404.png";
import { Link } from "react-router";

export function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-neutral-100 dark:bg-neutral-900 text-neutral-100 p-6">
      <img src={NotFoundImage} alt="Página no encontrada" className="w-72 sm:w-96 mb-6 animate-fadeIn" />
      
      <h1 className="text-2xl sm:text-4xl font-bold mb-4 text-center dark:text-neutral-100 text-neutral-900">¡Oops! Página no encontrada</h1>
      <p className="text-neutral-500 dark:text-neutral-400 text-center max-w-md ">
        Parece que la página que buscas no existe o ha sido movida.
      </p>

      <Link
        to="/"
        className="hover:scale-105 transition mt-6 select-none shadow cursor-pointer font-medium p-2 dark:text-neutral-950 text-neutral-200 dark:bg-neutral-50 bg-neutral-900 rounded-md"
        >
        Volver al inicio
      </Link>
    </div>
  );
}
