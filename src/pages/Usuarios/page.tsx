import { useEffect, useState } from "react";
import { TablaUsuarios, NavBar, ModalRegistrarUsuario } from "./components";
import { Search } from "@/components";
import { useUsuariosContext } from "@/context/usuariosContex";
import { Button } from "@/components/ui/button";
import { useObtenerListaUsuarios } from "@/hooks/useUsuario";

export function Usuarios() {
  const { usuarioAction } = useUsuariosContext();
  const [filtro, setFiltro] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const { fetchObtenerUsuarios, usuarios, loading } = useObtenerListaUsuarios()
  useEffect(() => {
    async function fetchData() {
      await fetchObtenerUsuarios();
    }

    fetchData();
  }, [usuarioAction]);

  return (
    <>
      <NavBar />
      <div className=" flex justify-between items-center mb-4">
        <Search value={filtro} onChange={setFiltro} />
        <Button onClick={() => setModalOpen(true)} className="cursor-pointer">Nuevo usuario</Button>
      </div>
      <TablaUsuarios users={usuarios} loading={loading} filter={filtro} />
      {modalOpen && <ModalRegistrarUsuario open={modalOpen} onClose={() => setModalOpen(false)} />}

    </>
  );
}