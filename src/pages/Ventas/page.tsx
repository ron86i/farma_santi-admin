import { NavBar } from "@/pages/Ventas/components/NavBar";
import { useEffect, useState } from "react";
import { SearchInput } from "@/components";
import { Button } from "@/components/ui";
import { useSearchParams } from "react-router";
import { ModalRegistrarVenta } from "./components/ModalRegistrarVenta";
import { useDebounce, useQuery } from "@/hooks";
import { obtenerListaVentas } from "@/services";
import { TablaVentas } from "./components/TablaVentas";
import { useVentasContext } from "@/context";

export function Ventas() {
    const [openModalRegistrar, setOpenModalRegistrar] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const { fetch: fetchVentas, data: dataVentas, loading } = useQuery(obtenerListaVentas)
    const filtro = searchParams.get("buscar") ?? "";
    const filtroDebounced = useDebounce(filtro, 400);
    const { ventaAction } = useVentasContext();

    const onFiltroChange = (nuevoFiltro: string) => {
        setSearchParams(nuevoFiltro ? { buscar: nuevoFiltro } : {});
    };
    useEffect(() => {
        const fetchData = async () => {
            await fetchVentas()
        }
        fetchData()
    }, [ventaAction])

    return (
        <>
            <NavBar />
            <div className="flex justify-between items-center mb-4">
                <SearchInput value={filtro} onChange={onFiltroChange} />
                <Button onClick={() => setOpenModalRegistrar(true)} className="cursor-pointer">
                    Nuevo venta
                </Button>
            </div>
            <TablaVentas loading={loading} list={dataVentas ?? []} filter={filtroDebounced} />
            {openModalRegistrar && (
                <ModalRegistrarVenta
                    open={openModalRegistrar}
                    onClose={() => setOpenModalRegistrar(false)}
                />
            )}
        </>
    );
}
