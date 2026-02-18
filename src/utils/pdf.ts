import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { UsuarioDetail } from "@/models";

export function generarPDFUsuario(usuario: UsuarioDetail): void {
  const doc = new jsPDF();
  
  const primary: [number, number, number] = [30, 30, 30];
  const secondary: [number, number, number] = [100, 100, 100];
  const border: [number, number, number] = [230, 230, 230];
  
  let yPosition = 30;

  // ========== TÍTULO ==========
  doc.setTextColor(...primary);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Detalle del Usuario", 20, yPosition);
  
  yPosition += 15;

  // ========== SECCIÓN: INFORMACIÓN DEL USUARIO ==========
  const infoUsuario: string[][] = [
    ["Usuario", usuario.username],
    ["Estado", usuario.estado],
    ["Registrado", new Date(usuario.createdAt).toLocaleDateString("es-ES")],
  ];

  autoTable(doc, {
    startY: yPosition,
    body: infoUsuario,
    theme: "plain",
    styles: {
      fontSize: 11,
      cellPadding: { top: 5, bottom: 5, left: 0, right: 10 },
      textColor: primary,
      lineColor: border,
      lineWidth: { bottom: 0.3 },
    },
    columnStyles: {
      0: { 
        fontStyle: "normal",
        cellWidth: 50,
        textColor: secondary,
      },
      1: { 
        fontStyle: "normal",
        cellWidth: 120,
      },
    },
    didParseCell: (data) => {
      // Línea solo debajo de cada fila
      if (data.section === 'body') {
        data.cell.styles.lineWidth = { bottom: 0.3, top: 0, left: 0, right: 0 };
      }
    },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // ========== SECCIÓN: DATOS PERSONALES ==========
  const personaData: string[][] = Object.entries(usuario.persona)
    .filter(([key]) => key !== "id")
    .map(([key, value]) => [
      formatearCampoPersona(key),
      value?.toString() || "—",
    ]);

  if (personaData.length > 0) {
    autoTable(doc, {
      startY: yPosition,
      body: personaData,
      theme: "plain",
      styles: {
        fontSize: 11,
        cellPadding: { top: 5, bottom: 5, left: 0, right: 10 },
        textColor: primary,
        lineColor: border,
        lineWidth: { bottom: 0.3 },
      },
      columnStyles: {
        0: { 
          cellWidth: 50,
          textColor: secondary,
        },
        1: { 
          cellWidth: 120,
        },
      },
      didParseCell: (data) => {
        if (data.section === 'body') {
          data.cell.styles.lineWidth = { bottom: 0.3, top: 0, left: 0, right: 0 };
        }
      },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // ========== SECCIÓN: ROLES ==========
  if (usuario.roles.length > 0) {
    doc.setFontSize(11);
    doc.setTextColor(...secondary);
    doc.text("Roles", 20, yPosition);
    
    yPosition += 2;
    
    // Línea debajo del label
    doc.setDrawColor(...border);
    doc.setLineWidth(0.3);
    doc.line(20, yPosition, 190, yPosition);
    
    yPosition += 8;

    doc.setFontSize(11);
    doc.setTextColor(...primary);
    usuario.roles.forEach((rol) => {
      doc.text(rol.nombre, 20, yPosition);
      yPosition += 7;
    });
  }

  // ========== PIE DE PÁGINA ==========
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(9);
  doc.setTextColor(...secondary);
  doc.text(
    `Generado el ${new Date().toLocaleDateString("es-ES", { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}`,
    20,
    pageHeight - 15
  );

  // Guardar
  doc.save(`usuario_${usuario.username}.pdf`);
}

function formatearCampoPersona(campo: string): string {
  const campos: Record<string, string> = {
    ci: "CI",
    complemento: "Complemento",
    nombres: "Nombres",
    apellidoPaterno: "Apellido Paterno",
    apellidoMaterno: "Apellido Materno",
    genero: "Género",
    telefono: "Teléfono",
    email: "Email",
    direccion: "Dirección",
    fechaNacimiento: "Fecha de Nacimiento",
  };
  
  return campos[campo] || campo;
}