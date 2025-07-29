import { useLaboratoriosContext } from "@/context";
import { useQuery } from "@/hooks/generic";
import { obtenerListaLaboratorios } from "@/services";
import { useEffect, useState } from "react";
import { ModalRegistrarLaboratorio, NavBar, TablaLaboratorios } from "./components";
import { SearchInput } from "@/components/search-input";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "react-router";
import { useDebounce } from "@/hooks";

export function Laboratorios() {
    const [searchParams, setSearchParams] = useSearchParams();
    const filtro = searchParams.get("buscar") ?? "";
    const filtroDebounced = useDebounce(filtro, 400);
    const { fetch: fetchLabs, data: labs, loading } = useQuery(obtenerListaLaboratorios);
    const { laboratorioAction } = useLaboratoriosContext();
    const [openModalRegistrar, setOpenModalRegistrar] = useState(false);

    useEffect(() => {
        fetchLabs();
    }, [laboratorioAction]);

    // El filtro actualiza el query param
    const onFiltroChange = (nuevoFiltro: string) => {
        setSearchParams(nuevoFiltro ? { buscar: nuevoFiltro } : {});
    };

    return (
        <>
            <NavBar />
            <div className="flex justify-between items-center mb-4">
                <SearchInput value={filtro} onChange={onFiltroChange} />
                <Button onClick={() => setOpenModalRegistrar(true)} className="cursor-pointer">
                    Nuevo laboratorio
                </Button>
            </div>
            <TablaLaboratorios loading={loading} laboratorios={labs ?? []} filter={filtroDebounced} />
            {openModalRegistrar && (
                <ModalRegistrarLaboratorio
                    open={openModalRegistrar}
                    onClose={() => setOpenModalRegistrar(false)}
                />
            )}
        </>
    );
}
