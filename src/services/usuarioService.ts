import { MessageDataResponse, MessageResponse, UsuarioDetail, UsuarioInfo, UsuarioRequest } from "@/models";
import apiClient, { parseAxiosError } from './axiosClient';

// Obtener lista de usuarios
export async function obtenerListaUsuarios(): Promise<UsuarioInfo[]> {
    try {
        const response = await apiClient.get('/usuarios');
        return response.data as UsuarioInfo[];
    } catch (err) {
        throw parseAxiosError(err, "Error al listar usuarios");
    }
};

// Registrar usuario
export async function registrarUsuario(usuarioRequest: UsuarioRequest): Promise<MessageDataResponse<UsuarioDetail>> {
    try {
        const response = await apiClient.post('/usuarios', usuarioRequest);
        return response.data as MessageDataResponse<UsuarioDetail>;
    } catch (err) {
        throw parseAxiosError(err, "Error al registrar usuario");
    }
};

// Modificar usuario
export async function modificarUsuario(usuarioId: number, usuarioRequest: UsuarioRequest): Promise<MessageResponse> {
    try {
        const response = await apiClient.put(`/usuarios/${usuarioId}`, usuarioRequest);
        return response.data as MessageResponse;
    } catch (err) {
        throw parseAxiosError(err, "Error al modificar usuario");
    }
};

// Obtener usuario por id
export async function obtenerUsuarioById(usuarioId: number): Promise<UsuarioDetail> {
    try {
        const response = await apiClient.get(`/usuarios/${usuarioId}`);
        return response.data as UsuarioDetail;
    } catch (err) {
        throw parseAxiosError(err, "Error al obtener usuario");
    }
};

// Habilitar usuario por id
export async function habilitarUsuarioById(usuarioId: number): Promise<MessageResponse> {
    try {
        const response = await apiClient.patch(`/usuarios/estado/habilitar/${usuarioId}`);
        return response.data as MessageResponse;
    } catch (err) {
        throw parseAxiosError(err, "Error al habilitar usuario");
    }
}

// Deshabilitar usuario por id
export async function deshabilitarUsuarioById(usuarioId: number): Promise<MessageResponse> {
    try {
        const response = await apiClient.patch(`/usuarios/estado/deshabilitar/${usuarioId}`);
        return response.data as MessageResponse;
    } catch (err) {
        throw parseAxiosError(err, "Error al deshabilitar usuario");
    }
}

//Obtener información actual del usuario
export async function obtenerMiUsuario(): Promise<UsuarioDetail> {
    try {
        const response = await apiClient.get(`/usuarios/me`);
        return response.data as UsuarioDetail;
    } catch (err) {
        throw parseAxiosError(err, "Error al obtener información del usuario");
    }

}
//Restablecer password por id de usuario
export async function restablecerPasswordById(usuarioId: number): Promise<MessageDataResponse<UsuarioDetail>> {
    try {
        const response = await apiClient.patch(`/usuarios/password/restablecer/${usuarioId}`);
        return response.data as MessageDataResponse<UsuarioDetail>;
    } catch (err) {
        throw parseAxiosError(err, "Error al restablecer contraseña");
    }
};