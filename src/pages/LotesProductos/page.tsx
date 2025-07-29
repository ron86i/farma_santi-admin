import { SearchInput } from "@/components/search-input";
import { NavBar } from "./components/NavBar";
import { Button } from "@/components/ui";
import { useEffect, useState } from "react";
import { ModalRegistrarLoteProducto } from "./components/ModalRegistarLoteProducto";
import { useDebounce, useQuery } from "@/hooks";
import { obtenerListaLoteProductos } from "@/services/loteProductoService";
import { TablaLoteProductos } from "./components/TablaLoteProductos";
import { useLoteProductosContext } from "@/context/loteProductoLote";
import { useSearchParams } from "react-router";

export function LotesProductos() {
    const [openModalRegistrar, setOpenModalRegistrar] = useState(false);
    const { data: dataLista, fetch: fetchLista, loading } = useQuery(obtenerListaLoteProductos);
    const { loteProductoAction } = useLoteProductosContext();

    const [searchParams, setSearchParams] = useSearchParams();
    const filtro = searchParams.get("buscar") ?? "";
    const filtroDebounced = useDebounce(filtro, 400);
    useEffect(() => {
        async function fetchData() {
            await fetchLista();
        }
        fetchData();
    }, [loteProductoAction]);

    // Actualiza el query param `buscar` en la URL cuando cambia el filtro
    const onFiltroChange = (nuevoFiltro: string) => {
        setSearchParams(nuevoFiltro ? { buscar: nuevoFiltro } : {});
    };

    return (
        <>
            <NavBar />
            <div className="flex justify-between items-center mb-4">
                <SearchInput value={filtro} onChange={onFiltroChange} />
                <Button onClick={() => setOpenModalRegistrar(true)} className="cursor-pointer">
                    Nuevo lote de producto
                </Button>
            </div>
            <TablaLoteProductos loading={loading} lista={dataLista ?? []} filter={filtroDebounced} />
            {openModalRegistrar && (
                <ModalRegistrarLoteProducto
                    open={openModalRegistrar}
                    onClose={() => setOpenModalRegistrar(false)}
                />
            )}
        </>
    );
}
