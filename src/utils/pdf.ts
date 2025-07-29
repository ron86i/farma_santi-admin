import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { UsuarioDetail } from "@/models"; // Asegúrate que UsuarioDetail esté tipado correctamente

export function generarPDFUsuario(usuario: UsuarioDetail) {
  const doc = new jsPDF();

  // Título principal
  doc.setFontSize(16);
  doc.text("Detalle del Usuario", 14, 20);

  // Información del usuario
  doc.setFontSize(12);
  doc.text(`Usuario: ${usuario.username}`, 14, 30);
  doc.text(`Contraseña: ${usuario.password}`, 14, 38);
  doc.text(`Estado: ${usuario.estado}`, 14, 46);
  doc.text(`Fecha de registro: ${new Date(usuario.createdAt).toLocaleString()}`, 14, 54);
  doc.text(`Actualizado: ${new Date(usuario.updatedAt).toLocaleString()}`, 14, 62);
  // if (usuario.deletedAt) {
  //   doc.text(`Eliminado: ${new Date(usuario.deletedAt).toLocaleString()}`, 14, 70);
  // }

  // Información de la persona
  const persona = usuario.persona;
  doc.setFontSize(14);
  doc.text("Información de la Persona", 14, 82);
  doc.setFontSize(12);

  let y = 90;
  Object.entries(persona).forEach(([key, value]) => {
    if (key === "id") return; // Oculta el ID de la persona
    doc.text(`${formatearCampoPersona(key)}: ${value}`, 14, y);
    y += 8;
  });

  // Tabla de roles sin ID
  doc.setFontSize(14);
  doc.text("Roles", 14, y + 10);

  const roles = usuario.roles.map((r, index) => [
    index + 1,
    r.nombre
  ]);

  autoTable(doc, {
    startY: y + 16,
    head: [["#", "Nombre"]],
    body: roles,
    theme: "striped",
    styles: { fontSize: 10 },
  });

  doc.save(`usuario_${usuario.username}.pdf`);
}

// Opcional: Formateador de claves para "persona"
function formatearCampoPersona(campo: string): string {
  const camposBonitos: Record<string, string> = {
    nombres: "Nombres",
    apellidos: "Apellidos",
    ci: "CI",
    telefono: "Teléfono",
    email: "Correo electrónico",
    direccion: "Dirección",
    // agrega más si los tienes
  };
  return camposBonitos[campo] || campo.charAt(0).toUpperCase() + campo.slice(1);
}
