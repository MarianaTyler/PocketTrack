# PocketTracker

Aplicación móvil para registrar y organizar **gastos personales**, construida con **Ionic + Angular (NgModules)** y una **API en PHP** con base de datos **MySQL/MariaDB**. Funciona con persistencia local (offline-first) y se sincroniza con el servidor cuando hay conexión.

**Versión:** 1.0

---

## ✨ Funcionalidades

- Registro e inicio de sesión (contraseñas cifradas con `password_hash`).
- Panel de inicio con el **total del año** y el **total del mes**.
- **CRUD de gastos**: alta, consulta, edición (modal) y eliminación.
- **Filtros persistentes** por periodo (última semana, último mes, últimos 3 meses, último año) y por categoría.
- **Persistencia offline-first**: los gastos se guardan en el dispositivo y se sincronizan con el servidor.
- Edición y eliminación de **perfil** (incluye cambio de contraseña).
- **Detección de conexión** con avisos "Sin conexión" / "De vuelta en línea" y manejo de errores con mensajes claros.

---

## 🛠️ Tecnologías

- **Frontend:** Ionic 9, Angular 22 (NgModules), TypeScript, SCSS.
- **HTTP:** axios.
- **Persistencia local:** Ionic Storage, localStorage.
- **Backend:** PHP con PDO.
- **Base de datos:** MySQL / MariaDB (base `login_app`), servida con XAMPP.

---

## 🗂️ Modelo de datos

Tres tablas en la base `login_app`:

- **users** — cuentas de usuario (correo, contraseña cifrada, nombre, teléfono, dirección…).
- **categories** — categorías globales predefinidas (Comida, Transporte, Entretenimiento, Hogar, Salud, Otros, Personalizada).
- **expenses** — gastos; cada uno pertenece a un usuario y a una categoría.

Relaciones: un usuario tiene muchos gastos (1:N); una categoría clasifica muchos gastos (1:N).

| Campo | Tipo | Descripción |
|---|---|---|
| id | INT (PK) | Identificador (lo genera la base) |
| user_id | INT (FK) | Usuario dueño → `users.id` |
| category_id | INT (FK) | Categoría → `categories.id` |
| description | VARCHAR(255) | Descripción del gasto |
| amount | DECIMAL(10,2) | Monto |
| note | TEXT | Nota opcional |
| payment_method | ENUM | efectivo, tarjeta, transferencia u otro |
| date | DATE | Fecha del gasto |
| created_at | TIMESTAMP | Fecha de registro |

---

## 🔌 API (endpoints)

| Endpoint | Métodos | Función |
|---|---|---|
| `login.php` | POST | Iniciar sesión |
| `register.php` | POST | Registrar usuario |
| `expenses.php` | GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS | CRUD de gastos |
| `categories.php` | GET, HEAD, OPTIONS | Leer categorías |
| `profile.php` | GET, PUT, PATCH, DELETE, HEAD, OPTIONS | Ver, editar y eliminar perfil |

Todas las respuestas usan la forma `{ ok, data, message, error }` y códigos HTTP adecuados.

---

## 🚀 Instalación y ejecución

### Requisitos
- Node.js y npm
- Ionic CLI y Angular CLI
- XAMPP (Apache + MySQL)

### Backend
1. Copia la carpeta `login-api` en `C:\xampp\htdocs\`.
2. Inicia **Apache** y **MySQL** en XAMPP.
3. En phpMyAdmin, crea/usa la base `login_app` e importa el SQL del modelo de datos.

### Frontend
```bash
npm install
ionic serve
```
La URL de la API se configura en `src/environments/environment.ts` (`apiUrl`).

---

## 📱 Generar APK (opcional, con Capacitor)

```bash
ionic build
npx cap add android
npx cap sync android
npx cap open android   # compilar el APK en Android Studio
```
> Para un dispositivo real, `apiUrl` debe apuntar a un servidor accesible (no `localhost`).

---

## 💾 Persistencia y operación offline

- **Caché local** (`expenses_cache`): la lista de gastos que se muestra; funciona sin conexión.
- **Cola de pendientes** (`expenses_outbox`): cambios que aún no llegan al servidor.
- Cada operación se aplica primero en local y se encola; al reconectar se sincroniza con MySQL.
- Los filtros del inicio (`home_filter`) y la sesión también se guardan localmente.

---

## 🧭 Estructura (resumen)

```
src/app/
  login/                # Inicio de sesión
  tab1/                 # Registro (3 pasos)
  tab2/                 # Inicio (totales, lista, filtros)
  tab3/                 # Agregar gasto
  profile/              # Perfil (editar / eliminar)
  tabs/                 # Contenedor de pestañas
  models/               # Interfaces TypeScript
  services/             # Servicios y repositorios (axios + Ionic Storage)
  ionic.shared.module.ts
login-api/              # API PHP (db, login, register, expenses, categories, profile)
```

---

## 👩‍💻 Autora

Mariana Andrade

---

_Desarrollado con apoyo de un asistente de IA para el diseño del modelo, la generación y revisión de código, y la resolución de problemas (ver bitácora de desarrollo)._
