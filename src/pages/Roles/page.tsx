import { Search } from "@/components";
import { NavBar, TablaRoles } from "./components";
import { Button } from "@/components/ui";
import { useEffect, useState } from "react";
import { useObtenerRoles } from "@/hooks";
import { useRolesContext } from "@/context/rolesContext";
import { ModalRegistrarRol } from "./components/ModalRegistrarRol";

export function Roles() {
    const [openModalRegistrar, setOpenModalRegistrar] = useState(false);
    const [filtro, setFiltro] = useState("");
    const { fetchRoles, roles, loading } = useObtenerRoles()
    const { rolAction } = useRolesContext()

    useEffect(() => {
        async function fetchData() {
            await fetchRoles()
        }
        fetchData()
    }, [rolAction])
    return (
        <>
            <NavBar />
            <div className=" flex justify-between items-center mb-4">
                <Search value={filtro} onChange={setFiltro} />
                <Button onClick={() => setOpenModalRegistrar(true)} className="cursor-pointer">Nuevo rol</Button>
            </div>
            <TablaRoles loading={loading} roles={roles} filter={filtro}/>
            {openModalRegistrar &&
                <ModalRegistrarRol open={openModalRegistrar} onClose={() => { setOpenModalRegistrar(false) }} />}
        </>
    )
}