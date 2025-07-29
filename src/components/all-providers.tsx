import { ThemeProvider } from "./theme-provider";

// Contextos de usuario y roles
import { RolesProvider } from "@/context/rolesContext";
import { UsuariosProvider } from "@/context/usuarioContex";
import { UsuarioDetailProvider } from "@/context/usuarioDetailContext";

// Contextos de catálogo
import {
    CategoriasProvider,
    LaboratoriosProvider,
    PrincipiosActivosProvider,
    ProductosProvider,
    LoteProductosProvider,
    ClientesProvider,
    ComprasProvider,
    ProveedoresProvider,
    VentasProvider,
} from "@/context";




interface AllProvidersProps {
    children: React.ReactNode;
}

export function AllProviders({ children }: AllProvidersProps) {
    return (
        <ThemeProvider>
            <RolesProvider>
                <UsuariosProvider>
                    <UsuarioDetailProvider>

                        {/* Catálogos */}
                        <CategoriasProvider>
                            <LaboratoriosProvider>
                                <PrincipiosActivosProvider>
                                    <ProductosProvider>
                                        <LoteProductosProvider>

                                            {/* Operaciones */}
                                            <ProveedoresProvider>
                                                <ClientesProvider>
                                                    <ComprasProvider>
                                                        <VentasProvider>
                                                            {children}
                                                        </VentasProvider>
                                                    </ComprasProvider>
                                                </ClientesProvider>
                                            </ProveedoresProvider>

                                        </LoteProductosProvider>
                                    </ProductosProvider>
                                </PrincipiosActivosProvider>
                            </LaboratoriosProvider>
                        </CategoriasProvider>

                    </UsuarioDetailProvider>
                </UsuariosProvider>
            </RolesProvider>
        </ThemeProvider>
    );
}
