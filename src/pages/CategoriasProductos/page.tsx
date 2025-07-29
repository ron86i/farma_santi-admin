import { useCallback, useEffect, useState } from "react";
import { NavBar } from "./components/NavBar";
import { SearchInput } from "@/components/search-input";
import { Button } from "@/components/ui";
import { TablaCategorias } from "./components/TablaCategorias";
import { useCategoriasContext } from "@/context";
import { ModalRegistrarCategoria } from "./components";
import { useQuery } from "@/hooks/generic";
import { obtenerListaCategorias } from "@/services";
import { useSearchParams } from "react-router";
import { useDebounce } from "@/hooks";

export function CategoriasProductos() {
  const [openModalRegistrar, setOpenModalRegistrar] = useState(false);
  const { fetch, data, loading } = useQuery(obtenerListaCategorias);
  const { categoriaAction } = useCategoriasContext();

  const [searchParams, setSearchParams] = useSearchParams();
  const filtro = searchParams.get("buscar") ?? ""; // Leer filtro de la URL
  const filtroDebounced = useDebounce(filtro, 400);
  const fetchCategorias = useCallback(() => {
    fetch();
  }, [fetch]);

  useEffect(() => {
    fetchCategorias();
  }, [categoriaAction]);

  const handleOpenModal = () => setOpenModalRegistrar(true);
  const handleCloseModal = () => setOpenModalRegistrar(false);

  const onFiltroChange = (nuevoFiltro: string) => {
    setSearchParams(nuevoFiltro ? { buscar: nuevoFiltro } : {});
  };

  return (
    <>
      <NavBar />
      <div className="flex justify-between items-center mb-4">
        <SearchInput value={filtro} onChange={onFiltroChange} />
        <Button onClick={handleOpenModal} className="cursor-pointer">
          Nueva categoría
        </Button>
      </div>

      <TablaCategorias categorias={data ?? []} loading={loading} filter={filtroDebounced} />

      {openModalRegistrar && (
        <ModalRegistrarCategoria open={openModalRegistrar} onClose={handleCloseModal} />
      )}
    </>
  );
}
