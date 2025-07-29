import { i18n } from "dateformat";

export function customDateFormat() {
  // Personalización del formato de fechas
  i18n.dayNames = [
    "Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb",
    "Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"
  ];

  i18n.monthNames = [
    "Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  i18n.timeNames = ["a", "p", "a. m.", "p. m.", "A", "P", "A. M.", "P. M."];
}
 