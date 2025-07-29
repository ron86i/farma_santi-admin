import { useSearchParams } from "react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui";
import { NavBar } from "./components/NavBar";
import { SearchInput } from "@/components";
import { TablaCompras } from "./components/TablaCompras";
import { useDebounce, useQuery } from "@/hooks";
import { obtenerListaCompras } from "@/services/compraService";
import { useComprasContext } from "@/context/compraContext";
import { ModalRegistrarOrdenCompra } from "./components/ModalRegistrarOrdenCompra";

export function Compras() {
    const [searchParams, setSearchParams] = useSearchParams();
    const filtro = searchParams.get("buscar") ?? "";
    const filtroDebounced = useDebounce(filtro, 400);
    const [openModalRegistrar, setOpenModalRegistrar] = useState(false);
    const { data: dataCompras, fetch: fetchCompras, loading } = useQuery(obtenerListaCompras);
    const { compraAction } = useComprasContext();

    useEffect(() => {
        fetchCompras();
    }, [compraAction]);

    // 🔄 cuando cambia el input, actualizamos el parámetro `buscar` en la URL
    const onFiltroChange = (nuevoFiltro: string) => {
        setSearchParams(nuevoFiltro ? { buscar: nuevoFiltro } : {});
    };

    return (
        <>
            <NavBar />
            <div className="flex justify-between items-center mb-4">
                <SearchInput value={filtro} onChange={onFiltroChange} />
                <Button onClick={() => setOpenModalRegistrar(true)} className="cursor-pointer">
                    Nueva compra
                </Button>
            </div>
            <TablaCompras loading={loading} list={dataCompras ?? []} filter={filtroDebounced} />
            {openModalRegistrar && (
                <ModalRegistrarOrdenCompra
                    open={openModalRegistrar}
                    onClose={() => setOpenModalRegistrar(false)}
                />
            )}
        </>
    );
}
