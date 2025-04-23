import { useEffect, useState } from "react";
import { TablaUsuarios, NavBar } from "..";
import { UsuarioInfo } from "@/models/usuario";
import { obtenerListaUsuarios } from "@/services";
import { Search } from "@/components";
import { useUsuariosContext } from "@/context/usuarioContex";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ModalRegistrarUsuario } from ".."; // Asegúrate que esta importación es correcta

export function Usuarios() {
  const { usuarioAction } = useUsuariosContext();

  const [filtro, setFiltro] = useState("");
  const [usuarios, setUsuarios] = useState<UsuarioInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const usuarios = await obtenerListaUsuarios();
        setUsuarios(usuarios);
      } catch (error) {
        console.error("Error al obtener usuarios:", error);
      } finally {
        setLoading(false);
      }
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
      {modalOpen && <ModalRegistrarUsuario open={modalOpen} onClose={() => setModalOpen(false)} /> }

    </>
  );
}