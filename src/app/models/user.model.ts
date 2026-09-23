// ============================================================
//  User
//  Modela un registro de la tabla `users` tal como lo DEVUELVE
//  la API.
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

// ============================================================
//  NewUser
//  Datos para CREAR un usuario (POST a register.php).
//  - No lleva `id` ni `created_at`: esos los genera la base de datos.
//  - SÍ lleva `password`: la contraseña solo viaja del cliente al
//    servidor, donde se guarda como hash. Nunca regresa en User.
// ============================================================
export interface NewUser {
  email: string;
  password: string;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  address?: string | null;
  twitter?: string | null;
  facebook?: string | null;
  gplus?: string | null;
}
