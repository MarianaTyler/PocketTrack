// ============================================================
//  User
//  Modela un registro de la tabla `users`.
//  Nota: `password_hash` NUNCA viaja al cliente, por eso no
//  aparece en esta interface.
// ============================================================
export interface User {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  address: string | null;
  twitter: string | null;
  facebook: string | null;
  gplus: string | null;
  created_at: string;
}
