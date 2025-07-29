import { obtenerListaProductos } from "@/services/productoService";
import { NavBar } from "@/pages/Productos/components/NavBar";
import { useDebounce, useQuery } from "@/hooks";
import { useEffect, useState } from "react";
import { useProductosContext } from "@/context/productoContext";
import { TablaProductos } from "@/pages/Productos/components/TablaProductos";
import { SearchInput } from "@/components";
import { Button } from "@/components/ui";
import { ModalRegistrarProducto } from "@/pages/Productos/components/ModalRegistrarProducto";
import { useSearchParams } from "react-router";

export function Productos() {
    const { fetch: fetchProductos, data: productos, loading } = useQuery(obtenerListaProductos);
    const { productoAction } = useProductosContext();
    const [openModalRegistrar, setOpenModalRegistrar] = useState(false);

    const [searchParams, setSearchParams] = useSearchParams();
    const filtro = searchParams.get("buscar") ?? "";
    const filtroDebounced = useDebounce(filtro, 400);
    useEffect(() => {
        fetchProductos();
    }, [productoAction]);

    const onFiltroChange = (nuevoFiltro: string) => {
        setSearchParams(nuevoFiltro ? { buscar: nuevoFiltro } : {});
    };

    return (
        <>
            <NavBar />
            <div className="flex justify-between items-center mb-4">
                <SearchInput value={filtro} onChange={onFiltroChange} />
                <Button onClick={() => setOpenModalRegistrar(true)} className="cursor-pointer">
                    Nuevo producto
                </Button>
            </div>
            <TablaProductos loading={loading} productos={productos ?? []} filter={filtroDebounced} />
            {openModalRegistrar && (
                <ModalRegistrarProducto
                    open={openModalRegistrar}
                    onClose={() => setOpenModalRegistrar(false)}
                />
            )}
        </>
    );
}
