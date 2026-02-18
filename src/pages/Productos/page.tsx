import { obtenerListaProductos } from "@/services/productoService";
import { NavBar } from "@/pages/Productos/components/NavBar";
import { useDebounce, useQuery } from "@/hooks";
import { useEffect, useState } from "react";
import { useProductosContext } from "@/context/productoContext";
import { TablaProductos } from "@/pages/Productos/components/TablaProductos";
import { SearchInput } from "@/components";
import { Button } from "@/components/ui";
import { ModalRegistrarProducto } from "@/pages/Productos/components/ModalRegistrarProducto";
import { useSearchParams } from "react-router";
import { Plus } from "lucide-react";

export function Productos() {
    const { fetch: fetchProductos, data: productos, loading } = useQuery(obtenerListaProductos);
    const { productoAction } = useProductosContext();
    const [openModalRegistrar, setOpenModalRegistrar] = useState(false);

    const [searchParams, setSearchParams] = useSearchParams();
    const filtro = searchParams.get("buscar") ?? "";
    const filtroDebounced = useDebounce(filtro, 400);
    
    useEffect(() => {
        fetchProductos();
    }, [productoAction]);

    const onFiltroChange = (nuevoFiltro: string) => {
        setSearchParams(nuevoFiltro ? { buscar: nuevoFiltro } : {});
    };

    return (
        <div className="h-full flex flex-col overflow-hidden">
            <NavBar />
            
            {/* Barra de búsqueda y botón */}
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center mb-4 px-1">
                <div className="flex-1 max-w-md">
                    <SearchInput value={filtro} onChange={onFiltroChange} />
                </div>
                <Button 
                    onClick={() => setOpenModalRegistrar(true)} 
                    className="cursor-pointer whitespace-nowrap flex items-center gap-2"
                >
                    <Plus className="size-4" />
                    <span className="hidden sm:inline">Nuevo producto</span>
                    <span className="sm:hidden">Nuevo</span>
                </Button>
            </div>

            {/* Contenedor de tabla con scroll */}
            <div className="flex-1 overflow-auto">
                <TablaProductos 
                    loading={loading} 
                    productos={productos ?? []} 
                    filter={filtroDebounced} 
                />
            </div>

            {openModalRegistrar && (
                <ModalRegistrarProducto
                    open={openModalRegistrar}
                    onClose={() => setOpenModalRegistrar(false)}
                />
            )}
        </div>
    );
}