# Church Planning App - Guía de Producción (Costo Cero)

## Arquitectura de Producción

```
┌─────────────────────────────────────────────────────────────────┐
│                        COSTO CERO STACK                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │ React Native │───▶│   Railway    │───▶│   Supabase   │      │
│  │   (Expo)     │    │   (API)      │    │ (PostgreSQL) │      │
│  └──────────────┘    └──────────────┘    └──────────────┘      │
│         │                   │                    │               │
│         ▼                   ▼                    ▼               │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │   EAS Build  │    │   Cloudflare │    │   Supabase   │      │
│  │   (Gratis)   │    │   R2 (Store) │    │   Storage    │      │
│  └──────────────┘    └──────────────┘    └──────────────┘      │
│         │                   │                    │               │
│         ▼                   ▼                    ▼               │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │   Firebase   │    │   UptimeRobot│    │   Sentry     │      │
│  │   (FCM)      │    │   (Monitor)  │    │   (Errors)   │      │
│  └──────────────┘    └──────────────┘    └──────────────┘      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Stack de Producción (Todo Gratis)

| Componente | Servicio | Tier Gratis | Límites |
|------------|----------|-------------|---------|
| **API** | Railway | $5/mes crédito | 500 horas/mes |
| **BD** | Supabase | 500MB | 50K usuarios |
| **Storage** | Cloudflare R2 | 10GB | 1M requests/mes |
| **Mobile** | Expo EAS | Gratis | Builds ilimitados |
| **Push** | Firebase FCM | Gratis | Sin límite |
| **Monitoreo** | UptimeRobot | 50 checks | Cada 5 min |
| **Errores** | Sentry | 5K errors/mes | 1 usuario |
| **Auth** | Supabase Auth | 50K usuarios | Gratis |

---

## Paso 1: Supabase (Base de Datos + Auth + Storage)

### 1.1 Crear Cuenta
```
1. Ve a https://supabase.com
2. Click "Start your project"
3. Sign up con GitHub
4. Click "New Project"
5. Nombre: "church-planning"
6. Password: Genera uno fuerte (guárdalo)
7. Region: "East US" (más cercano)
8. Click "Create new project"
```

### 1.2 Obtener Credenciales
```
Ve a Settings → API:
- Project URL: https://xxxxx.supabase.co
- anon key: eyJhbGciOiJIUzI1NiIs...
- service_role key: eyJhbGciOiJIUzI1NiIs... (NUNCA exponer)
```

### 1.3 Ejecutar Schema
```sql
-- Ve a SQL Editor en Supabase
-- Copia el contenido de prisma/schema.prisma
-- Convierte a SQL manualmente o usa prisma db push
```

---

## Paso 2: Railway (API Backend)

### 2.1 Crear Cuenta
```
1. Ve a https://railway.app
2. Sign up con GitHub
3. Te dan $5 de crédito mensual (gratis)
```

### 2.2 Conectar Repositorio
```
1. Click "New Project"
2. Click "Deploy from GitHub repo"
3. Selecciona "church-planning"
4. Railway detecta automaticamente Node.js
```

### 2.3 Configurar Variables
```
Ve a Variables y agrega:
```
```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres
JWT_SECRET=[genera-uno-fuerte-32-chars]
JWT_EXPIRES_IN=7d
AWS_ACCESS_KEY_ID=[de-cloudflare-r2]
AWS_SECRET_ACCESS_KEY=[de-cloudflare-r2]
AWS_REGION=auto
S3_BUCKET_NAME=church-planning-files
FIREBASE_PROJECT_ID=[de-firebase]
FIREBASE_PRIVATE_KEY=[de-firebase]
FIREBASE_CLIENT_EMAIL=[de-firebase]
NODE_ENV=production
PORT=3000
```

### 2.4 Configurar Build
```
En Settings → Build:
- Build Command: npm install && npx prisma generate
- Start Command: node dist/server.js
```

---

## Paso 3: Cloudflare R2 (Storage)

### 3.1 Crear Cuenta
```
1. Ve a https://dash.cloudflare.com
2. Sign up (no necesita tarjeta)
3. Ve a R2 Object Storage
4. Click "Create bucket"
5. Nombre: "church-planning-files"
6. Location: Automatic
```

### 3.2 Obtener Credenciales
```
1. Ve a R2 → Manage R2 API Tokens
2. Click "Create API Token"
3. Nombre: "church-planning"
4. Permissions: Object Read & Write
5. Click "Create API Token"
6. Guarda:
   - Access Key ID
   - Secret Access Key
```

### 3.3 Configurar CORS
```json
[
  {
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

---

## Paso 4: Firebase (Push Notifications)

### 4.1 Crear Proyecto
```
1. Ve a https://console.firebase.google.com
2. Click "Add project"
3. Nombre: "church-planning"
4. Google Analytics: No (para ahorrar)
5. Click "Create project"
```

### 4.2 Configurar Android
```
1. Click "Android" icon
2. Package name: com.churchplanning.app
3. Download google-services.json
4. Ponlo en mobile/android/app/
```

### 4.3 Obtener Credenciales
```
1. Ve a Project Settings → Service accounts
2. Click "Generate new private key"
3. Guarda el JSON
4. Extrae:
   - project_id
   - private_key
   - client_email
```

---

## Paso 5: Expo EAS (Build Móvil)

### 5.1 Instalar EAS CLI
```bash
npm install -g eas-cli
```

### 5.2 Login
```bash
eas login
```

### 5.3 Configurar eas.json
```json
{
  "cli": { "version": ">= 5.0.0" },
  "build": {
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-services.json"
      }
    }
  }
}
```

### 5.4 Build
```bash
# Preview (para testing)
eas build --platform android --profile preview

# Production (para Play Store)
eas build --platform android --profile production
```

---

## Paso 6: Monitoreo y Observabilidad

### 6.1 UptimeRobot (Uptime)
```
1. Ve a https://uptimerobot.com
2. Sign up gratis
3. Click "Add New Monitor"
4. Type: HTTP(s)
5. URL: https://church-planning-api.up.railway.app/health
6. Interval: 5 minutes
7. Email: tu@email.com
```

### 6.2 Sentry (Errores)
```
1. Ve a https://sentry.io
2. Sign up gratis
3. Create project: Node.js
4. Copy DSN
5. Agrega al backend:
   npm install @sentry/node
```

### 6.3 Railway Logs
```
En Railway Dashboard:
- Ve a tu servicio
- Click "Logs"
- Filtra por errors
```

---

## Paso 7: Seguridad en Producción

### 7.1 Variables Seguras
```
NUNCA subir a Git:
- .env
- google-services.json
- service-account.json
- *.key, *.pem
```

### 7.2 .gitignore Actualizado
```gitignore
# Environment
.env
.env.local
.env.production

# Firebase
google-services.json
google-services.json

# AWS
*.key
*.pem

# Node
node_modules/
dist/
```

### 7.3 Headers de Seguridad
```javascript
// En server.ts
import helmet from 'helmet';
app.use(helmet());
```

### 7.4 Rate Limiting
```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // máximo 100 requests por IP
});

app.use(limiter);
```

---

## Paso 8: Deploy Completo

### 8.1 Backend (Railway)
```bash
# 1. Push a GitHub
git add .
git commit -m "Production ready"
git push

# 2. Railway auto-deploy
# Ve a Railway Dashboard → Deployments
```

### 8.2 Frontend (Expo)
```bash
# 1. Build APK
eas build --platform android --profile production

# 2. Submit a Play Store
eas submit --platform android
```

---

## Checklist de Producción

- [ ] Supabase: BD creada y configurada
- [ ] Railway: API desplegada y funcionando
- [ ] Cloudflare R2: Bucket creado
- [ ] Firebase: Proyecto configurado
- [ ] Expo: Build generado
- [ ] UptimeRobot: Monitoreo activo
- [ ] Sentry: Errores configurados
- [ ] .gitignore: Secrets excluidos
- [ ] HTTPS: Habilitado en Railway
- [ ] CORS: Configurado correctamente

---

## Costo Total: $0/mes

| Servicio | Costo |
|----------|-------|
| Railway | $0 (crédito $5) |
| Supabase | $0 |
| Cloudflare R2 | $0 |
| Firebase FCM | $0 |
| Expo EAS | $0 |
| UptimeRobot | $0 |
| Sentry | $0 |
| **Total** | **$0** |

---

## Escalabilidad

### Cuándo escalar:
- **1000 usuarios**: Todo gratis aún
- **5000 usuarios**: Supabase free tier suficiente
- **10000 usuarios**: Considerar Railway paid ($5/mes)
- **50000 usuarios**: Migrar a infraestructura dedicada

### Métricas a monitorear:
1. **UptimeRobot**: Disponibilidad > 99.9%
2. **Sentry**: Errores < 100/día
3. **Railway**: CPU < 80%, RAM < 80%
4. **Supabase**: Conexiones < 60 simultáneas
