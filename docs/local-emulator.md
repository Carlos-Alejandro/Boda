# Entorno local con Firebase Emulator Suite

Este flujo conecta Boda, Boda-Admin y Boda-API al proyecto local `demo-boda`. El proyecto `demo-*` no tiene recursos Firebase reales. Usa solo Firestore y Auth Emulator; no importes datos ni apuntes los clientes a un proyecto real.

## Requisitos

- Dependencias de los tres repositorios ya instaladas (`node_modules` presente).
- Java disponible para Firestore Emulator.
- Los repositorios `Boda`, `Boda-Admin` y `Boda-API` como carpetas hermanas.
- Ejecuta cada bloque en una terminal PowerShell distinta. Inicia las terminales desde la carpeta raíz del repositorio Boda.

## 1. Iniciar emuladores

En la terminal 1:

```powershell
npm exec -- firebase emulators:start --only auth,firestore --project demo-boda
```

La configuración fija los emuladores en `127.0.0.1`: Auth `9099`, Firestore `8080` y Emulator UI `4000`. No uses `--import`, `--export-on-exit` ni otro `--project`.

## 2. Preparar la cuenta local de administración

Con los emuladores activos, abre `http://127.0.0.1:4000/auth`. En la terminal 2, inicia Boda-Admin en modo explícito de emuladores:

```powershell
$ProjectRoot = Split-Path (Get-Location).Path -Parent
Set-Location "$ProjectRoot\Boda-Admin"
$env:VITE_USE_FIREBASE_EMULATORS = 'true'
$env:VITE_API_BASE_URL = 'http://127.0.0.1:3000'
$env:VITE_PUBLIC_INVITATION_BASE_URL = 'http://127.0.0.1:5173'
npm run dev -- --host 127.0.0.1 --port 5174 --strictPort
```

Inicia sesión con el botón de Google. El Auth Emulator simula el proveedor localmente; no se autentica contra Google. En la pestaña Auth de Emulator UI, copia el UID de la cuenta creada. Ese UID solo existe en el emulador.

## 3. Iniciar Boda-API

En la terminal 3, sustituye `UID_LOCAL_DEL_EMULADOR` por el UID copiado en Emulator UI:

```powershell
$ProjectRoot = Split-Path (Get-Location).Path -Parent
Set-Location "$ProjectRoot\Boda-API"
$env:NODE_ENV = 'development'
$env:USE_FIREBASE_EMULATORS = 'true'
$env:FIREBASE_PROJECT_ID = 'demo-boda'
$env:FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080'
$env:FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099'
$env:ADMIN_FIREBASE_UIDS = 'UID_LOCAL_DEL_EMULADOR'
$env:CORS_ALLOWED_ORIGINS = 'http://127.0.0.1:5173,http://127.0.0.1:5174'
$env:PORT = '3000'
npm run dev
```

API valida que el modo esté en desarrollo, que el proyecto sea exactamente `demo-boda` y que ambos hosts sean los emuladores locales configurados. Si alguna comprobación falla, no inicia Firebase Admin. Después de iniciar API, recarga Boda-Admin para que vuelva a verificar la autorización.

## 4. Iniciar Boda

En la terminal 4:

```powershell
$ProjectRoot = Split-Path (Get-Location).Path -Parent
Set-Location "$ProjectRoot\Boda"
$env:VITE_USE_FIREBASE_EMULATORS = 'true'
$env:VITE_API_BASE_URL = 'http://127.0.0.1:3000'
npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
```

Boda usa `demo-boda` y Firestore Emulator. Boda-Admin usa `demo-boda` y Auth Emulator. Ambos llaman a la API local en el puerto `3000`; Admin crea enlaces públicos con origen `http://127.0.0.1:5173`.

## 5. Cerrar el entorno

Presiona `Ctrl+C` en las cuatro terminales. Las variables `$env:` solo están asignadas en cada sesión de PowerShell; al cerrar las terminales dejan de estar disponibles. No exportes los datos del emulador.

## Aislamiento

- El flag `VITE_USE_FIREBASE_EMULATORS=true` solo se acepta en builds de desarrollo de las aplicaciones web. Boda reemplaza su configuración Firebase normal por valores ficticios del proyecto `demo-boda` y conecta Firestore explícitamente a `127.0.0.1:8080`. Admin usa valores ficticios y conecta Auth explícitamente a `127.0.0.1:9099`.
- Boda y Admin rechazan URLs API/enlaces fuera de loopback mientras el flag esté activo.
- API requiere `USE_FIREBASE_EMULATORS=true`, `NODE_ENV=development`, proyecto exacto `demo-boda` y los dos hosts loopback. En ese modo Firebase Admin se inicializa sin credenciales ADC; el SDK apunta a los emuladores por las variables `*_EMULATOR_HOST`.
- Los comandos de Firebase CLI incluyen siempre `--project demo-boda`; la configuración predeterminada de Firebase CLI no se modifica.
- No uses endpoints de Functions, Storage u otros servicios en esta prueba: no forman parte de este entorno.

No se crean invitaciones automáticamente. Cuando el entorno esté arriba, crea datos desde Boda-Admin y comprueba que aparecen en Emulator UI. Los datos del emulador no son datos de producción.
