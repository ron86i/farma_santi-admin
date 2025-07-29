import { SearchInput } from "@/components";
import { NavBar, TablaRoles } from "./components";
import { Button } from "@/components/ui";
import { useEffect, useState } from "react";
import { useRolesContext } from "@/context/rolesContext";
import { ModalRegistrarRol } from "./components/ModalRegistrarRol";
import { useQuery } from "@/hooks/generic";
import { obtenerListaRoles } from "@/services";
import { useSearchParams } from "react-router";
import { useDebounce } from "@/hooks";

export function Roles() {
    const [openModalRegistrar, setOpenModalRegistrar] = useState(false);
    const { fetch: fetchRoles, data: roles, loading } = useQuery(obtenerListaRoles);
    const { rolAction } = useRolesContext();

    const [searchParams, setSearchParams] = useSearchParams();
    const filtro = searchParams.get("buscar") ?? "";
    const filtroDebounced = useDebounce(filtro, 400);
    useEffect(() => {
        fetchRoles();
    }, [rolAction]);

    const onFiltroChange = (nuevoFiltro: string) => {
        setSearchParams(nuevoFiltro ? { buscar: nuevoFiltro } : {});
    };

    return (
        <>
            <NavBar />
            <div className="flex justify-between items-center mb-4">
                <SearchInput value={filtro} onChange={onFiltroChange} />
                <Button onClick={() => setOpenModalRegistrar(true)} className="cursor-pointer">
                    Nuevo rol
                </Button>
            </div>
            <TablaRoles loading={loading} roles={roles ?? []} filter={filtroDebounced} />
            {openModalRegistrar && (
                <ModalRegistrarRol
                    open={openModalRegistrar}
                    onClose={() => setOpenModalRegistrar(false)}
                />
            )}
        </>
    );
}
