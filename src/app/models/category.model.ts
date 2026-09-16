// ============================================================
//  Category
//  Modela un registro de la tabla `categories`.
//  Los nombres coinciden con las columnas de la BD para que el
//  objeto que devuelve la API encaje directo en la interface.
// ============================================================
export interface Category {
  id: number;
  name: string;
  created_at: string;
}
