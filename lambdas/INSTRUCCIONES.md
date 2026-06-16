# Lab 3 — Instrucciones AWS (Lambdas + S3 + DynamoDB + API Gateway)

Recibirás solo los archivos **`handler.js`** y **`package.json`** de cada Lambda.  
Tú debes hacer el **`npm install`**, crear el **`.zip`** manualmente y desplegar todo desde la **consola AWS**.

Reemplaza `TU_APELLIDO` por tu identificador (apellido o carnet, minúsculas, sin espacios).

---

## Arquitectura final

```
Cliente
   │
   ▼
API Gateway (REST) ── stage: prod
   │
   ├── GET /poleras           → Lambda mundial-poleras           → S3
   ├── GET /partidos          → Lambda mundial-listar-partidos  → DynamoDB (Scan)
   └── GET /partidos/{id}     → Lambda mundial-obtener-partido  → DynamoDB (GetItem)
```

---

## 1. Crear bucket S3 (poleras)

| Campo | Valor |
|-------|-------|
| Nombre del bucket | `mundial-poleras-TU_APELLIDO` |
| Región | La misma que usarás para Lambda y API (ej. `us-east-1`) |
| Block Public Access | Puede quedar activado (la Lambda lee con IAM, no es sitio web) |

### Estructura dentro del bucket

```
mundial-poleras-TU_APELLIDO/
└── poleras/
    ├── argentina.svg
    ├── brasil.svg
    ├── mexico.svg
    └── espana.svg
```

Sube al menos **2 imágenes** (SVG o PNG) en la carpeta `poleras/`.

Puedes reutilizar los SVG de ejemplo en `app/images/poleras/` (los mismos que ves en la web en modo local).

**Verificar:**
```bash
aws s3 ls s3://mundial-poleras-TU_APELLIDO/poleras/
```

---

## 2. Crear tabla DynamoDB (partidos)

| Campo | Valor |
|-------|-------|
| Nombre de tabla | `MundialPartidos-TU_APELLIDO` |
| Partition key | `id` (String) |
| Capacidad | On-demand (pay per request) |

### Datos a cargar (mínimo 4 partidos)

Crea cada ítem en la consola DynamoDB → **Explore table items** → **Create item**:

| id | fecha | local | visitante | estadio | grupo |
|----|-------|-------|-----------|---------|-------|
| partido-001 | 2026-06-11 | México | Sudáfrica | Estadio Azteca | A |
| partido-002 | 2026-06-12 | Brasil | Marruecos | MetLife Stadium | B |
| partido-003 | 2026-06-13 | Argentina | Polonia | Hard Rock Stadium | C |
| partido-004 | 2026-06-14 | España | Japón | SoFi Stadium | D |
| partido-005 | 2026-06-15 | Alemania | Corea del Sur | AT&T Stadium | E |
| partido-006 | 2026-06-16 | Francia | Senegal | Mercedes-Benz Stadium | F |

> Todos los atributos son tipo **String**.

**Verificar:**
```bash
aws dynamodb scan --table-name MundialPartidos-TU_APELLIDO
```

---

## 3. Empaquetar cada Lambda (manual)

Tienes **3 carpetas**, cada una con `handler.js` y `package.json`:

```
lambdas/
├── poleras/
├── listar-partidos/
└── obtener-partido/
```

### Pasos (repetir para cada carpeta)

```bash
cd lambdas/poleras          # cambiar por listar-partidos u obtener-partido
npm install --omit=dev
zip -r poleras.zip handler.js package.json node_modules/
```

| Carpeta | Zip resultante |
|---------|----------------|
| `poleras/` | `poleras.zip` |
| `listar-partidos/` | `listar-partidos.zip` |
| `obtener-partido/` | `obtener-partido.zip` |

> El `.zip` debe tener `handler.js` y `node_modules/` en la **raíz** del zip (no dentro de una subcarpeta).

---

## 4. Crear las 3 Lambdas en consola

AWS → **Lambda** → **Create function** → Author from scratch

### Lambda 1 — Poleras (S3)

| Campo | Valor |
|-------|-------|
| Nombre | `mundial-poleras-TU_APELLIDO` |
| Runtime | Node.js 20.x |
| Archivo | `poleras.zip` |
| Handler | `handler.handler` |
| Variable de entorno | `BUCKET_NAME` = `mundial-poleras-TU_APELLIDO` |

**Permisos del rol:** lectura S3 (`s3:ListBucket`, `s3:GetObject`) sobre tu bucket.

**Test:** evento vacío `{}` → debe devolver JSON con `poleras` y `total`.

---

### Lambda 2 — Listar partidos (DynamoDB)

| Campo | Valor |
|-------|-------|
| Nombre | `mundial-listar-partidos-TU_APELLIDO` |
| Runtime | Node.js 20.x |
| Archivo | `listar-partidos.zip` |
| Handler | `handler.handler` |
| Variable de entorno | `TABLE_NAME` = `MundialPartidos-TU_APELLIDO` |

**Permisos del rol:** `dynamodb:Scan` sobre tu tabla.

**Test:** evento vacío `{}` → debe devolver `{ "partidos": [...], "total": N }`.

---

### Lambda 3 — Obtener partido (DynamoDB)

| Campo | Valor |
|-------|-------|
| Nombre | `mundial-obtener-partido-TU_APELLIDO` |
| Runtime | Node.js 20.x |
| Archivo | `obtener-partido.zip` |
| Handler | `handler.handler` |
| Variable de entorno | `TABLE_NAME` = `MundialPartidos-TU_APELLIDO` |

**Permisos del rol:** `dynamodb:GetItem` sobre tu tabla.

**Test:** usa este evento:

```json
{
  "pathParameters": {
    "id": "partido-001"
  }
}
```

→ debe devolver el partido México vs Sudáfrica.

---

## 5. Crear API Gateway

AWS → **API Gateway** → **Create API** → **REST API** (no private) → Build

| Campo | Valor |
|-------|-------|
| API name | `mundial-api-TU_APELLIDO` |
| Endpoint type | Regional |

### Recursos y métodos

Crea esta estructura:

```
/                           (raíz, ya existe)
├── poleras                 → GET  → Lambda: mundial-poleras
└── partidos                → GET  → Lambda: mundial-listar-partidos
    └── {id}                → GET  → Lambda: mundial-obtener-partido
```

#### Para cada método GET:

1. Selecciona el método **GET**
2. Integration type: **Lambda Function**
3. Activa **Lambda proxy integration** ✅
4. Selecciona la Lambda correspondiente
5. Guarda y confirma permiso a API Gateway

| Método | Ruta completa | Lambda integrada |
|--------|---------------|------------------|
| GET | `/poleras` | mundial-poleras-TU_APELLIDO |
| GET | `/partidos` | mundial-listar-partidos-TU_APELLIDO |
| GET | `/partidos/{id}` | mundial-obtener-partido-TU_APELLIDO |

> Al crear `{id}`: Resource name = `id`, Resource path = `/partidos/{id}`.

### Deploy

1. **Actions** → **Deploy API**
2. Deployment stage: **`prod`** (crear si no existe)
3. Copia la **Invoke URL**, por ejemplo:
   ```
   https://abc123xyz.execute-api.us-east-1.amazonaws.com/prod
   ```

### Cómo debe quedar API Gateway

```
Stage: prod
Base URL: https://{api-id}.execute-api.{region}.amazonaws.com/prod

Endpoints:
  GET /poleras
  GET /partidos
  GET /partidos/{id}
```

---

## 6. Probar los endpoints

```bash
curl https://TU_API.execute-api.us-east-1.amazonaws.com/prod/poleras
curl https://TU_API.execute-api.us-east-1.amazonaws.com/prod/partidos
curl https://TU_API.execute-api.us-east-1.amazonaws.com/prod/partidos/partido-001
```

### Respuestas esperadas (ejemplo)

**GET /poleras**
```json
{
  "poleras": [
    { "archivo": "argentina.svg", "url": "https://mundial-poleras-....s3.amazonaws.com/poleras/argentina.svg" }
  ],
  "total": 4
}
```

**GET /partidos**
```json
{
  "partidos": [
    { "id": "partido-001", "fecha": "2026-06-11", "local": "México", "visitante": "Sudáfrica", "estadio": "Estadio Azteca", "grupo": "A" }
  ],
  "total": 6
}
```

**GET /partidos/partido-001**
```json
{
  "id": "partido-001",
  "fecha": "2026-06-11",
  "local": "México",
  "visitante": "Sudáfrica",
  "estadio": "Estadio Azteca",
  "grupo": "A"
}
```

---

## 7. Errores comunes

| Error | Causa | Solución |
|-------|-------|----------|
| `Cannot find module '@aws-sdk/...'` | Zip sin `node_modules` | Volver a hacer `npm install` y zip |
| `AccessDenied` en Lambda | Rol sin permisos | Agregar política S3 o DynamoDB al rol |
| API 502 Bad Gateway | Sin Lambda proxy | Activar **Lambda proxy integration** |
| `poleras: []` vacío | Carpeta incorrecta en S3 | Archivos deben estar en `poleras/` |
| Partido 404 | ID no existe en DynamoDB | Verificar datos de la tabla |
| `BUCKET_NAME` / `TABLE_NAME` undefined | Falta variable de entorno | Configurar en Lambda → Configuration → Environment variables |

---

## 8. Entrega (en tu repo)

- Capturas: S3, DynamoDB, 3 Lambdas, API Gateway
- `entrega/curls.txt` con la salida de los 3 `curl`
- (Opcional) Los `.zip` **no** es necesario subirlos al repo
