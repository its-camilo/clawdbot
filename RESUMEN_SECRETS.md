# 📋 Resumen Rápido - Secrets para Render

## Lo que YA tienes configurado ✅
- **GROQ_API_KEY** - API key de Groq Llama (Ya configurada)

## Lo que DEBES configurar URGENTE ⚠️
- **TELEGRAM_TOKEN** - Token del bot de Telegram (OBLIGATORIO)

Sin esta variable, el bot de Telegram no funcionará.

## Variables OPCIONALES (puedes agregarlas después) ℹ️

### Para Google Calendar y Gmail:
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET  
- GOOGLE_REFRESH_TOKEN

### Para Apple Calendar (iCloud):
- CALDAV_URL (normalmente: `https://caldav.icloud.com/`)
- CALDAV_USERNAME (tu Apple ID)
- CALDAV_PASSWORD (contraseña específica de app de iCloud)

### Otras configuraciones:
- TIMEZONE (por defecto: `America/Mexico_City`)
- PORT (Render lo configura automáticamente)

## 📖 Documentación Completa

Para instrucciones detalladas sobre cómo obtener cada API key y secret, consulta:
**[RENDER_SECRETS.md](./RENDER_SECRETS.md)**

Este archivo tiene:
- Instrucciones paso a paso para obtener cada credencial
- Links directos a las páginas donde generar las keys
- Ejemplos de formato de cada variable
- Explicación de qué hace cada una

## 🚀 Próximos Pasos

1. **Ahora mismo**: Configura `TELEGRAM_TOKEN` en Render
2. **Opcional**: Si quieres integración con calendarios, configura las variables de Google o CalDAV
3. **Listo**: Tu bot estará funcionando

## 💡 Tip

No necesitas configurar todas las variables de una vez. Empieza solo con:
- GROQ_API_KEY (ya la tienes ✅)
- TELEGRAM_TOKEN (configúrala ahora ⚠️)

Y luego añade las demás integraciones cuando las necesites.
