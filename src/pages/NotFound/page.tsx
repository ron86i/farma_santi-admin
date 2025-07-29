import { Button } from "@/components/ui/button";
import NotFoundImage from "@/assets/404.png";
import { Link } from "react-router";

export function NotFound() {
  return (
    <div className="flex items-center justify-center h-screen bg-neutral-100 dark:bg-neutral-900 px-4 py-6">
      <div className="flex flex-col items-center justify-center max-w-3xl w-full text-center gap-6 animate-in fade-in duration-500">
        <img
          src={NotFoundImage}
          alt="Página no encontrada"
          className="w-72 sm:w-96 mb-6"
        />
        <h1 className="text-2xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-100">
          ¡Oops! Página no encontrada
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm sm:text-base max-w-md">
          La página que estás buscando no existe o ha sido movida. Verifica la URL o vuelve al inicio.
        </p>
        <Button asChild className="mt-6">
          <Link
            to="/"
            className="hover:scale-105 transition select-none text-neutral-200 dark:text-neutral-950 dark:bg-neutral-50 bg-neutral-900 rounded-md p-2"
          >
            Volver al inicio
          </Link>
        </Button>
      </div>
    </div>
  );
}
