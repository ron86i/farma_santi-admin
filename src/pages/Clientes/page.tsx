import { useEffect, useState } from "react";
import { NavBar } from "./components/NavBar";
import { useSearchParams } from "react-router";
import { SearchInput } from "@/components";
import { Button } from "@/components/ui";
import { TablaClientes } from "./components/TablaClientes";
import { obtenerListaClientes } from "@/services/clienteService";
import { useDebounce, useQuery } from "@/hooks";
import { ModalRegistrarCliente } from "./components/ModalRegistrarCliente";
import { useClientesContext } from "@/context";

export function Clientes() {
    const [searchParams, setSearchParams] = useSearchParams();
    const filtro = searchParams.get("buscar") ?? "";
    const filtroDebounced = useDebounce(filtro, 400);
    const { fetch: fetchClientes, data: dataClientes, loading } = useQuery(obtenerListaClientes);
    // const { laboratorioAction } = useLaboratoriosContext();
    const { clienteAction } = useClientesContext()
    const [openModalRegistrar, setOpenModalRegistrar] = useState(false);

    useEffect(() => {
        fetchClientes();
    }, [clienteAction]);

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
                    Nuevo cliente
                </Button>
            </div>
            <TablaClientes loading={loading} list={dataClientes ?? []} filter={filtroDebounced} />
            {openModalRegistrar && (
                <ModalRegistrarCliente
                    open={openModalRegistrar}
                    onClose={() => setOpenModalRegistrar(false)}
                />
            )}
        </>

    )
}