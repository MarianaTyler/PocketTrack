// ============================================================
//  ApiResponse<T>
//  Envoltura genérica de las respuestas JSON de la API PHP.
//  Todas siguen la forma { ok, ... }.
//    T  = tipo del dato que viaja en `data`
//         (un Expense, un Expense[], etc.)
// ============================================================
export interface ApiResponse<T = unknown> {
  ok: boolean;
  message?: string;
  error?: string;
  data?: T;
}
