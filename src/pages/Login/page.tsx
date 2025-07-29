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
export function Login() {

  const navigate = useNavigate();
  const { mutate, loading } = useLogin();
  const [userRequest, setUserRequest] = useState({ username: "", password: "" });
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
    <section className="">
      <nav className="text-end absolute z-50 p-3 w-full">
        <ModeToggle />
      </nav>
      <div className="flex flex-col items-center min-md:flex-row justify-center px-3 h-screen lg:py-0 dark:bg-neutral-900">

        <div className="shadow-2xl w-full md:h-7/12 h-min md:mt-0 max-w-md p-6 max-md:rounded-t-lg md:rounded-l-lg flex flex-col justify-center items-center border-0 dark:border-neutral-700 dark:bg-neutral-900  dark:border">
          <a className="flex items-center mb-6 text-2xl font-semibold text-neutral-950 dark:text-neutral-100 select-none">
            <img className="w-full" src={logoFarmacia} alt="logo" />
            <span className=" font-bold"></span>
          </a>
        </div>

        <div className="flex flex-col justify-center items-center shadow-2xl w-full md:h-7/12 h-min max-md:rounded-b-lg md:rounded-r-lg max-w-md border-0 dark:border-neutral-700  dark:border bg-neutral-100 dark:bg-neutral-900">
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
                <Button
                  type="submit"
                  disabled={loading}
                  className="hover:scale-105 transition select-none shadow cursor-pointer font-medium p-2 dark:text-neutral-950 text-neutral-200 dark:bg-neutral-50 bg-neutral-900 rounded-md">
                  {loading ? "Cargando..." : "Ingresar"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

    </section>
  );
}
