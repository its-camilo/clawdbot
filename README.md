# Clawdbot 🤖

Clawdbot es un asistente personal inteligente que utiliza Groq AI para ayudarte a gestionar tus tareas, planificar tu día, y interactuar mediante un bot de Telegram. Integra Google Calendar, Apple Calendar (CalDAV) y Gmail para una experiencia completa de productividad.

## Características

- ✅ **Gestión de Tareas**: Agregar, eliminar y listar recordatorios
- 🤖 **IA con Groq**: Chat natural y generación de planes diarios
- 📱 **Bot de Telegram**: Interacción mediante comandos y conversación natural
- 📅 **Google Calendar**: Integración con eventos del calendario
- 🍎 **Apple Calendar**: Soporte para CalDAV
- 📧 **Gmail**: Resumen de correos importantes
- 🚀 **Listo para Render**: Deploy fácil en Render.com

## Endpoints de la API

### POST /reminder
Agregar una nueva tarea o recordatorio.

**Body:**
```json
{
  "task": "Comprar leche",
  "details": {
    "priority": "alta",
    "category": "compras"
  }
}
```

### POST /delete
Eliminar una tarea. Requiere confirmación explícita.

**Body:**
```json
{
  "id": 1,
  "confirm": true
}
```

### POST /plan-dia
Generar un plan del día con tareas, eventos del calendario y emails.

**Body:**
```json
{
  "include_email": true,
  "chat_id": "123456789"
}
```

### POST /telegram
Interacción de chat natural y comandos del bot.

**Body:**
```json
{
  "message": "¿Qué tareas tengo pendientes?",
  "chat_id": "123456789",
  "command": "/mi_dia"
}
```

### GET /reminders
Obtener todas las tareas.

### GET /pending-deletions
Obtener tareas pendientes de eliminar.

## Comandos de Telegram

- `/start` - Iniciar el bot
- `/mi_dia` - Ver plan del día con tareas y calendario
- `/tareas` - Listar todas las tareas
- `/agregar [tarea]` - Agregar una nueva tarea
- `/delete_confirm [id]` - Eliminar una tarea por ID
- `/pendientes` - Ver tareas marcadas para eliminar
- `/ayuda` - Mostrar ayuda

También puedes chatear naturalmente con el bot sin usar comandos.

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/its-camilo/clawdbot.git
cd clawdbot
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copia el archivo `.env.example` a `.env` y configura tus credenciales:

```bash
cp .env.example .env
```

Edita el archivo `.env`:

```env
# Requerido
PORT=3000
GROQ_API_KEY=tu_api_key_de_groq
TELEGRAM_TOKEN=tu_token_de_telegram

# Opcional - Google Calendar & Gmail
GOOGLE_CLIENT_ID=tu_client_id
GOOGLE_CLIENT_SECRET=tu_client_secret
GOOGLE_REFRESH_TOKEN=tu_refresh_token

# Opcional - Apple Calendar (CalDAV)
CALDAV_URL=https://caldav.icloud.com/
CALDAV_USERNAME=tu_apple_id
CALDAV_PASSWORD=tu_contraseña_específica_de_app
```

### 4. Ejecutar la aplicación

```bash
npm start
```

El servidor estará disponible en `http://localhost:3000`

## Obtener Credenciales

### Groq API Key
1. Visita [console.groq.com](https://console.groq.com)
2. Crea una cuenta o inicia sesión
3. Ve a API Keys y genera una nueva key

### Telegram Bot Token
1. Abre Telegram y busca [@BotFather](https://t.me/botfather)
2. Envía `/newbot` y sigue las instrucciones
3. Copia el token que te proporciona

### Google Calendar & Gmail (Opcional)
1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Crea un proyecto nuevo
3. Habilita Google Calendar API y Gmail API
4. Crea credenciales OAuth 2.0
5. Genera un refresh token usando el flujo OAuth

### Apple Calendar CalDAV (Opcional)
1. Genera una contraseña específica de aplicación en [appleid.apple.com](https://appleid.apple.com)
2. Usa tu Apple ID como username
3. Usa la contraseña específica de app

## Deploy en Render

1. Crea una cuenta en [Render.com](https://render.com)
2. Conecta tu repositorio de GitHub
3. Crea un nuevo Web Service
4. Configura las variables de entorno en Render
5. Deploy automático desde GitHub

**Configuración de Render:**
- Build Command: `npm install`
- Start Command: `npm start`
- Environment: Node

## Estructura del Proyecto

```
clawdbot/
├── index.js          # Servidor Express principal
├── clawdbot.js       # Cliente Groq AI
├── reminders.js      # Gestión de tareas
├── prompts.js        # Prompts para IA
├── telegram.js       # Bot de Telegram
├── google.js         # Google Calendar & Gmail
├── caldav.js         # Apple Calendar (CalDAV)
├── package.json      # Dependencias
├── .env.example      # Ejemplo de variables de entorno
├── .gitignore        # Archivos ignorados
└── README.md         # Este archivo
```

## Desarrollo

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev
```

## Tecnologías

- **Node.js** - Runtime de JavaScript
- **Express** - Framework web
- **Groq SDK** - IA con modelos Llama
- **node-telegram-bot-api** - Bot de Telegram
- **googleapis** - Google Calendar y Gmail
- **caldav-client** - Integración CalDAV

## Licencia

MIT

## Autor

Creado con ❤️ para productividad personal