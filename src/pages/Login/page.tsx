import logoFarmacia from "@/assets/Logo1.png";
import { ModeToggle } from "@/components";
import { Button, Input } from "@/components/ui";
import { Label } from "@/components/ui/label";
import { useLogin } from "@/hooks/useAuth";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner"
import dateFormat from "dateformat";
import { CustomToast } from "@/components/toast";
import { Eye, EyeOff, Lock, User } from "lucide-react";

export function Login() {
  const navigate = useNavigate();
  const { mutate, loading } = useLogin();
  const [userRequest, setUserRequest] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await mutate(userRequest)
      toast.custom((t) => (
        <CustomToast
          t={t}
          type="success"
          title="Inicio de sesión exitoso"
          message={response?.message || "Bienvenido"}
          date={dateFormat(Date.now())}
        />
      ));
      navigate("/main/dashboard");
    } catch (err: any) {
      console.log(err);
      toast.dismiss();
      const errorMsg = err?.message || "Error al iniciar sesión";

      toast.custom((t) => (
        <CustomToast
          t={t}
          type="error"
          title="Error"
          message={errorMsg}
          date={dateFormat(Date.now())}
        />
      ));
    }
  };

  return (
    <section className="relative min-h-screen">
      <nav className="text-end absolute z-50 p-3 w-full">
        <ModeToggle />
      </nav>
      
      <div className="flex flex-col items-center min-md:flex-row justify-center px-3 min-h-screen lg:py-0 bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
        
        {/* Panel izquierdo - Logo */}
        <div className="shadow-2xl w-full md:min-h-[500px] h-min md:mt-0 max-w-md p-8 max-md:rounded-t-2xl md:rounded-l-2xl flex flex-col justify-center items-center border-0 dark:border-neutral-700 bg-white dark:bg-neutral-900 dark:border backdrop-blur-sm">
          <a className="flex items-center mb-6 text-2xl font-semibold text-neutral-950 dark:text-neutral-100 select-none">
            <img className="w-full hover:scale-105 transition-transform duration-300" src={logoFarmacia} alt="logo" />
          </a>
          <div className="text-center space-y-2 mt-4">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              Bienvenido
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Sistema de gestión farmacéutica
            </p>
          </div>
        </div>

        {/* Panel derecho - Formulario */}
        <div className="flex flex-col justify-center items-center shadow-2xl w-full md:min-h-[500px] h-min max-md:rounded-b-2xl md:rounded-r-2xl max-w-md border-0 dark:border-neutral-700 dark:border bg-white dark:bg-neutral-900 backdrop-blur-sm">
          <div className="p-8 space-y-6 w-full">
            <div>
              <h1 className="text-2xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white select-none">
                Iniciar sesión
              </h1>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
                Ingresa tus credenciales para continuar
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Campo Usuario */}
              <div className="grid w-full items-center gap-2">
                <Label className="block text-sm font-medium text-neutral-900 dark:text-neutral-50 select-none">
                  Usuario
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                  <Input
                    value={userRequest.username}
                    onChange={(e) => setUserRequest({ ...userRequest, username: e.target.value })}
                    type="text"
                    placeholder="Nombre de usuario"
                    className="pl-10 h-11 transition-all duration-200 focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-600"
                  />
                </div>
              </div>

              {/* Campo Contraseña */}
              <div className="grid w-full items-center gap-2">
                <Label className="block text-sm font-medium text-neutral-950 dark:text-neutral-50 select-none">
                  Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={userRequest.password}
                    onChange={(e) => setUserRequest({ ...userRequest, password: e.target.value })}
                    placeholder="••••••••"
                    className="pl-10 pr-10 h-11 transition-all duration-200 focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Botón de envío */}
              <div className="flex justify-center items-center pt-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 select-none shadow-lg cursor-pointer font-semibold text-neutral-100 dark:text-neutral-950 bg-neutral-900 dark:bg-neutral-50 rounded-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Cargando...
                    </span>
                  ) : (
                    "Ingresar"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}