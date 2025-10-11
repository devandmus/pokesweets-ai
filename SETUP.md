# 🚀 PokeSweets - Guía de Configuración

Esta guía te ayudará a configurar y ejecutar el proyecto PokeSweets en tu máquina local usando Docker.

## 📋 Prerequisitos

Antes de comenzar, asegúrate de tener instalado:

- **Docker** (versión 20.10 o superior)
- **Docker Compose** (versión 2.0 o superior)
- **OpenAI API Key** (puedes obtenerla en https://platform.openai.com)

## 🔧 Configuración Inicial

### 1. Configurar Variables de Entorno del Backend

Crea el archivo `.env` en la carpeta `backend/`:

```bash
cd backend
cp .env.example .env
```

Edita el archivo `backend/.env` y agrega tu OpenAI API Key:

```env
OPENAI_API_KEY=sk-tu-api-key-aqui
DATABASE_URL=sqlite:///./recipes.db
POKEAPI_BASE_URL=https://pokeapi.co/api/v2
CORS_ORIGINS=http://localhost:5173
```

**Importante:** Reemplaza `sk-tu-api-key-aqui` con tu clave real de OpenAI.

### 2. Configurar Variables de Entorno del Frontend

Crea el archivo `.env` en la carpeta `frontend/`:

```bash
cd frontend
cp .env.example .env
```

El archivo `frontend/.env` debe contener:

```env
VITE_API_URL=http://localhost:8000
```

## 🐳 Ejecución con Docker

### Iniciar todos los servicios

Desde la raíz del proyecto, ejecuta:

```bash
docker-compose up --build
```

Este comando:
- Construirá las imágenes de Docker para backend y frontend
- Iniciará ambos servicios
- El backend estará disponible en `http://localhost:8000`
- El frontend estará disponible en `http://localhost:5173`

### Ejecución en segundo plano

Si quieres ejecutar los servicios en modo detached (segundo plano):

```bash
docker-compose up -d --build
```

### Ver los logs

Para ver los logs de los servicios en ejecución:

```bash
# Todos los servicios
docker-compose logs -f

# Solo backend
docker-compose logs -f backend

# Solo frontend
docker-compose logs -f frontend
```

### Detener los servicios

```bash
docker-compose down
```

Para detener y eliminar los volúmenes (esto borrará la base de datos):

```bash
docker-compose down -v
```

## 🌐 Acceso a la Aplicación

Una vez que los servicios estén ejecutándose:

1. **Frontend:** Abre tu navegador en http://localhost:5173
2. **Backend API:** http://localhost:8000
3. **Documentación API:** http://localhost:8000/docs (Swagger UI)

## 📝 Uso de la Aplicación

1. **Buscar un Pokémon:** Escribe el nombre del Pokémon en el buscador
2. **Seleccionar:** Haz clic en el Pokémon que te interese
3. **Generar Receta:** 
   - Opcionalmente, marca la casilla para generar una imagen
   - Haz clic en "Generar Receta"
4. **Esperar:** La IA generará una receta única (10-30 segundos sin imagen, 30-60 segundos con imagen)
5. **Ver Detalles:** Haz clic en "Ver Receta Completa" para ver todos los detalles

## 🔍 Verificación de la Instalación

### Backend

Verifica que el backend esté funcionando:

```bash
curl http://localhost:8000/health
```

Deberías recibir: `{"status":"healthy"}`

### Frontend

Abre http://localhost:5173 en tu navegador. Deberías ver la interfaz de PokeSweets.

## ⚠️ Solución de Problemas

### Error: "OPENAI_API_KEY is not set"

**Problema:** No has configurado tu API key de OpenAI.

**Solución:** 
1. Asegúrate de haber creado el archivo `backend/.env`
2. Verifica que contenga tu API key válida
3. Reinicia los servicios: `docker-compose restart backend`

### Error: Puerto 8000 o 5173 ya en uso

**Problema:** Otro servicio está usando estos puertos.

**Solución:**
1. Detén el servicio que está usando el puerto
2. O modifica los puertos en `docker-compose.yml`:
   ```yaml
   ports:
     - "8001:8000"  # backend en puerto 8001
     - "5174:5173"  # frontend en puerto 5174
   ```

### Error: Cannot connect to the Docker daemon

**Problema:** Docker no está ejecutándose.

**Solución:** Inicia Docker Desktop o el servicio de Docker en tu sistema.

### El frontend no se conecta al backend

**Problema:** CORS o configuración de red.

**Solución:**
1. Verifica que ambos contenedores estén en la misma red
2. Revisa que `VITE_API_URL` en el frontend apunte a `http://localhost:8000`
3. Verifica que `CORS_ORIGINS` en el backend incluya `http://localhost:5173`

## 🛠️ Desarrollo

### Ejecutar sin Docker (Desarrollo Local)

#### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

## 📊 Base de Datos

La base de datos SQLite se almacena en:
- Dentro del contenedor: `/app/data/recipes.db`
- En tu máquina: volumen Docker `backend-data`

Para acceder a la base de datos:

```bash
docker-compose exec backend bash
cd data
sqlite3 recipes.db
```

## 🧪 Testing

### Probar el endpoint de búsqueda de Pokémon

```bash
curl "http://localhost:8000/api/pokemon/search?query=pika"
```

### Generar una receta de prueba

```bash
curl -X POST "http://localhost:8000/api/recipes/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "pokemon_id": 25,
    "generate_image": false
  }'
```

## 📚 Recursos Adicionales

- [Documentación de FastAPI](https://fastapi.tiangolo.com/)
- [Documentación de LangGraph](https://langchain-ai.github.io/langgraph/)
- [PokéAPI](https://pokeapi.co/)
- [OpenAI API](https://platform.openai.com/docs)

## 💡 Consejos

1. **Costos de API:** Generar imágenes con DALL-E 3 tiene un costo. Usa la opción con moderación.
2. **Rate Limits:** OpenAI tiene límites de tasa. Si generas muchas recetas seguidas, podrías alcanzar el límite.
3. **Caché:** El sistema cachea las consultas a PokéAPI para reducir llamadas a la API.

## 👥 Soporte

Si encuentras problemas:
1. Revisa los logs: `docker-compose logs -f`
2. Verifica que todas las variables de entorno estén configuradas
3. Asegúrate de que tu API key de OpenAI sea válida

---

**Desarrollado por:** Andrés Maldonado & Edgar León  
**Proyecto Académico** - 2025
