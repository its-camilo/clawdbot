# Variables de Entorno para Render 🔐

Esta es la lista completa de todas las API keys y secretos que debes configurar en Render para que Clawdbot funcione correctamente.

## Variables REQUERIDAS ✅

Estas variables son obligatorias para que la aplicación funcione:

### 1. GROQ_API_KEY
- **Descripción**: API Key de Groq para funciones de IA con modelos Llama
- **Tipo**: Secret/Sensible
- **¿Cómo obtenerla?**: 
  1. Visita [console.groq.com](https://console.groq.com)
  2. Crea una cuenta o inicia sesión
  3. Ve a la sección de API Keys
  4. Genera una nueva key
- **Ejemplo**: `gsk_...` (comienza con `gsk_`)
- **Estado actual**: ✅ Ya la tienes configurada

### 2. TELEGRAM_TOKEN
- **Descripción**: Token de autenticación para el bot de Telegram
- **Tipo**: Secret/Sensible
- **¿Cómo obtenerlo?**:
  1. Abre Telegram y busca [@BotFather](https://t.me/botfather)
  2. Envía el comando `/newbot`
  3. Sigue las instrucciones para crear tu bot
  4. Copia el token que te proporciona BotFather
- **Ejemplo**: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`
- **Estado actual**: ⚠️ Debes configurarla

### 3. PORT
- **Descripción**: Puerto en el que corre el servidor Express
- **Tipo**: Configuración (no sensible)
- **¿Cómo configurarla?**: Render normalmente lo configura automáticamente
- **Valor recomendado**: `3000` (o dejar que Render lo asigne automáticamente)
- **Estado actual**: ℹ️ Opcional (tiene valor por defecto)

## Variables OPCIONALES 🔧

Estas variables son opcionales pero activan funcionalidades adicionales:

### 4. TIMEZONE
- **Descripción**: Zona horaria para eventos y fechas
- **Tipo**: Configuración (no sensible)
- **Valor por defecto**: `America/Mexico_City`
- **Otros valores**: Cualquier zona horaria válida (ej: `America/New_York`, `Europe/Madrid`)
- **Estado actual**: ℹ️ Opcional

### Integración con Google Calendar & Gmail (OPCIONAL)

Si deseas integrar Google Calendar y Gmail, necesitas estas 3 variables:

### 5. GOOGLE_CLIENT_ID
- **Descripción**: Client ID de la aplicación OAuth 2.0 de Google
- **Tipo**: Secret/Sensible
- **¿Cómo obtenerlo?**:
  1. Ve a [Google Cloud Console](https://console.cloud.google.com)
  2. Crea un proyecto nuevo o selecciona uno existente
  3. Habilita Google Calendar API y Gmail API
  4. Ve a "Credenciales" → "Crear credenciales" → "ID de cliente de OAuth 2.0"
  5. Configura la pantalla de consentimiento OAuth
  6. Copia el Client ID generado
- **Ejemplo**: `123456789-abc123.apps.googleusercontent.com`
- **Estado actual**: ⚠️ Debes configurarla si quieres usar Google Calendar/Gmail

### 6. GOOGLE_CLIENT_SECRET
- **Descripción**: Client Secret de la aplicación OAuth 2.0 de Google
- **Tipo**: Secret/Sensible
- **¿Cómo obtenerlo?**: Se genera junto con el Client ID (paso anterior)
- **Ejemplo**: `GOCSPX-abc123def456...`
- **Estado actual**: ⚠️ Debes configurarla si quieres usar Google Calendar/Gmail

### 7. GOOGLE_REFRESH_TOKEN
- **Descripción**: Refresh Token de OAuth 2.0 para acceder a Google APIs
- **Tipo**: Secret/Sensible
- **¿Cómo obtenerlo?**:
  1. Usa el Client ID y Client Secret que creaste
  2. Genera un refresh token usando el flujo OAuth 2.0
  3. Puedes usar herramientas como [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)
  4. Selecciona los scopes: Google Calendar API v3 y Gmail API v1
  5. Autoriza y obtén el refresh token
- **Ejemplo**: `1//abc123def456...`
- **Estado actual**: ⚠️ Debes configurarla si quieres usar Google Calendar/Gmail

### Integración con Apple Calendar (CalDAV) (OPCIONAL)

Si deseas integrar Apple Calendar (iCloud), necesitas estas 3 variables:

### 8. CALDAV_URL
- **Descripción**: URL del servidor CalDAV de Apple
- **Tipo**: Configuración (no sensible)
- **Valor típico**: `https://caldav.icloud.com/`
- **Estado actual**: ℹ️ Opcional

### 9. CALDAV_USERNAME
- **Descripción**: Tu Apple ID (email de iCloud)
- **Tipo**: Secret/Sensible
- **Ejemplo**: `tu-email@icloud.com`
- **Estado actual**: ⚠️ Debes configurarla si quieres usar Apple Calendar

### 10. CALDAV_PASSWORD
- **Descripción**: Contraseña específica de aplicación de iCloud (NO tu contraseña normal)
- **Tipo**: Secret/Sensible
- **¿Cómo obtenerla?**:
  1. Ve a [appleid.apple.com](https://appleid.apple.com)
  2. Inicia sesión con tu Apple ID
  3. Ve a la sección de "Seguridad"
  4. Genera una contraseña específica de aplicación
  5. Copia la contraseña generada (formato: xxxx-xxxx-xxxx-xxxx)
- **Ejemplo**: `abcd-efgh-ijkl-mnop`
- **Estado actual**: ⚠️ Debes configurarla si quieres usar Apple Calendar

## Resumen de Configuración en Render 📋

### Mínimo para funcionar (2 variables obligatorias):
```
✅ GROQ_API_KEY=tu_api_key_de_groq
⚠️ TELEGRAM_TOKEN=tu_token_de_telegram
```

### Configuración completa con todas las integraciones (10 variables):
```
✅ GROQ_API_KEY=tu_api_key_de_groq
⚠️ TELEGRAM_TOKEN=tu_token_de_telegram
⚠️ PORT=3000  (opcional, Render lo asigna automáticamente)
⚠️ TIMEZONE=America/Mexico_City  (opcional)
⚠️ GOOGLE_CLIENT_ID=tu_client_id
⚠️ GOOGLE_CLIENT_SECRET=tu_client_secret
⚠️ GOOGLE_REFRESH_TOKEN=tu_refresh_token
⚠️ CALDAV_URL=https://caldav.icloud.com/
⚠️ CALDAV_USERNAME=tu_apple_id
⚠️ CALDAV_PASSWORD=tu_contraseña_específica_de_app
```

## Cómo Configurar en Render 🚀

1. Ve a tu servicio en [Render Dashboard](https://dashboard.render.com)
2. Selecciona tu web service
3. Ve a la pestaña "Environment"
4. Haz clic en "Add Environment Variable"
5. Añade cada variable con su valor correspondiente
6. **Importante**: Marca las variables sensibles (API keys, tokens, passwords) como "Secret"
7. Guarda los cambios
8. Render redesplegará automáticamente tu aplicación

## Notas Importantes ⚠️

- **No compartas tus API keys o tokens** con nadie
- **No los subas al repositorio Git** - usa siempre variables de entorno
- Las variables opcionales de Google y CalDAV solo son necesarias si quieres usar esas integraciones
- Si no configuras Google o CalDAV, esas funcionalidades simplemente no estarán disponibles pero el bot seguirá funcionando
- Render encripta automáticamente las variables marcadas como "Secret"

## Estado Actual 📊

**Variables que ya tienes:**
- ✅ GROQ_API_KEY

**Variables que necesitas configurar:**
- ⚠️ TELEGRAM_TOKEN (OBLIGATORIO para que el bot funcione)

**Variables opcionales que puedes configurar si quieres esas funcionalidades:**
- ℹ️ GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN (para Google Calendar & Gmail)
- ℹ️ CALDAV_URL, CALDAV_USERNAME, CALDAV_PASSWORD (para Apple Calendar)
- ℹ️ TIMEZONE (para ajustar zona horaria)
- ℹ️ PORT (Render lo configura automáticamente)
