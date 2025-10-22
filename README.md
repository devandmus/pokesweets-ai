# 🍰 PokeSweets - Recomendador de Postres Temáticos de Pokémon

Sistema de recomendación de recetas de postres inspiradas en Pokémon, utilizando IA Generativa y LangGraph para orquestar el flujo de trabajo.

## 🚀 Inicio Rápido

### Prerequisitos

Necesitas tener instalado:
- **Docker Desktop**: [Descargar aquí](https://www.docker.com/products/docker-desktop)
- **OpenAI API Key**: Sigue los pasos de la siguiente sección

### 1️⃣ Obtener tu OpenAI API Key

1. Ve a [https://platform.openai.com](https://platform.openai.com)
2. Inicia sesión o crea una cuenta
3. Ve a **API Keys** en el menú lateral
4. Haz clic en **"Create new secret key"**
5. Copia tu API key (empieza con `sk-proj-...`)

> ⚠️ **Importante**: Guarda tu API key en un lugar seguro. No la compartas públicamente.

### 2️⃣ Configurar el Proyecto

1. **Clonar el repositorio**:
```bash
git clone <tu-repositorio>
cd pokesweets-ai
```

2. **Configurar tu API Key**:
```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar el archivo .env y reemplazar con tu API key
# En Mac/Linux:
nano .env

# En Windows:
notepad .env
```

Reemplaza `tu-api-key-aqui` con tu API key real:
```
OPENAI_API_KEY=sk-proj-TU_API_KEY_REAL_AQUI
```

### 3️⃣ Levantar la Aplicación con Docker

```bash
# Iniciar todos los servicios (primera vez puede tardar unos minutos)
docker-compose up --build
```

¡Listo! La aplicación estará disponible en:
- 🎨 **Frontend**: [http://localhost:5173](http://localhost:5173)
- 🔧 **Backend API**: [http://localhost:8000](http://localhost:8000)
- 📚 **Documentación API**: [http://localhost:8000/docs](http://localhost:8000/docs)

### 4️⃣ Usar la Aplicación

1. Abre tu navegador en [http://localhost:5173](http://localhost:5173)
2. Busca y selecciona tu Pokémon favorito
3. El sistema generará automáticamente una receta temática
4. Opcionalmente, genera una imagen del postre con IA
5. ¡Disfruta de tu receta pokémon!

---

## 📦 Comandos Útiles

```bash
# Detener la aplicación
docker-compose down

# Ver logs en tiempo real
docker-compose logs -f

# Reiniciar servicios
docker-compose restart

# Limpiar todo (base de datos incluida)
docker-compose down -v
```

---

## 🎯 Características

- 🔍 Búsqueda de +1000 Pokémon mediante PokéAPI
- 🤖 Generación de recetas personalizadas con GPT-4o
- 🎨 Generación de imágenes con gpt-image-1
- 💾 Almacenamiento local de recetas en SQLite
- 📊 Monitoreo de costos y uso de API
- 🐳 Despliegue completo con Docker Compose

### 🍪 Recetas Predeterminadas

La base de datos incluye 4 recetas de ejemplo:
- **Torta Flama Charmander**
- **Alfajores Eléctricos Pikachu**
- **Flan Burbuja de Squirtle**
- **Galletas Bulbasaur Verdes**

---

## 🏗️ Stack Tecnológico

**Backend:**
- Python 3.11
- FastAPI
- LangChain + LangGraph
- SQLAlchemy + SQLite
- OpenAI API (GPT-4o + gpt-image-1)

**Frontend:**
- React 18 + Vite
- Tailwind CSS
- Axios + React Query

---

## 🤖 Modelos de IA Utilizados

### GPT-4o (Generación de Recetas)
- **Temperatura**: 0.8 para balance entre creatividad y coherencia
- **Costo**: ~$2.50/M tokens input, $10/M tokens output
- **Ventajas**: Excelente en español, formato JSON estructurado, conocimiento culinario

### gpt-image-1 (Generación de Imágenes)
- **Costo**: $0.04/imagen (calidad media)
- **Ventajas**: Mejor seguimiento de prompts complejos, contexto temático Pokémon + postres

### 📊 Monitoreo de Costos
Endpoints disponibles:
- `/api/usage/summary` - Resumen de uso
- `/api/usage/history` - Historial de operaciones
- `/api/usage/quota` - Límites y presupuesto

## 👥 Integrantes

- Andrés Maldonado
- Edgar León

## 📄 Licencia

Este proyecto es parte de un trabajo académico.
