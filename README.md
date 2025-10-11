# 🍰 PokeSweets - Recomendador de Postres Temáticos de Pokémon

Sistema de recomendación de recetas de postres inspiradas en Pokémon, utilizando IA Generativa y LangGraph para orquestar el flujo de trabajo.

## 🎯 Características

- 🔍 Búsqueda y selección de Pokémon mediante PokéAPI
- 🤖 Generación de recetas personalizadas con GPT-4o y LangGraph
- 🎨 Generación de imágenes con DALL-E 3
- 💾 Almacenamiento local de recetas en SQLite
- 🐳 Despliegue completo con Docker Compose

## 🏗️ Arquitectura

### Stack Tecnológico

**Backend:**
- Python 3.11
- FastAPI
- LangChain + LangGraph
- SQLAlchemy + SQLite
- OpenAI API

**Frontend:**
- React 18
- Vite
- Tailwind CSS
- Axios + React Query

## 🤖 Elección de Modelos LLM

### GPT-4o (Generación de Recetas)

**Benchmarks considerados:**
- **MMLU (Massive Multitask Language Understanding)**: GPT-4o alcanza 88.7% en tareas de conocimiento general
- **HumanEval (Programación)**: 90.2% en generación de código estructurado (relevante para JSON)
- **Multilingüismo**: Soporte nativo para español de América Latina con alta calidad

**Razones de selección:**
1. **Creatividad culinaria**: Temperatura 0.8 permite recetas originales pero coherentes
2. **Seguimiento de instrucciones**: Excelente cumplimiento de formato JSON estructurado
3. **Conocimiento cultural**: Comprensión de ingredientes chilenos y latinoamericanos
4. **Costo-efectividad**: $2.50/M tokens input, $10/M tokens output

**Alternativas evaluadas:**
- Claude 3.5 Sonnet: Mejor creatividad pero costo 3x superior
- GPT-3.5 Turbo: Más económico pero calidad inferior en español
- Llama 3: Gratuito pero requiere infraestructura propia

### gpt-image-1 (Generación de Imágenes)

**Características técnicas:**
- Modelo nativo multimodal basado en GPT-4o
- Resolución hasta 4096×4096 pixels
- Lanzado en abril 2025

**Ventajas sobre DALL-E 3:**
- Mejor seguimiento de prompts complejos
- Generación de texto más precisa en imágenes
- Mejor comprensión de contexto temático (Pokémon + postres)
- Costo competitivo: $0.04/imagen (medium quality)

**Pricing:**
- Low quality: $0.01/imagen
- Medium quality: $0.04/imagen (usado por defecto)
- High quality: $0.17/imagen

### Monitoreo de Costos

El sistema incluye tracking automático de:
- Tokens consumidos (input/output)
- Costo por operación
- Endpoints: `/api/usage/summary`, `/api/usage/history`, `/api/usage/quota`

## 🚀 Inicio Rápido

### Prerequisitos

- Docker y Docker Compose
- OpenAI API Key

### Configuración

1. Clonar el repositorio:
```bash
cd ChatBot_PokeSweets
```

2. Configurar variables de entorno:
```bash
# Backend
cp backend/.env.example backend/.env
# Editar backend/.env y agregar tu OPENAI_API_KEY

# Frontend
cp frontend/.env.example frontend/.env
```

3. Iniciar los servicios:
```bash
docker-compose up --build
```

4. Acceder a la aplicación:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### 🍪 Recetas Predeterminadas

La base de datos se inicializa automáticamente con 4 recetas predeterminadas (incluyendo imágenes):
- **Torta Flama Charmander**
- **Alfajores Eléctricos Pikachu**
- **Flan Burbuja de Squirtle**
- **Galletas Bulbasaur Verdes**

Estas recetas se cargan solo en el primer inicio, cuando la base de datos está vacía.
Los datos se encuentran en `backend/data/recipe_*.json` e incluyen las imágenes en formato base64.

## 📖 Uso

1. Selecciona un Pokémon desde el buscador
2. El sistema genera automáticamente una receta temática
3. Opcionalmente, genera una imagen del postre
4. Guarda tus recetas favoritas

## 🔄 Flujo de Trabajo LangGraph

```
START → Fetch Pokémon → Build Prompt → Generate Recipe → 
Validate → Save Recipe → (Optional) Generate Image → END
```

## 🛠️ Desarrollo

### Estructura del Proyecto

```
ChatBot_PokeSweets/
├── backend/          # API FastAPI con LangGraph
├── frontend/         # Aplicación React
├── docker-compose.yml
└── README.md
```

### Comandos Útiles

```bash
# Ver logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Reiniciar servicios
docker-compose restart

# Detener servicios
docker-compose down

# Limpiar volúmenes
docker-compose down -v
```

## 👥 Integrantes

- Andrés Maldonado
- Edgar León

## 📄 Licencia

Este proyecto es parte de un trabajo académico.
