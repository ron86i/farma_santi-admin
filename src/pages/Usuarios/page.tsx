import { useEffect, useState } from "react";
import { TablaUsuarios, NavBar, ModalRegistrarUsuario } from "./components";
import { SearchInput } from "@/components";
import { useUsuariosContext } from "@/context/usuarioContex";
import { Button } from "@/components/ui/button";
import { useQuery } from "@/hooks/generic";
import { obtenerListaUsuarios } from "@/services";
import { useSearchParams } from "react-router";
import { useDebounce } from "@/hooks";

export function Usuarios() {
  const { usuarioAction } = useUsuariosContext();
  const { fetch, data: usuarios, loading } = useQuery(obtenerListaUsuarios);

  const [searchParams, setSearchParams] = useSearchParams();
  const filtro = searchParams.get("buscar") ?? "";
  const filtroDebounced = useDebounce(filtro, 400);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetch();
  }, [usuarioAction]);

  const onFiltroChange = (nuevoFiltro: string) => {
    setSearchParams(nuevoFiltro ? { buscar: nuevoFiltro } : {});
  };

  return (
    <>
      <NavBar />
      <div className="flex justify-between items-center mb-4">
        <SearchInput value={filtro} onChange={onFiltroChange} />
        <Button onClick={() => setModalOpen(true)} className="cursor-pointer">
          Nuevo usuario
        </Button>
      </div>
      <TablaUsuarios users={usuarios ?? []} loading={loading} filter={filtroDebounced} />
      {modalOpen && (
        <ModalRegistrarUsuario
          open={modalOpen}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}
