# PokeSweets - Especificación Técnica (Spec-Driven Development)

## Versión del Documento
**Versión:** 1.0  
**Fecha:** 9 de octubre de 2025  
**Autores:** Andrés Maldonado, Edgar León  
**Tipo:** Especificación para Desarrollo Dirigido por Especificaciones

---

## 1. Resumen Ejecutivo

PokeSweets es un sistema de recomendación inteligente de recetas de postres inspirados en Pokémon, desarrollado utilizando metodologías modernas de IA Generativa y arquitectura basada en flujos de trabajo (LangGraph). El sistema integra múltiples servicios externos (PokéAPI, OpenAI) para generar experiencias culinarias únicas y temáticas.

### 1.1 Objetivos del Proyecto
- Proporcionar recomendaciones personalizadas de recetas de postres basadas en atributos de Pokémon
- Integrar tecnologías de IA para generación automática de contenido culinario
- Implementar una arquitectura escalable usando FastAPI y React
- Optimizar la experiencia del usuario con una interfaz intuitiva y moderna

### 1.2 Alcance
- Sistema de búsqueda y selección de Pokémon
- Generación automática de recetas temáticas
- Creación opcional de imágenes de postres usando GPT-image-1
- Gestión de base de datos local para almacenamiento de recetas
- Interfaz web responsive y accesible

---

## 2. Arquitectura del Sistema

### 2.1 Diagrama de Arquitectura General

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                     │
│  ┌─────────────────────────────────────────────────┐   │
│  │  • PokemonSelector Component                    │   │
│  │  • DessertSelector Component                    │   │
│  │  • RecipeCard Component                         │   │
│  │  • RecipeDetail Component                       │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                           │
                           │ HTTP/JSON
                           │
┌─────────────────────────────────────────────────────────┐
│                    Backend (FastAPI)                    │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Routes:     Services:       Workflows:        │   │
│  │  • /api/pokemon/*  • PokeAPIService             │   │
│  │  • /api/recipes/*   • LLMService                │   │
│  │                      • ImageService              │   │
│  │                      • RecipeGraph (LangGraph)   │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                           │
                    ┌──────┼──────┐
                    │             │
            ┌───────▼─────┐ ┌─────▼─────┐
            │  PokéAPI    │ │  OpenAI    │
            │             │ │  (GPT-4o   │
            │             │ │   + DALL-E 3│
            └─────────────┘ └─────────────┘

┌─────────────────────────────────────────────────────────┐
│                  Base de Datos (SQLite)                 │
│  ┌─────────────────────────────────────────────────┐   │
│  │  • recipes: Recetas generadas                  │   │
│  │  • pokemon_cache: Cache de datos PokéAPI       │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Tecnologías y Stack
- **Backend:** Python 3.11, FastAPI, LangGraph, SQLAlchemy, SQLite
- **Frontend:** React 18, Vite, Tailwind CSS, Axios, React Query
- **Servicios Externos:** OpenAI API (GPT-4o, DALL-E 3), PokéAPI
- **Infraestructura:** Docker, Docker Compose
- **ORM:** SQLAlchemy con modelos Pydantic

### 2.3 Patrones de Diseño Implementados
- **Repository Pattern:** Para acceso a datos
- **Service Layer:** Para lógica de negocio (PokeAPIService, LLMService, ImageService)
- **State Machine:** Para orquestación de flujos con LangGraph
- **Dependency Injection:** Para gestión de dependencias en FastAPI

---

## 3. Requisitos Funcionales

### 3.1 Gestión de Pokémon
| ID | Requisito | Descripción |
|----|-----------|-------------|
| RF-PKM-001 | Buscar Pokémon | El sistema debe permitir buscar Pokémon por nombre con autocompletado |
| RF-PKM-002 | Mostrar detalles | Al seleccionar un Pokémon, se deben mostrar: ID, nombre, tipos, estadísticas, sprite |
| RF-PKM-003 | Cache de datos | Los datos de PokéAPI deben almacenarse en caché para reducir llamadas externas |
| RF-PKM-004 | Validación de IDs | Solo IDs válidos de Pokémon (1-1017) deben ser procesados |

### 3.2 Generación de Recetas
| ID | Requisito | Descripción |
|----|-----------|-------------|
| RF-RCP-001 | Análisis temático | El sistema debe analizar atributos del Pokémon (tipo, estadísticas, hábitat) |
| RF-RCP-002 | Generación por IA | Usar GPT-4o para crear recetas originales basadas en la temática del Pokémon |
| RF-RCP-003 | Estructura de receta | Toda receta debe incluir: título, descripción, ingredientes, instrucciones, dificultad, tiempo |
| RF-RCP-004 | Conexión temática | Cada receta debe explicar la relación conceptual con el Pokémon |
| RF-RCP-005 | Validación de contenido | Las recetas deben ser validadas para asegurar calidad y completitud |

### 3.3 Generación de Imágenes
| ID | Requisito | Descripción |
|----|-----------|-------------|
| RF-IMG-001 | Imagen opcional | La generación de imágenes debe ser opcional para reducir costos |
| RF-IMG-002 | Prompt inteligente | Generar prompts detallados basados en la receta y datos del Pokémon |
| RF-IMG-003 | Formato de salida | Las imágenes deben devolverse en formato base64 para display inmediato |
| RF-IMG-004 | Regeneración | Permitir generar imágenes para recetas existentes sin recrear la receta |

### 3.4 Gestión de Recetas
| ID | Requisito | Descripción |
|----|-----------|-------------|
| RF-MGMT-001 | Almacenamiento local | Todas las recetas generadas deben guardarse en base de datos |
| RF-MGMT-002 | Listado y filtrado | Listar recetas con paginación y filtro opcional por Pokémon |
| RF-MGMT-003 | Detalles completos | Mostrar información detallada de cada receta incluyendo metadata |
| RF-MGMT-004 | Eliminación | Permitir eliminar recetas guardadas del sistema |

### 3.5 Monitoreo de Uso de OpenAI
| ID | Requisito | Descripción |
|----|-----------|-------------|
| RF-USAGE-001 | Tracking de tokens | Cada llamada a OpenAI debe registrar tokens usados (input/output) |
| RF-USAGE-002 | Conversión a dólares | Calcular costo en USD basado en pricing de OpenAI |
| RF-USAGE-003 | Almacenamiento de uso | Guardar historial de uso en base de datos por sesión/receta |
| RF-USAGE-004 | Dashboard de métricas | Mostrar estadísticas de uso total (tokens, costos) |
| RF-USAGE-005 | Alertas de límite | Alertar cuando se acerque a límites de presupuesto/cuota |

### 3.5 Interfaz de Usuario
| ID | Requisito | Descripción |
|----|-----------|-------------|
| RF-UI-001 | Interfaz intuitiva | Flujo de 3 pasos: Seleccionar Pokémon → Elegir tipo postre → Generar |
| RF-UI-002 | Responsive design | La interfaz debe funcionar correctamente en desktop y móvil |
| RF-UI-003 | Estados de carga | Mostrar indicadores visuales durante operaciones asíncronas |
| RF-UI-004 | Manejo de errores | Mostrar mensajes de error comprensibles al usuario |

---

## 4. Requisitos No Funcionales

### 4.1 Rendimiento
| ID | Requisito | Descripción |
|----|-----------|-------------|
| RNF-PERF-001 | Tiempo de respuesta | Generación de receta básica: < 30 segundos |
| RNF-PERF-002 | Tiempo de respuesta con imagen | Generación completa: < 60 segundos |
| RNF-PERF-003 | Paginación | Listado de recetas con límite máximo de 20 por página |
| RNF-PERF-004 | Cache hit rate | > 80% de solicitudes a PokéAPI servidas desde caché |

### 4.2 Seguridad
| ID | Requisito | Descripción |
|----|-----------|-------------|
| RNF-SEC-001 | Validación de entrada | Todos los inputs del usuario deben ser validados |
| RNF-SEC-002 | Rate limiting | Implementar límites de frecuencia en endpoints críticos |
| RNF-SEC-003 | API Keys securización | Claves de API externas almacenadas en variables de entorno |
| RNF-SEC-004 | Sanitización | Salida de IA debe ser sanitizada antes de almacenamiento |

### 4.3 Usabilidad
| ID | Requisito | Descripción |
|----|-----------|-------------|
| RNF-USAB-001 | Navegación clara | Flujo lineal sin navegación confusa |
| RNF-USAB-002 | Feedback visual | Estados de carga, éxito y error claramente diferenciados |
| RNF-USAB-003 | Accesibilidad | Cumplimiento básico WCAG 2.1 (contraste, navegación por teclado) |

### 4.4 Fiabilidad
| ID | Requisito | Descripción |
|----|-----------|-------------|
| RNF-REL-001 | Manejo de errores | Sistema debe recuperarse graciosamente de fallos en servicios externos |
| RNF-REL-002 | Logging estructurado | Todos los errores y operaciones críticas deben ser loggeadas |
| RNF-REL-003 | Validación de respuestas | Respuestas de APIs externas deben ser validadas antes de uso |

---

## 5. Especificaciones Técnicas

### 5.1 API REST

#### Endpoints de Pokémon
```
GET /api/pokemon/search?query={string}&limit={int}
- Busca Pokémon por nombre
- Retorna lista de resultados con ID, nombre, sprite

GET /api/pokemon/{id}
- Obtiene detalles completos de un Pokémon
- Incluye estadísticas, tipos, hábitat, etc.
```

#### Endpoints de Recetas
```
POST /api/recipes/generate
Body: { pokemon_id: int, preferences: object, generate_image: bool }
- Genera nueva receta usando workflow LangGraph
- Retorna: { recipe: object, usage: { tokens: int, cost_usd: float }, ... }

GET /api/recipes/?skip={int}&limit={int}&pokemon_id={int}
- Lista recetas guardadas con paginación

GET /api/recipes/{id}
- Obtiene detalles completos de una receta

POST /api/recipes/{id}/generate-image
- Genera imagen para receta existente
- Retorna: { recipe: object, usage: { tokens: int, cost_usd: float } }

DELETE /api/recipes/{id}
- Elimina una receta del sistema

#### Endpoints de Uso de OpenAI
```
GET /api/usage/summary
- Obtiene estadísticas generales de uso
- Retorna: { total_tokens: int, total_cost_usd: float, recipes_count: int, images_count: int }

GET /api/usage/history?start_date={date}&end_date={date}&limit={int}
- Historial detallado de uso por período
- Retorna: lista de registros de uso con timestamps

GET /api/usage/quota
- Estado actual vs límites de presupuesto
- Retorna: { current_cost: float, budget_limit: float, percentage_used: float }
```

### 5.2 Esquema de Base de Datos

#### Tabla `recipes`
```sql
CREATE TABLE recipes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pokemon_id INTEGER NOT NULL,
    pokemon_name VARCHAR(100) NOT NULL,
    recipe_title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    ingredients TEXT NOT NULL,  -- JSON array
    instructions TEXT NOT NULL, -- JSON array
    difficulty VARCHAR(20),
    prep_time INTEGER,          -- minutes
    image_url VARCHAR(500),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_pokemon_id (pokemon_id),
    INDEX idx_created_at (created_at DESC)
);
```

#### Tabla `pokemon_cache`
```sql
CREATE TABLE pokemon_cache (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    data TEXT NOT NULL,         -- JSON object
    cached_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_name (name)
);
```

#### Tabla `openai_usage`
```sql
CREATE TABLE openai_usage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_type VARCHAR(50) NOT NULL,        -- 'recipe_generation' o 'image_generation'
    model VARCHAR(50) NOT NULL,               -- 'gpt-4o' o 'dall-e-3'
    prompt_tokens INTEGER DEFAULT 0,
    completion_tokens INTEGER DEFAULT 0,
    total_tokens INTEGER NOT NULL,
    cost_usd DECIMAL(10,6) NOT NULL,
    recipe_id INTEGER,                        -- NULL para imágenes independientes
    pokemon_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_request_type (request_type),
    INDEX idx_created_at (created_at),
    INDEX idx_recipe_id (recipe_id),
    INDEX idx_pokemon_id (pokemon_id),
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE SET NULL
);
```

### 5.3 Esquema de Estado LangGraph

```python
class RecipeState(TypedDict):
    # Input
    pokemon_id: int
    pokemon_name: Optional[str]
    pokemon_data: Optional[Dict[str, Any]]
    user_preferences: Optional[Dict[str, Any]]
    generate_image: bool

    # Processing
    recipe_prompt: Optional[str]
    raw_recipe: Optional[Dict[str, Any]]
    validated_recipe: Optional[Dict[str, Any]]

    # Output
    recipe_id: Optional[int]
    image_url: Optional[str]
    image_prompt: Optional[str]
    errors: List[str]

    # Usage Tracking (New)
    usage_stats: Optional[Dict[str, Any]]    # tokens, cost_usd for recipe generation
    image_usage_stats: Optional[Dict[str, Any]]  # tokens, cost_usd for image generation
```

---

## 6. Especificaciones de Flujo de Trabajo

### 6.1 Diagrama de Flujo LangGraph

```
START
  ↓
fetch_pokemon_node
  ↓
build_prompt_node
  ↓
generate_recipe_node
  ↓
validate_recipe_node
  ↓
save_recipe_node --------→ should_generate_image?
  ↓                          ↓ (Yes)
  END                     generate_image_node
                             ↓
                             END
```

### 6.2 Descripción de Nodos

| Nodo | Función | Input | Output |
|------|---------|-------|--------|
| fetch_pokemon_node | Obtiene datos del Pokémon desde PokéAPI/cache | pokemon_id | pokemon_data, pokemon_name |
| build_prompt_node | Construye prompt inteligente para IA | pokemon_data, user_preferences | recipe_prompt |
| generate_recipe_node | Envía prompt a GPT-4o y parsea respuesta | recipe_prompt | raw_recipe |
| validate_recipe_node | Valida estructura y completitud de receta | raw_recipe | validated_recipe |
| save_recipe_node | Guarda receta en base de datos | validated_recipe | recipe_id |
| generate_image_node | Genera imagen usando DALL-E 3 | recipe_data, pokemon_data | image_url |

---

## 7. Interfaces de Usuario

### 7.1 Página Principal
- **Header con branding:** Logo, título "PokeSweets", descripción
- **Paso 1:** Componente PokemonSelector con búsqueda y lista de resultados
- **Paso 1.5:** Componente DessertSelector para elegir tipo de postre
- **Paso 2:** Botón de generación con checkbox para imagen
- **Sección de resultados:** RecipeCard para mostrar receta generada
- **Lista guardada:** Grid de RecipeCard para recetas previas

### 7.2 Modal de Detalles de Receta
- **Header:** Título, nombre del Pokémon, sprite
- **Contenido:** Descripción, dificultad, tiempo, conexión temática
- **Ingredientes:** Lista numerada con cantidades
- **Instrucciones:** Lista paso a paso
- **Imagen del postre:** Display opcional de imagen generada
- **Footer:** Botones para cerrar y opcionalmente regenerar imagen

### 7.3 Componentes Principales

#### PokemonSelector
- Input de búsqueda con autocompletado
- Grid de tarjetas mostrando: sprite, ID, nombre, tipos
- Estados: loading, error, vacío

#### DessertSelector
- Grid de opciones: Torta, Galletas, Helado, etc.
- Estado seleccionado visual
- Opcional: permitir múltiples selecciones

#### RecipeCard
- Miniatura: título, Pokémon, dificultad, tiempo
- Acciones: ver detalles, eliminar
- Imagen opcional en miniatura

#### UsageDashboard (New)
- Header con estadísticas generales: total tokens, costos acumulados
- Gráfico de uso por día/semana (últimos 30 días)
- Indicador de presupuesto: barra de progreso con límite configurado
- Alertas visuales cuando se acerque al límite (80%, 90%, 95%)
- Tabla de historial: fecha, tipo, tokens, costo, receta asociada
- Filtros por período y tipo de operación

---

## 8. Requisitos de Integración

### 8.1 PokéAPI
- **Endpoint:** `https://pokeapi.co/api/v2/pokemon/{id}/`
- **Datos requeridos:** id, name, types, stats, sprites, species
- **Endpoint de especies:** `https://pokeapi.co/api/v2/pokemon-species/{id}/`
- **Caching:** Al menos 24 horas de cache para reducir llamadas API

### 8.2 OpenAI API
- **Modelo de texto:** GPT-4o para generación de recetas
- **Modelo de imagen:** DALL-E 3 para imágenes de postres
- **Prompt Engineering:** Prompts estructurados con contexto del Pokémon
- **Error Handling:** Reintentos automáticos para timeouts

### 8.3 Gestión de Costos
- **Imágenes opcionales:** Checkbox para confirmar generación (costosa)
- **Rate Limiting:** Implementar límites por usuario/sesión
- **Caching agresivo:** Evitar regeneración de contenido idéntico

---

## 9. Consideraciones de Seguridad y Compliance

### 9.1 Gestión de Tokens API
- Variables de entorno para `OPENAI_API_KEY`
- Validación de permisos por endpoint
- Logging de uso sin exponer tokens

### 9.2 Validación y Sanitización
- Input validation para todos los parámetros numéricos
- Sanitización de prompts generados por IA
- Escape de caracteres especiales en storage

### 9.3 Políticas de Retención
- Recetas permanentes hasta eliminación manual
- Cache de Pokémon con expiración de 24 horas
- Logs rotados diariamente

---

## 10. Estrategia de Despliegue y DevOps

### 10.1 Configuración Docker
```yaml
# docker-compose.yml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=sqlite:///./data/recipes.db
      - POKEAPI_BASE_URL=https://pokeapi.co/api/v2
      - CORS_ORIGINS=http://localhost:5173
    volumes:
      - backend-data:/app/data

  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    environment:
      - VITE_API_URL=http://localhost:8000
```

### 10.2 Variables de Entorno
- **Backend:** OPENAI_API_KEY, DATABASE_URL, POKEAPI_BASE_URL, CORS_ORIGINS, OPENAI_BUDGET_LIMIT
- **Frontend:** VITE_API_URL

### 10.3 Health Checks
- `/health` endpoint para verificación de estado del backend
- Verificación de conectividad de base de datos
- Validación de configuración de servicios externos

---

## 11. Criterios de Aceptación

### 11.1 Funcionalidad Básica
- [ ] Usuario puede buscar y seleccionar cualquier Pokémon
- [ ] Sistema genera una receta única basada en el Pokémon seleccionado
- [ ] Receta incluye todos los campos requeridos (ingredientes, instrucciones, etc.)
- [ ] Receta se guarda automáticamente en la base de datos
- [ ] Interfaz muestra claramente los pasos de generación

### 11.2 Generación de Imágenes
- [ ] Checkbox permite activar/desactivar generación de imágenes
- [ ] Imagen se genera usando DALL-E 3 basada en la receta
- [ ] Imagen se almacena y muestra correctamente
- [ ] Proceso muestra indicadores de progreso

### 11.3 Gestión de Datos
- [ ] Lista de recetas guardadas se muestra correctamente
- [ ] Filtros por Pokémon funcionan
- [ ] Eliminación de recetas funciona sin errores
- [ ] Paginación implementada correctamente

---

## 12. Métricas de Éxito

### 12.1 Rendimiento
- Ratio de generación exitosa: > 95%
- Tiempo promedio de respuesta: < 45 segundos (con imagen)
- Cache hit rate: > 80%
- Disponibilidad del sistema: > 99%

### 12.2 Calidad
- Satisfacción del usuario: > 4/5 en encuestas
- Calidad de recetas generadas: > 85% aceptables
- Precisión de búsqueda de Pokemon: > 98%
- Ratio de errores manejados: > 95%

### 12.3 Uso
- Número promedio de generaciones por sesión: 3-5
- Ratio de usuarios que generan imágenes: 40-60%
- Tiempo promedio de sesión: 5-10 minutos

### 12.4 Costos OpenAI (New)
- Costo promedio por receta: < $0.05
- Costo promedio por imagen: < $0.08
- Límite mensual de presupuesto: $50-100 (configurable)
- Ratio costo/beneficio: > 90% de presupuesto efectivo

---

## 13. Plan de Pruebas

### 13.1 Pruebas Unitarias
- Cobertura de servicios de backend: > 80%
- Validación de modelos y esquemas Pydantic
- Pruebas de funciones de utilidad y helpers

### 13.2 Pruebas de Integración
- Endpoints de API con mocks de servicios externos
- Flujo completo de generación de recetas
- Validación de respuestas de error

### 13.3 Pruebas E2E
- Flujo completo desde frontend
- Generación de receta con y sin imagen
- Navegación y estados de UI

### 13.4 Pruebas de Rendimiento
- Tiempo de respuesta de endpoints críticos
- Simulación de carga concurrente
- Eficiencia de cache

---

## 14. Anexos

### 14.1 Referencias
- [Documentación FastAPI](https://fastapi.tiangolo.com/)
- [Documentación LangGraph](https://langchain-ai.github.io/langgraph/)
- [PokéAPI Documentation](https://pokeapi.co/docs/v2)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)

### 14.2 Términos y Definiciones
- **Spec-Driven Development:** Metodología donde se escribe la especificación completa antes del desarrollo
- **LangGraph:** Framework para orquestar flujos de trabajo basados en grafos de estado
- **Pokémon Temático:** Receta inspirada en características específicas de un Pokémon
- **Prompt Engineering:** Técnica de construcción de prompts efectivos para modelos de IA

---

*Este documento representa la especificación completa del sistema PokeSweets siguiendo principios de Spec-Driven Development. Todas las modificaciones deben ser discutidas y aprobadas por el equipo de desarrollo.*
