import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { UsuariosProvider } from './context/usuariosContex.tsx';
import { ThemeProvider } from './components/theme-provider.tsx';
import { RolesProvider } from './context/rolesContext.tsx';
createRoot(document.getElementById('root')!).render(
    <RolesProvider>
        <UsuariosProvider>
            <ThemeProvider>
                <App />
            </ThemeProvider>
        </UsuariosProvider>
    </RolesProvider>
);
