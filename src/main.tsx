import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { UsuarioProvider } from './context/usuarioContex.tsx';
import { ThemeProvider } from './components/theme-provider.tsx';
createRoot(document.getElementById('root')!).render(

    <UsuarioProvider>
        <ThemeProvider>
            <App />
        </ThemeProvider>
    </UsuarioProvider>
);
