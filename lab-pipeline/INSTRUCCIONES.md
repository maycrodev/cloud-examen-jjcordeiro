# Lab 2 — GitHub Actions + S3 (10 pts)

Publicar la carpeta `app/` en un bucket S3 usando un **pipeline de GitHub Actions que tú debes crear**.

> Solo recibes esta guía y la plantilla de bucket policy. **El workflow `.yml` no viene incluido** — debes escribirlo tú.

---

## Archivos de ayuda en este lab

```
lab-pipeline/
├── INSTRUCCIONES.md          ← estás aquí
└── s3-web-bucket-policy.json ← plantilla de bucket policy
```

---

## Paso 1: Crear el workflow (tú lo haces)

Crea el archivo `.github/workflows/deploy-web-s3.yml` en tu repo.

GitHub Actions solo ejecuta workflows dentro de `.github/workflows/`.

### Qué debe hacer tu pipeline

| Requisito | Detalle |
|-----------|---------|
| Disparador | Push a rama `main` (cambios en `app/`) |
| Runner | `ubuntu-latest` |
| Credenciales AWS | Usar secrets `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION` |
| Deploy | `aws s3 sync app/` al bucket del secret `S3_BUCKET_WEB` |
| Excluir | No subir `Dockerfile` ni `.dockerignore` |

### Pistas de estructura

```yaml
name: Deploy Web to S3

on:
  push:
    branches: [main]
    paths:
      - "app/**"

jobs:
  deploy-web:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      # 1. Configurar credenciales AWS (aws-actions/configure-aws-credentials@v4)
      # 2. aws s3 sync app/ s3://${{ secrets.S3_BUCKET_WEB }}/ ...
```

**Actions útiles:**
- `actions/checkout@v4` — clonar el repo
- `aws-actions/configure-aws-credentials@v4` — login AWS con secrets
- Comando: `aws s3 sync app/ s3://BUCKET/ --exclude "Dockerfile" --delete`

```bash
mkdir -p .github/workflows
# Crea y edita deploy-web-s3.yml
git add .github/workflows/deploy-web-s3.yml
git commit -m "Agregar pipeline S3"
```

---

## Paso 2: Crear bucket S3 para la web

| Campo | Valor |
|-------|-------|
| Nombre | `mundial-web-TU_APELLIDO` |
| Región | `us-east-1` (o la de tus secrets) |

1. Desactiva **Block all public access**
2. **Static website hosting** → Enable → Index: `index.html`
3. **Bucket policy** → usa `lab-pipeline/s3-web-bucket-policy.json` (reemplaza `TU_BUCKET_WEB`)

---

## Paso 3: Subir el proyecto a GitHub

```bash
git init
git add .
git commit -m "Examen mundial cloud"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/mundial-cloud-exam.git
git push -u origin main
```

---

## Paso 4: Configurar secrets

Repo → **Settings** → **Secrets and variables** → **Actions**

| Secret | Valor |
|--------|-------|
| `AWS_ACCESS_KEY_ID` | tu access key |
| `AWS_SECRET_ACCESS_KEY` | tu secret key |
| `AWS_REGION` | `us-east-1` |
| `S3_BUCKET_WEB` | `mundial-web-TU_APELLIDO` |

---

## Paso 5: Disparar el pipeline

```bash
git commit --allow-empty -m "trigger deploy"
git push
```

O en GitHub → **Actions** → tu workflow → **Run workflow**.

---

## Paso 6: Verificar

- Job en verde en GitHub Actions
- Archivos en S3: `index.html`, `style.css`, `app.js`, `images/`
- URL: `http://mundial-web-TU_APELLIDO.s3-website-us-east-1.amazonaws.com`

---

## Entrega en el repo

- `.github/workflows/deploy-web-s3.yml` — **creado por ti**
- `entrega/evidencias/lab2-pipeline-verde.png`
- `entrega/evidencias/lab2-s3-web.png`
- `entrega/urls.txt` con la URL del sitio

## Errores comunes

| Error | Solución |
|-------|----------|
| Workflow no aparece | ¿Está en `.github/workflows/`? |
| `AccessDenied` | Revisa secrets y permisos IAM del usuario |
| No sube archivos | Verifica nombre del secret `S3_BUCKET_WEB` |
| Sube el Dockerfile | Agrega `--exclude "Dockerfile"` al sync |
