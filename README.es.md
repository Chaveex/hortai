# Garden App 🌱

Aplicación móvil de jardinería inteligente que proporciona recomendaciones de riego personalizadas, orientación sobre cuidado de plantas y asesoramiento botánico impulsado por IA.

## Características

- **Recomendaciones Inteligentes de Riego** : Calendario de riego personalizado según el tipo de planta, condiciones climáticas, humedad y etapa de crecimiento
- **Chat Botánico IA** : Consulta con un experto en IA sobre cuidado de plantas, enfermedades, consejos estacionales y gestión del jardín (3 preguntas/día)
- **Base de Datos Completa** : 20+ tipos de plantas con información detallada de cuidados, calendarios de fertilizantes y cronogramas de crecimiento
- **Integración Meteorológica** : Datos meteorológicos en tiempo real con pronósticos de 5 días que afectan los cálculos de riego
- **Panel de Control** : Vista general de tus plantas, recomendaciones de riego y consejos estacionales
- **Copia de Seguridad de Datos** : Exporta y restaura los datos de tu jardín
- **Multilingüe** : Compatibilidad con inglés, francés y español
- **Sin Conexión** : Todos los datos almacenados localmente con AsyncStorage

## Inicio Rápido

### Requisitos Previos

- Node.js 18+ y npm
- Expo CLI: `npm install -g expo-cli`
- Dispositivo físico o emulador (Android/iOS)
- Archivo `.env` con las claves API requeridas

### Configuración del Entorno

Crea un archivo `.env` en el directorio raíz:

```env
EXPO_PUBLIC_OPENWEATHER_API_KEY=tu_clave_openweather
EXPO_PUBLIC_ANTHROPIC_API_KEY=tu_clave_anthropic
```

### Instalación y Ejecución

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo (usar siempre --clear después de cambios)
npx expo start --clear

# Ejecutar en Android
npx expo start --android

# Ejecutar en iOS
npx expo start --ios

# Verificar tipos
npx tsc --noEmit
```

## Claves API Requeridas

| Servicio | Propósito | Nivel Gratuito |
|----------|-----------|----------------|
| OpenWeatherMap | Datos meteorológicos y pronósticos | 1.000 llamadas/día |
| Anthropic Claude | Chat Botánico IA | Facturación por uso |

Obtén las claves en:
- [OpenWeatherMap](https://openweathermap.org/api)
- [Consola Anthropic](https://console.anthropic.com)

## Arquitectura

### Gestión de Estado
- Almacén único de Zustand (`src/store/useStore.ts`) con persistencia vía AsyncStorage
- Datos persistidos: perfil, plantas, meteorología
- Estado derivado (recomendaciones, consejos) recalculado automáticamente

### Flujo de Datos
```
Perfil Usuario + Plantas + Meteorología
        ↓ refreshRecommendations()
Recomendaciones de Riego + Consejos de Jardinería
```

### Servicios Clave
- **Recomendaciones** : Lógica de riego considerando temperatura, humedad, viento, lluvia, etapa de crecimiento
- **Meteorología** : Integración OpenWeatherMap con pronóstico de 5 días
- **Chat IA** : API Anthropic Claude con soporte de visión para fotos de plantas
- **Notificaciones** : Notificaciones push locales (solo en builds de producción)

### Estructura de Navegación
- **Pestaña Inicio** : Panel de control y vista general del jardín
- **Pila Jardín** : Pantalla jardín → Agregar planta → Detalles de planta
- **Pestaña Configuración** : Perfil, copia de seguridad, preferencias de idioma
- **FAB Chat IA** : Botón flotante para consulta botánica

## Estructuras de Datos Principales

### Planta
```typescript
{
  id: string
  name: string
  type: string // de PLANT_DATABASE
  location: string
  plantedDate: Date
  wateringFrequency: number // en días
  dailyWaterNeed: number // en ml
  growthStage: 'germination' | 'seedling' | 'vegetative' | 'flowering'
  lastWatered: Date
}
```

### Recomendación de Riego
```typescript
{
  plantId: string
  baseNeed: number // ml
  adjustedNeed: number // después de ajustes meteorológicos
  priority: 'urgent' | 'high' | 'normal'
  nextWateringDate: Date
  reason: string // explicación del ajuste
}
```

## Comandos del Proyecto

| Comando | Propósito |
|---------|-----------|
| `npm start` | Iniciar servidor de desarrollo |
| `npm run android` | Ejecutar en Android |
| `npm run ios` | Ejecutar en iOS |
| `npm run build:android` | Build de producción Android vía EAS |
| `npm run build:ios` | Build de producción iOS vía EAS |
| `npx tsc --noEmit` | Verificación de tipos |

## Notas de Desarrollo

- **Alias de Ruta** : `@/*` → `./src/*` (usar imports relativos en la práctica)
- **Notificaciones** : Solo disponibles en builds de producción (no en Expo Go)
- **Límite Chat IA** : 3 preguntas por día, reinicio a las 00:00 UTC
- **Compresión de Foto** : Imágenes comprimidas a 600x400 JPEG @ 60% antes de enviar a API

## Solución de Problemas

### Problemas de Conexión del Servidor de Desarrollo
```bash
npx expo start --clear --lan
```

### Errores de Tipo
```bash
npx tsc --noEmit
```

### Limpiar Caché
```bash
npx expo start --clear
```

## Estructura del Proyecto

```
src/
├── screens/          # Componentes de pantalla
├── components/       # Componentes UI reutilizables
├── services/         # Lógica de negocio (meteorología, IA, recomendaciones)
├── store/           # Gestión de estado Zustand
├── constants/       # Base de datos de plantas, tema, traducciones
├── types/           # Definiciones de tipos TypeScript
├── hooks/           # Hooks React personalizados
├── i18n/            # Configuración de internacionalización
└── utils/           # Funciones utilitarias
```

## Idiomas Disponibles

- 🇺🇸 [English](README.md)
- 🇫🇷 [Français](README.fr.md)
- 🇪🇸 Español

## Contribuir

Ver CLAUDE.md para directrices de desarrollo y decisiones arquitectónicas.

## Licencia

[Especificar licencia]
