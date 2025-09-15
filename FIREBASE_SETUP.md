# Configuración de Firebase para Verbix

## 🔥 Configuración Inicial

### 1. Crear Proyecto en Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en "Crear proyecto"
3. Nombra tu proyecto: **Verbix**
4. Habilita Google Analytics (opcional)
5. Selecciona tu cuenta de Analytics

### 2. Agregar App Web

1. En la consola de Firebase, haz clic en el ícono Web (</>)
2. Registra tu app con el nombre: **Verbix Web**
3. **NO** marques "Firebase Hosting" por ahora
4. Copia la configuración que te aparece

### 3. Actualizar Configuración

Reemplaza la configuración en `src/services/firebase.ts`:

```typescript
const firebaseConfig = {
  apiKey: "tu-api-key-aqui",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-project-id",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456",
  measurementId: "G-XXXXXXXXXX",
};
```

### 4. Habilitar Authentication

1. En Firebase Console, ve a **Authentication**
2. Haz clic en **Comenzar**
3. Ve a la pestaña **Sign-in method**
4. Habilita **Correo electrónico/Contraseña**

### 5. Crear Firestore Database

1. En Firebase Console, ve a **Firestore Database**
2. Haz clic en **Crear base de datos**
3. Selecciona **Comenzar en modo de prueba** (por ahora)
4. Elige una ubicación (recomendado: us-central)

### 6. Configurar Reglas de Firestore

En la pestaña **Reglas** de Firestore, usa estas reglas iniciales:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Los usuarios solo pueden leer/escribir sus propios documentos
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Los verbos son públicos para lectura, solo admin puede escribir
    match /verbs/{verbId} {
      allow read: if true;
      allow write: if false; // Solo por admin panel en el futuro
    }

    // El progreso de usuario es privado
    match /userProgress/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 📱 Estructura de Datos en Firestore

### Colección: `users`

```javascript
{
  "uid": "user-firebase-uid",
  "email": "usuario@example.com",
  "displayName": "Nombre Usuario",
  "photoURL": "url-foto-perfil",
  "createdAt": "timestamp",
  "lastLoginAt": "timestamp",
  "learningProgress": {
    "totalVerbsLearned": 0,
    "currentStreak": 0,
    "levelCompleted": 0,
    "lastStudyDate": "timestamp"
  }
}
```

### Colección: `verbs` (para el futuro)

```javascript
{
  "id": "go",
  "infinitive": "go",
  "pastSimple": "went",
  "pastParticiple": "gone",
  "type": "irregular",
  "frequency": "high",
  "difficulty": 2,
  "examples": ["I go to school", "I went yesterday"],
  "pronunciation": {
    "infinitive": "/ɡoʊ/",
    "pastSimple": "/wɛnt/",
    "pastParticiple": "/ɡɔːn/"
  }
}
```

## 🧪 Pruebas

Para probar que todo funciona:

1. Ejecuta la app: `npm start`
2. Ve a la pantalla de registro: `/register`
3. Crea una cuenta de prueba
4. Verifica en Firebase Console > Authentication que el usuario se creó
5. Verifica en Firestore que se creó el documento del usuario

## 🔒 Seguridad

- Las contraseñas se validan con: mínimo 6 caracteres, 1 mayúscula, 1 minúscula, 1 número
- Los emails se validan con regex
- Los datos del usuario están protegidos por reglas de Firestore
- La autenticación persiste automáticamente

## 🚀 Próximos Pasos

1. Crear pantalla de Login
2. Agregar verificación por email
3. Implementar reset de contraseña
4. Crear la colección de verbos
5. Implementar el sistema de progreso
