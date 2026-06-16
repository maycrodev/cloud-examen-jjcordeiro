# Lab 4 — Kubernetes: Pod + Service (20 pts)

Desplegar la **misma imagen Docker** del Lab 1 en un Pod y exponerla con un **Service NodePort** en el puerto **30080**.

> Solo recibes esta guía, `namespace.yaml` y `service.yaml`. **El `pod.yaml` no viene incluido** — debes crearlo tú.

---

## Archivos de ayuda en este lab

```
lab-k8s/
├── INSTRUCCIONES.md   ← estás aquí
├── namespace.yaml     ← namespace mundial
└── service.yaml       ← NodePort 30080
```

---

## Pre-requisitos

- Imagen `mundial-web:tu-nombre` del Lab 1
- Cluster local: minikube, kind o Docker Desktop K8s

```bash
minikube start
kubectl cluster-info
```

---

## Paso 1: Cargar imagen en el cluster

```bash
minikube image load mundial-web:tu-nombre
# kind: kind load docker-image mundial-web:tu-nombre
```

---

## Paso 2: Crear el Pod (tú lo haces)

Crea el archivo `lab-k8s/pod.yaml`.

### Qué debe tener tu Pod

| Campo | Valor |
|-------|-------|
| `kind` | `Pod` |
| `metadata.name` | `mundial-web-pod` |
| `metadata.namespace` | `mundial` |
| `metadata.labels.app` | `mundial-web` |
| `spec.containers[0].name` | `mundial-web` |
| `spec.containers[0].image` | `mundial-web:tu-nombre` (tu imagen del Lab 1) |
| `spec.containers[0].imagePullPolicy` | `IfNotPresent` |
| `spec.containers[0].ports` | `containerPort: 80` |

### Pista de estructura

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: mundial-web-pod
  namespace: mundial
  labels:
    app: mundial-web
spec:
  containers:
    - name: mundial-web
      image: mundial-web:tu-nombre
      imagePullPolicy: IfNotPresent
      ports:
        - containerPort: 80
```

> El label `app: mundial-web` debe coincidir con el `selector` de `service.yaml`.

---

## Paso 3: Aplicar manifiestos

```bash
kubectl apply -f lab-k8s/namespace.yaml
kubectl apply -f lab-k8s/pod.yaml
kubectl apply -f lab-k8s/service.yaml
kubectl get pods,svc -n mundial
```

Espera que el Pod esté `Running`.

---

## Paso 4: Validar en puerto publicado

**minikube:**
```bash
curl http://$(minikube ip):30080
```

**Docker Desktop K8s:**
```bash
curl http://localhost:30080
```

---

## Entrega en el repo

- `lab-k8s/pod.yaml` — **creado por ti**
- `lab-k8s/service.yaml`
- `entrega/evidencias/lab4-kubectl.png`
- `entrega/evidencias/lab4-web-30080.png`

## Errores comunes

| Error | Solución |
|-------|----------|
| `ImagePullBackOff` | `minikube image load ...` |
| Puerto no responde | Label `app: mundial-web` en Pod y selector en Service |
| Pod Pending | Cluster no activo |
| Service sin endpoints | Labels del Pod no coinciden con el selector |
