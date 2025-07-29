import { NavBar } from "./components/NavBar";
import { useEffect, useState } from "react";
import { SearchInput } from "@/components";
import { Button } from "@/components/ui";
import { obtenerListaPrincipiosActivos } from "@/services";
import { useDebounce, useQuery } from "@/hooks";
import { TablaPrincipiosActivos } from "./components/TablaPrincipiosActivos";
import { usePrincipiosActivosContext } from "@/context/principioActivoContext";
import { ModalRegistrarPrincipioActivo } from "./components/ModalRegistrarPrincipioActivo";
import { useSearchParams } from "react-router";

export function PrincipiosActivos() {
    const { fetch: fetchPA, data: list, loading } = useQuery(obtenerListaPrincipiosActivos);
    const { principioActivoAction } = usePrincipiosActivosContext();
    const [openModalRegistrar, setOpenModalRegistrar] = useState(false);

    const [searchParams, setSearchParams] = useSearchParams();
    const filtro = searchParams.get("buscar") ?? "";
    const filtroDebounced = useDebounce(filtro, 400);
    useEffect(() => {
        fetchPA();
    }, [principioActivoAction]);

    const onFiltroChange = (nuevo: string) => {
        setSearchParams(nuevo ? { buscar: nuevo } : {});
    };

    return (
        <>
            <NavBar />
            <div className="flex justify-between items-center mb-4">
                <SearchInput value={filtro} onChange={onFiltroChange} />
                <Button onClick={() => setOpenModalRegistrar(true)} className="cursor-pointer">
                    Nuevo principio activo
                </Button>
            </div>
            <TablaPrincipiosActivos loading={loading} list={list ?? []} filter={filtroDebounced} />
            {openModalRegistrar && (
                <ModalRegistrarPrincipioActivo
                    open={openModalRegistrar}
                    onClose={() => setOpenModalRegistrar(false)}
                />
            )}
        </>
    );
}
