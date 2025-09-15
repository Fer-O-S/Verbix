# Verbix - Estructura del Proyecto

## 📁 Estructura de Carpetas

```
Verbix/
├── app/                     # 🎯 Rutas de Expo Router
│   ├── (tabs)/             # Navegación por tabs
│   ├── _layout.tsx         # Layout principal
│   └── modal.tsx           # Pantalla modal
├── src/                    # 🚀 Código fuente principal
│   ├── components/         # Componentes reutilizables
│   │   ├── ui/            # Componentes de UI básicos
│   │   └── index.ts       # Exports de componentes
│   ├── screens/           # Pantallas específicas de la app
│   ├── services/          # APIs, HTTP requests, servicios externos
│   ├── utils/             # Funciones de utilidad
│   ├── types/             # Definiciones de TypeScript
│   ├── hooks/             # Custom hooks de React
│   ├── store/             # Estado global (Redux, Zustand, etc.)
│   ├── constants/         # Constantes de la aplicación
│   └── index.ts           # Export principal de src
├── assets/                # Imágenes, fonts, recursos estáticos
└── ...                   # Archivos de configuración
```

## 🎯 Cómo Usar Esta Estructura

### 1. **App Directory (Expo Router)**

- Aquí van solo las rutas de tu aplicación
- Usa `app/` para definir la navegación
- Los componentes de pantalla van en `src/screens/`

### 2. **Components**

```typescript
// ✅ Importación limpia con index.ts
import { ThemedText, ParallaxScrollView } from "@/components";

// En lugar de:
// import { ThemedText } from '@/components/themed-text';
// import ParallaxScrollView from '@/components/parallax-scroll-view';
```

### 3. **Screens**

Crea pantallas complejas en `src/screens/` y luego úsalas en `app/`:

```typescript
// src/screens/login-screen.tsx
export function LoginScreen() {
  return <View>...</View>;
}

// app/login.tsx
import { LoginScreen } from "@/screens";
export default LoginScreen;
```

### 4. **Services**

Para llamadas a APIs y servicios externos:

```typescript
// src/services/api.ts
export class ApiService {
  static async getUsers() {
    // llamada a API
  }
}
```

### 5. **Types**

Define tus tipos de TypeScript:

```typescript
// src/types/user.ts
export interface User {
  id: string;
  name: string;
  email: string;
}
```

### 6. **Store**

Para estado global (cuando lo necesites):

```typescript
// src/store/app-store.ts (con Zustand)
import { create } from "zustand";

export const useAppStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
```

## 🚀 Próximos Pasos

1. **Instala dependencias adicionales** que necesites (axios, zustand, etc.)
2. **Crea tu primera pantalla** en `src/screens/`
3. **Define tus tipos** en `src/types/`
4. **Crea servicios de API** en `src/services/`

## 📦 Importaciones Recomendadas

```typescript
// ✅ Desde index.ts (más limpio)
import { ThemedText, useColorScheme } from "@/";

// ✅ Específicas cuando sea necesario
import { LoginScreen } from "@/screens/login-screen";
import { ApiService } from "@/services/api";
```

## 🎨 Convenciones de Nombres

- **Componentes**: PascalCase (`LoginButton.tsx`)
- **Hooks**: camelCase con 'use' (`useAuth.ts`)
- **Servicios**: PascalCase con 'Service' (`ApiService.ts`)
- **Types**: PascalCase (`User.ts`, `ApiResponse.ts`)
- **Utils**: camelCase (`formatDate.ts`)

¡Tu proyecto ya está listo para escalar! 🚀
