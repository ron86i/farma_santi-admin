import logoFarmacia from "@/assets/logo_farmacia.png";
import { ModeToggle } from "@/components";
import { Input } from "@/components/ui";
import { Label } from "@/components/ui/label";
import { useLogin } from "@/hooks/useAuth";
import { useState } from "react";
import { useNavigate } from "react-router";

export function Login() {

  const navigate = useNavigate();
  const { login, loading, error: loginError} = useLogin();
  const [userRequest, setUserRequest] = useState({ username: "", password: "" });
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(userRequest)
        .then(() => {
          navigate("/main/dashboard");
          alert("Inicio de sesión exitoso");
        })
    } catch {
      alert(loginError)
    }
  };
  
  return (
    
    <section className="">
      <nav className="text-end absolute z-50 p-3 w-full">
        <ModeToggle/>
      </nav>
      <div className="flex flex-col items-center min-md:flex-row justify-center px-3 h-screen lg:py-0">

        <div className="shadow-2xl w-full md:h-7/12 h-min md:mt-0 max-w-md p-6 max-md:rounded-t-lg md:rounded-l-lg flex flex-col justify-center items-center border-0 dark:border-neutral-700  dark:border">
          <a className="flex items-center mb-6 text-2xl font-semibold text-neutral-950 dark:text-neutral-100 select-none">
            <img className="w-11 h-11" src={logoFarmacia} alt="logo" />
            <span className=" font-bold"> Farma Santi</span>

          </a>
        </div>

        <div className="flex flex-col justify-center items-center shadow-2xl w-full md:h-7/12 h-min max-md:rounded-b-lg md:rounded-r-lg max-w-md border-0 dark:border-neutral-700  dark:border bg-neutral-100 dark:bg-neutral-950">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8 w-full">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white select-none">
              Iniciar sesión
            </h1>
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6" >
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label className="block text-sm font-medium text-neutral-900 dark:text-neutral-50 select-none p-1">Usuario</Label>
                <Input
                  value={userRequest.username}
                  onChange={(e) => setUserRequest({ ...userRequest, username: e.target.value })}
                  type="text"
                  placeholder="Nombre de usuario"
                />
              </div>

              <div>
                <Label className="block text-sm font-medium text-neutral-950 dark:text-neutral-50 select-none p-1">Contraseña</Label>
                <Input
                  type="password"
                  value={userRequest.password}
                  onChange={(e) => setUserRequest({ ...userRequest, password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
              <div className="flex justify-center items-center">
                <button
                  type="submit"
                  disabled={loading}
                  className="hover:scale-105 transition select-none shadow cursor-pointer font-medium p-2 dark:text-neutral-950 text-neutral-200 dark:bg-neutral-50 bg-neutral-900 rounded-md">
                  {loading ? "Cargando..." : "Ingresar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
