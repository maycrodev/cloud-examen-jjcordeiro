# Examen Final — FIFA Data Recovery (Copa del Mundo 2026)

**Computación en la Nube · UCB**  
**Tiempo:** 70 minutos · **Enfoque:** despliegue (no programación)

---

## Escenario

La FIFA perdió el acceso centralizado a los datos del Mundial 2026. Las federaciones necesitan **endpoints urgentes** para consultar:

- **Partidos** (calendario y detalle por equipo)
- **Poleras oficiales** (catálogo de diseños almacenados en S3)

Tu misión: desplegar la infraestructura para entregar esos datos. El código de la web y las Lambdas **ya está hecho**. Tú debes:

1. Containerizar la web (Dockerfile)
2. Publicarla en S3 con GitHub Actions
3. Crear los endpoints en AWS (consola)
4. Desplegarla en Kubernetes con **puerto publicado** para validación

---

## Puntuación (sobre 100)

| Lab | Tema | Pts | Tiempo |
|-----|------|-----|--------|
| 1 | Docker — crear tu `Dockerfile` | **30** | 15 min |
| 2 | GitHub Actions — subir web a S3 | **10** | 10 min |
| 3 | AWS — S3, DynamoDB, 3 Lambdas, API Gateway | **40** | 25 min |
| 4 | Kubernetes — Pod + Service en puerto | **20** | 10 min |
| | **Total** | **100** | |

---

## Requisitos previos

- Docker, cuenta AWS, cuenta GitHub
- `kubectl` + cluster local (minikube, kind o Docker Desktop K8s)
- Node.js/npm (solo para empaquetar Lambdas)

```bash
git clone <URL-DEL-REPO>
cd examen-final
```

---

## Estructura del proyecto

```
examen-final/
├── app/                      # Lab 1–4 — Web (ver app/INSTRUCCIONES.md)
├── lab-pipeline/             # Lab 2 — INSTRUCCIONES + bucket policy (workflow: tú lo creas)
├── lambdas/                  # Lab 3 — Lambdas AWS (handler.js + package.json)
├── lab-k8s/                  # Lab 4 — Manifiestos Kubernetes
└── entrega/                  # Evidencias del examen
```

| Lab | Carpeta | Qué haces |
|-----|---------|-----------|
| 1 | `app/` | Crear `Dockerfile` y correr contenedor |
| 2 | `lab-pipeline/` | Crear workflow `.yml`, configurar S3 y secrets |
| 3 | `lambdas/` | `npm i`, zip manual, consola AWS |
| 4 | `lab-k8s/` | Crear `pod.yaml`, aplicar manifiestos |

---

# Lab 1 — Docker (30 pts)

**Objetivo:** Escribir tu propio `Dockerfile` y correr la web en un contenedor.

> **Guía de la carpeta `app/`:** [`app/INSTRUCCIONES.md`](app/INSTRUCCIONES.md) — explica cómo esta misma web se usa en los Labs 1, 2, 3 y 4.

### Archivos en `app/`

`index.html`, `style.css`, `app.js`, `config.js`, `images/` — app estática del Mundial.

### Pasos

1. Crea `app/Dockerfile` (no viene incluido)

**Pistas:**
- Imagen base con servidor web (`nginx:alpine`)
- Copia los archivos estáticos (`html`, `css`, `js`, carpeta `images/`) a nginx
- Tip: `COPY . /usr/share/nginx/html/` con `.dockerignore` para excluir el Dockerfile
- `EXPOSE 80`
- Comando de arranque de nginx

2. Construir y ejecutar:

```bash
cd app
docker build -t mundial-web:tu-nombre .
docker run -d --name mundial-web -p 8080:80 mundial-web:tu-nombre
```

3. Verificar: `http://localhost:8080` → debe verse **Copa del Mundo 2026**

> Guarda el nombre de tu imagen. La usarás en el Lab 4.

### Entrega Lab 1

Sube al repo:

- `app/Dockerfile` (creado por ti)
- `entrega/evidencias/lab1-docker-ps.png`
- `entrega/evidencias/lab1-web-8080.png`

---

# Lab 2 — GitHub Actions + S3 (10 pts)

> **Guía completa:** [`lab-pipeline/INSTRUCCIONES.md`](lab-pipeline/INSTRUCCIONES.md)

**Objetivo:** Publicar `app/` en S3 con pipeline al hacer push a `main`.

### Resumen

1. **Crear** `.github/workflows/deploy-web-s3.yml` (no viene incluido — ver pistas en la guía)
2. Crear bucket `mundial-web-TU_APELLIDO` con hosting estático
3. Configurar secrets en GitHub (`AWS_*`, `S3_BUCKET_WEB`)
4. Push a `main` → pipeline en verde

### Entrega Lab 2

- `.github/workflows/deploy-web-s3.yml` — **creado por ti**
- `entrega/evidencias/lab2-pipeline-verde.png`
- `entrega/evidencias/lab2-s3-web.png`
- `entrega/urls.txt` con URL del sitio S3

---

# Lab 3 — AWS: endpoints para federaciones (40 pts)

**Objetivo:** Crear desde la **consola AWS** los endpoints que la FIFA entregará a los equipos.

> **Guía detallada:** [`lambdas/INSTRUCCIONES.md`](lambdas/INSTRUCCIONES.md)  
> Solo recibes `handler.js` y `package.json`. Tú haces `npm install` y el `.zip` manualmente.

```
GET /poleras          → Lambda poleras        → S3
GET /partidos         → Lambda listar-partidos → DynamoDB
GET /partidos/{id}    → Lambda obtener-partido → DynamoDB
```

### Resumen rápido

1. **S3** → bucket `mundial-poleras-TU_APELLIDO` con carpeta `poleras/`
2. **DynamoDB** → tabla `MundialPartidos-TU_APELLIDO`, clave `id`, cargar partidos
3. **Lambdas** → `npm install` + `zip` manual en cada carpeta → subir a consola
4. **API Gateway** → REST API con 3 rutas GET y Lambda proxy
5. **Probar** con `curl` los 3 endpoints

### Empaquetar Lambdas (manual)

```bash
cd lambdas/poleras
npm install --omit=dev
zip -r poleras.zip handler.js package.json node_modules/
```

Repite para `listar-partidos` y `obtener-partido`.

### Probar endpoints

```bash
curl https://TU_API.execute-api.us-east-1.amazonaws.com/prod/poleras
curl https://TU_API.execute-api.us-east-1.amazonaws.com/prod/partidos
curl https://TU_API.execute-api.us-east-1.amazonaws.com/prod/partidos/partido-001
```

### Conectar la web (recomendado)

Edita `app/config.js` con las URLs de tu API y vuelve a desplegar (push → pipeline Lab 2, o rebuild Docker). Ver `app/INSTRUCCIONES.md`.

### Entrega Lab 3

Sube al repo:

- `entrega/evidencias/lab3-s3-poleras.png` — bucket con carpeta `poleras/`
- `entrega/evidencias/lab3-dynamodb.png` — tabla con partidos
- `entrega/evidencias/lab3-lambdas.png` — 3 Lambdas (`mundial-poleras`, `listar-partidos`, `obtener-partido`)
- `entrega/evidencias/lab3-api-gateway.png` — rutas `/poleras`, `/partidos`, `/partidos/{id}`
- `entrega/curls.txt` — salida de los 3 `curl`

---

# Lab 4 — Kubernetes (20 pts)

> **Guía completa:** [`lab-k8s/INSTRUCCIONES.md`](lab-k8s/INSTRUCCIONES.md)

**Objetivo:** Desplegar la imagen del Lab 1 en un Pod + Service NodePort **30080**.

### Resumen

```bash
minikube image load mundial-web:tu-nombre
# Crear lab-k8s/pod.yaml (ver pistas en la guía)
kubectl apply -f lab-k8s/
curl http://$(minikube ip):30080
```

### Entrega Lab 4

- `lab-k8s/pod.yaml` — **creado por ti**
- `lab-k8s/service.yaml`
- `entrega/evidencias/lab4-kubectl.png`
- `entrega/evidencias/lab4-web-30080.png`

---

## Entrega final — repositorio GitHub

**Todo el examen se entrega en un único repositorio de GitHub.** El docente clonará tu repo para evaluar. Antes de la hora límite, verifica que hayas hecho `git push` con todo lo siguiente:

### Código y configuración (en el repo)

| Qué | Ruta |
|-----|------|
| Dockerfile propio | `app/Dockerfile` |
| Pipeline GitHub Actions | `.github/workflows/deploy-web-s3.yml` |
| Manifiestos K8s | `lab-k8s/pod.yaml` (creado por ti), `lab-k8s/service.yaml` |
| URLs del examen | `entrega/urls.txt` |
| Salida de curls API | `entrega/curls.txt` |

### Evidencias (capturas en el repo)

Carpeta `entrega/evidencias/` con capturas de:

- [ ] **Lab 1:** `docker ps` + web en `:8080`
- [ ] **Lab 2:** pipeline en verde + bucket S3 web + sitio funcionando
- [ ] **Lab 3:** S3 poleras + DynamoDB + 3 Lambdas + API Gateway
- [ ] **Lab 4:** `kubectl get pods,svc -n mundial` + web en puerto `30080`

### Comandos para subir todo

```bash
git add app/Dockerfile
git add .github/workflows/
git add lab-k8s/
git add entrega/
git commit -m "Entrega examen final - TU_NOMBRE"
git push origin main
```

### Checklist rápido (100 pts)

- [ ] Lab 1 (30): `Dockerfile` + contenedor + `:8080`
- [ ] Lab 2 (10): pipeline verde + web publicada en S3
- [ ] Lab 3 (40): endpoints `/poleras`, `/partidos`, `/partidos/{id}` con curls en `entrega/curls.txt`
- [ ] Lab 4 (20): Pod `Running` + Service + `:30080`
- [ ] Repo completo pusheado a GitHub con código y evidencias

> Ver plantilla detallada en `entrega/README.md`

---

## Ayuda rápida

| Problema | Solución |
|----------|----------|
| Puerto 8080 ocupado | `docker run -p 9090:80 ...` |
| Lambda "Cannot find module" | Incluir `node_modules` en el zip (ver `lambdas/INSTRUCCIONES.md`) |
| API 502 | Activar Lambda Proxy integration |
| ImagePullBackOff | `minikube image load ...` |
| K8s puerto no responde | Verifica Service selector `app: mundial-web` |
| Pipeline AccessDenied | Permisos IAM en bucket web |

¡Buena suerte! ⚽

---

> **Nota docente:** Las respuestas y rúbrica detallada están en `solucion/` (carpeta en `.gitignore`, no se sube al repo de los alumnos).
