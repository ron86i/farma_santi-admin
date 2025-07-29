import { useDebounce, useQuery } from "@/hooks";
import { NavBar } from "./components/NavBar";
import { TablaMovimientos } from "./components/TablaMovimientos";
import { obtenerListaMovimientos } from "@/services";
import { useEffect } from "react";
import { useSearchParams } from "react-router";
import { SearchInput } from "@/components";

export function Movimientos() {
  const { fetch: fetchMovimientos, data: list, loading } = useQuery(obtenerListaMovimientos);

  const [searchParams, setSearchParams] = useSearchParams();
  const filtro = searchParams.get("buscar") ?? "";
  const filtroDebounced = useDebounce(filtro, 400);

  const onFiltroChange = (nuevo: string) => {
    setSearchParams(nuevo ? { buscar: nuevo } : {});
  };

  useEffect(() => {
    fetchMovimientos();
  }, []);

  return (
    <>
      <NavBar />
      <div className="flex justify-between items-center mb-4">
        <SearchInput value={filtro} onChange={onFiltroChange} />
      </div>
      <TablaMovimientos loading={loading} list={list ?? []} filter={filtroDebounced} />
    </>
  );
}
