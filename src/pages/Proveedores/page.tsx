import { useEffect, useState } from "react";
import { NavBar } from "./components/NavBar";
import { useProveedoresContext } from "@/context";
import { TablaProveedores } from "./components";
import { SearchInput } from "@/components";
import { Button } from "@/components/ui/button";
import { ModalRegistrarProveedor } from "./components/ModalRegistrarProveedor";
import { useQuery } from "@/hooks/generic";
import { obtenerListaProveedores } from "@/services";
import { useSearchParams } from "react-router";
import { useDebounce } from "@/hooks";

export function Proveedores() {
    const [searchParams, setSearchParams] = useSearchParams();
    const filtro = searchParams.get("buscar") ?? "";
    const filtroDebounced = useDebounce(filtro, 400);
    const [openModalRegistrar, setOpenModalRegistrar] = useState(false);
    const { fetch, data, loading } = useQuery(obtenerListaProveedores);
    const { proveedorAction } = useProveedoresContext();

    useEffect(() => {
        fetch();
    }, [proveedorAction]);

    const onFiltroChange = (nuevoFiltro: string) => {
        setSearchParams(nuevoFiltro ? { buscar: nuevoFiltro } : {});
    };

    return (
        <>
            <NavBar />
            <div className="flex justify-between items-center mb-4">
                <SearchInput value={filtro} onChange={onFiltroChange} />
                <Button onClick={() => setOpenModalRegistrar(true)} className="cursor-pointer">
                    Nuevo proveedor
                </Button>
            </div>
            <TablaProveedores list={data ?? []} loading={loading} filter={filtroDebounced} />
            {openModalRegistrar && (
                <ModalRegistrarProveedor
                    open={openModalRegistrar}
                    onClose={() => setOpenModalRegistrar(false)}
                />
            )}
        </>
    );
}
