# Lab 1 — Carpeta `app/` (Web del Mundial)

Esta misma carpeta se usa en **varios labs**. Léela completa antes de empezar.

---

## Archivos incluidos

```
app/
├── INSTRUCCIONES.md   ← estás aquí
├── index.html         # Página principal
├── style.css          # Estilos
├── app.js             # Lógica (tabla partidos, poleras, API)
├── config.js          # URLs del API Gateway (completar en Lab 3)
├── images/            # Iconos y poleras de ejemplo (modo local)
└── Dockerfile         # ⚠️ NO incluido — lo creas tú (Lab 1)
```

---

## Uso por lab

| Lab | Qué haces con `app/` |
|-----|----------------------|
| **1 — Docker** | Creas `Dockerfile`, construyes imagen y corres contenedor en `:8080` |
| **2 — Pipeline + S3** | El pipeline sube **toda esta carpeta** al bucket S3 (sin Dockerfile) |
| **3 — AWS** | Completas `config.js` con tus URLs de API Gateway y vuelves a desplegar |
| **4 — Kubernetes** | Usas la **misma imagen Docker** del Lab 1 en un Pod |

---

## Lab 1 — Docker (30 pts)

### Crear `Dockerfile`

Debe servir los archivos estáticos con nginx (u otro servidor web).

**Pistas:**
- Imagen base: `nginx:alpine`
- Copiar `index.html`, `style.css`, `app.js`, `config.js` y carpeta `images/`
- Tip: `COPY . /usr/share/nginx/html/` + `.dockerignore` para excluir Dockerfile
- `EXPOSE 80`

### Comandos

```bash
cd app
docker build -t mundial-web:tu-nombre .
docker run -d --name mundial-web -p 8080:80 mundial-web:tu-nombre
```

Verifica: `http://localhost:8080`

> Guarda el nombre de la imagen (`mundial-web:tu-nombre`) para el Lab 4.

---

## Lab 2 — Pipeline publica `app/` en S3 (10 pts)

El workflow que **tú creas** en `.github/workflows/` debe hacer:

```bash
aws s3 sync app/ s3://TU_BUCKET/ --exclude "Dockerfile" --delete
```

**No necesitas cambiar código en `app/`** para este lab. Solo:

1. Crear el workflow (ver `lab-pipeline/INSTRUCCIONES.md`)
2. Configurar bucket S3 y secrets en GitHub
3. Push a `main` → la web queda publicada en S3

La web en S3 mostrará datos **locales de ejemplo** hasta que completes el Lab 3.

---

## Lab 3 — Conectar `config.js` con API Gateway (parte del Lab 3)

Cuando tengas tu API desplegada, edita `config.js`:

```javascript
const API_PARTIDOS = "https://TU_API.execute-api.us-east-1.amazonaws.com/prod/partidos";
const API_PARTIDO_ID = "https://TU_API.execute-api.us-east-1.amazonaws.com/prod/partidos";
const API_POLERAS = "https://TU_API.execute-api.us-east-1.amazonaws.com/prod/poleras";
```

Luego **vuelve a desplegar**:

- **Opción A:** `git push` → el pipeline del Lab 2 actualiza S3
- **Opción B:** reconstruir Docker del Lab 1 si quieres ver la API en el contenedor local

### Qué cambia en la web

| Sección | Sin API (vacío) | Con API configurada |
|---------|-----------------|---------------------|
| Partidos | Tabla con datos de ejemplo | Datos desde DynamoDB vía Lambda |
| Detalle partido | Busca en datos locales | Consulta `GET /partidos/{id}` |
| Poleras | Imágenes locales en `images/` | Catálogo desde S3 vía Lambda |

Guía completa AWS: `lambdas/INSTRUCCIONES.md`

---

## Lab 4 — Kubernetes (20 pts)

No modificas archivos en `app/`. Reutilizas la imagen del Lab 1:

```bash
minikube image load mundial-web:tu-nombre
```

Creas `lab-k8s/pod.yaml` apuntando a esa imagen. Ver `lab-k8s/INSTRUCCIONES.md`.

---

## Modo local (sin API)

Si `config.js` tiene las URLs vacías, la web funciona igual con datos de ejemplo para que puedas probar el Lab 1 sin AWS.

---

## Entrega relacionada con `app/`

- [ ] `app/Dockerfile` (Lab 1)
- [ ] Web funcionando en Docker `:8080`
- [ ] Web publicada en S3 (Lab 2)
- [ ] `config.js` con URLs del API (Lab 3, recomendado)
- [ ] Misma app en K8s puerto `30080` (Lab 4)
