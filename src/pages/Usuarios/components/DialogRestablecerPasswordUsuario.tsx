import { useState } from "react";
import { CustomToast } from "@/components/toast";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input"; // Importar Input
import { Label } from "@/components/ui/label"; // Importar Label
import { Button } from "@/components/ui/button"; // Importar Button
import { Eye, EyeOff, RefreshCcw } from "lucide-react"; // Importar iconos
import { useUsuariosContext } from "@/context/usuarioContex";
import { useRestablecerPasswordUsuarioById } from "@/hooks";
import { UsuarioResetPassword } from "@/models";
import { generarPDFUsuario } from "@/utils/pdf";
import dateFormat from "dateformat";
import { toast } from "sonner";

interface DialogRestablecerPasswordUsuarioProps {
    usuarioId: number;
    username: string;
    open: boolean;
    onClose?: () => void;
}

// --- Función de utilidad para generar contraseñas ---
// (Puedes moverla a tu archivo de utils si prefieres)
const generateStrongPassword = (length = 12) => {
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const digits = "0123456789";
    const symbols = "!@#$%^&*()_+~`|}{[]:;?><,./-=";
    const all = lower + upper + digits + symbols;

    let password = "";
    // Asegurar al menos uno de cada tipo
    password += lower[Math.floor(Math.random() * lower.length)];
    password += upper[Math.floor(Math.random() * upper.length)];
    password += digits[Math.floor(Math.random() * digits.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];

    // Rellenar el resto de la longitud
    for (let i = 4; i < length; i++) {
        password += all[Math.floor(Math.random() * all.length)];
    }

    // Mezclar la contraseña para que los primeros 4 no sean predecibles
    return password.split('').sort(() => 0.5 - Math.random()).join('');
};
// ----------------------------------------------------


export function DialogRestablecerPasswordUsuario({
    usuarioId,
    username,
    open,
    onClose
}: DialogRestablecerPasswordUsuarioProps) {
    const { mutate: restablecer, error, data, loading } = useRestablecerPasswordUsuarioById();
    const { usuarioAction, setUsuarioAction } = useUsuariosContext();

    // --- Estados para la nueva contraseña ---
    const [newPassword, setNewPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    // ------------------------------------------

    const handleGeneratePassword = () => {
        setNewPassword(generateStrongPassword());
    };

    const onSubmit = async () => {
        // Validar que la contraseña no esté vacía
        if (newPassword.trim() === "") {
            toast.custom((t) => (
                <CustomToast
                    t={t}
                    type="error"
                    title="Error de validación"
                    message="La contraseña no puede estar vacía."
                    date={dateFormat(Date.now())}
                />
            ));
            return;
        }

        // Usar la contraseña del estado
        const resetPassword: UsuarioResetPassword = { newPassword: newPassword };

        try {
            const response = await restablecer(usuarioId, resetPassword);
            toast.custom((t) => (
                <CustomToast
                    t={t}
                    type="success"
                    title="Contraseña restablecida"
                    message={response?.message || "Error en el servidor"}
                    date={dateFormat(Date.now())}
                />
            ));
            if (response?.data) {
                generarPDFUsuario(response.data);
            }

            setUsuarioAction(!usuarioAction);
            setNewPassword(""); // Limpiar el campo
            if (onClose) onClose();
        } catch (err: any) {
            toast.custom((t) => (
                <CustomToast
                    t={t}
                    type="error"
                    title="Error al restablecer contraseña"
                    message={err?.response?.message || err?.message || "Error en el servidor"}
                    date={dateFormat(Date.now())}
                />
            ));
        }
    };

    // Manejar el cierre del diálogo para limpiar el estado
    const handleClose = () => {
        setNewPassword(""); // Limpiar contraseña al cerrar
        setShowPassword(false); // Ocultar
        if (onClose) onClose();
    }


    return (
        <AlertDialog open={open} onOpenChange={(estado) => !estado && handleClose()}>
            <AlertDialogContent className="w-full max-w-md sm:max-w-lg md:max-w-xl">
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Restablecer contraseña de {username}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Ingresa una nueva contraseña manualmente o genera una aleatoria.
                        El usuario <strong>{username}</strong> podrá ingresar con esta nueva contraseña.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                {/* --- Formulario para la nueva contraseña --- */}
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-1 items-center gap-2">
                        <Label htmlFor="new-password">Nueva Contraseña</Label>
                        <div className="flex w-full items-center space-x-2">
                            <Input
                                id="new-password"
                                autoComplete="new-password"
                                type={showPassword ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="flex-1"
                                placeholder="Escribe o genera una contraseña"
                            />
                            {/* Botón para ver/ocultar */}
                            <Button variant="ghost" size="icon" type="button" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                <span className="sr-only">{showPassword ? "Ocultar" : "Mostrar"} contraseña</span>
                            </Button>
                            {/* Botón para generar */}
                            <Button variant="outline" size="icon" type="button" onClick={handleGeneratePassword}>
                                <RefreshCcw className="h-4 w-4" />
                                <span className="sr-only">Generar contraseña</span>
                            </Button>
                        </div>
                    </div>
                </div>

                {error && (
                    <p className="mt-2 text-sm text-red-500">
                        Ocurrió un error: {error}
                    </p>
                )}
                {data?.message && (
                    <p className="mt-2 text-sm text-green-600">
                        {data.message}
                    </p>
                )}

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading} onClick={handleClose}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onSubmit}
                        // Deshabilitar si está cargando o si el campo está vacío
                        disabled={loading || newPassword.trim() === ""}
                    >
                        {loading ? "Restableciendo..." : "Restablecer"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}