# Evidencias del examen

Sube **todo** a tu repositorio de GitHub antes de la hora límite.

## Carpeta `evidencias/`

Guarda aquí las capturas de pantalla (PNG o JPG):

| Archivo sugerido | Contenido |
|------------------|-----------|
| `lab1-dockerfile.png` | Tu `Dockerfile` en el editor |
| `lab1-docker-ps.png` | `docker ps` con el contenedor corriendo |
| `lab1-web-8080.png` | Navegador en `http://localhost:8080` |
| `lab2-pipeline-verde.png` | GitHub Actions en verde |
| `lab2-s3-web.png` | Bucket `mundial-web-*` con archivos |
| `lab2-url-s3-web.png` | Sitio estático funcionando |
| `lab3-s3-poleras.png` | Bucket `mundial-poleras-*` carpeta `poleras/` |
| `lab3-dynamodb.png` | Tabla con partidos |
| `lab3-lambdas.png` | Las 3 funciones Lambda creadas |
| `lab3-api-gateway.png` | API Gateway con rutas `/poleras`, `/partidos`, `/partidos/{id}` |
| `lab4-kubectl.png` | `kubectl get pods,svc -n mundial` |
| `lab4-web-30080.png` | Navegador en puerto `30080` |

## Archivo `curls.txt`

Pega la salida de los 3 endpoints del Lab 3:

```
curl https://TU_API.../prod/poleras
curl https://TU_API.../prod/partidos
curl https://TU_API.../prod/partidos/partido-001
```

## Archivo `urls.txt`

Anota las URLs de tu examen:

```
Repo GitHub: https://github.com/TU_USUARIO/mundial-cloud-exam
S3 web: http://mundial-web-TU_APELLIDO.s3-website-us-east-1.amazonaws.com
API Gateway: https://TU_API.execute-api.us-east-1.amazonaws.com/prod
K8s: http://<minikube-ip>:30080
```
