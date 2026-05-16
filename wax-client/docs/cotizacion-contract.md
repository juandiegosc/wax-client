# Contrato técnico — Flujo de Cotización

## ¿Qué dispara esto?

Cuando el usuario hace clic en **"Enviar a cotizar"** dentro del Atelier, el frontend hace un POST automático al webhook de n8n `/meshy-cotizar`.

---

## Payload que recibe n8n (desde el frontend)

```json
{
  "glbUrl": "https://assets.meshy.ai/.../model.glb",
  "taskId": "018f3a...",
  "description": "Resumen del diseño generado por la IA (incluye material, color, forma y dimensiones)"
}
```

---

## Objeto final que llega a tu endpoint (después del parseo en n8n)

n8n procesa el `description` con OpenAI y te entrega el objeto estructurado listo para guardar en BD:

```json
{
  "taskId": "018f3a-xxxx-xxxx",
  "glbUrl": "https://assets.meshy.ai/.../model.glb",
  "rawDescription": "Bolsa clutch en cuero negro con herrajes dorados, 25x15cm, forma rectangular",
  "design": {
    "type": "bolsa clutch",
    "material": "cuero negro",
    "color": "negro",
    "shape": "rectangular",
    "dimensions": "25x15cm",
    "details": "herrajes dorados"
  }
}
```

| Campo | Tipo | Descripción |
|---|---|---|
| `taskId` | `string` | ID único de la tarea en Meshy |
| `glbUrl` | `string` | URL del archivo 3D en formato GLB |
| `rawDescription` | `string` | Texto original del resumen de la IA |
| `design.type` | `string` | Tipo de accesorio |
| `design.material` | `string` | Material principal |
| `design.color` | `string` | Color o tono |
| `design.shape` | `string` | Forma y estructura |
| `design.dimensions` | `string` | Dimensiones aproximadas |
| `design.details` | `string` | Detalles decorativos (`null` si no se mencionaron) |

> Los valores de `design` están en el idioma del cliente (español). Los keys están en inglés.

---

## ¿Qué puedes hacer con el taskId?

Con el `taskId` puedes re-consultar el modelo en la API de Meshy en cualquier momento:

**Modelo generado por texto:**
```
GET https://api.meshy.ai/v2/text-to-3d/{taskId}
Authorization: Bearer TU_API_KEY
```

**Modelo generado por imagen:**
```
GET https://api.meshy.ai/openapi/v1/image-to-3d/{taskId}
Authorization: Bearer TU_API_KEY
```

La respuesta incluye las URLs del modelo en todos los formatos (GLB, FBX, OBJ), thumbnail y metadata.

---

## Retención de modelos en Meshy

> **Importante:** Meshy elimina los modelos automáticamente después de **3 días** en planes no Enterprise.

| Plan | Retención |
|---|---|
| Estándar | 3 días |
| Enterprise | Indefinida |

**Recomendación:** al recibir la cotización, descargar el GLB desde `glbUrl` y guardarlo en tu propio storage (S3, Cloudinary, etc.) para no perderlo después de 3 días.

---

## Flujo completo de referencia

```
Usuario confirma diseño en chat
        ↓
Frontend genera modelo 3D via Meshy (preview > refine)
        ↓
Usuario hace clic en "Enviar a cotizar"
        ↓
POST /meshy-cotizar → { glbUrl, taskId, description }
        ↓
n8n parsea description con OpenAI
        ↓
Tu endpoint recibe { taskId, glbUrl, rawDescription, design }
```

---

## Contacto

Dudas sobre el frontend: **Danni** — danniamora.gh@gmail.com
