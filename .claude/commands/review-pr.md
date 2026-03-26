---
description: "Revisa un pull request siguiendo los estándares de este proyecto (NestJS + TypeScript + Clean Architecture)"
argument-hint: "<número de PR>"
allowed-tools: ["Bash", "Read", "Glob", "Grep"]
---

# Revisar Pull Request

Revisa el pull request **#$ARGUMENTS** de este repositorio siguiendo los estándares del proyecto.

Responde siempre en español.

## Paso 0 — Resolver número de PR

Si `$ARGUMENTS` está vacío, detecta el PR de la rama activa:

```bash
gh pr view --json number,title 2>/dev/null || echo "No se encontró PR para la rama actual. Proporciona el número: /review-pr <número>"
```

Si se detecta un PR, usa ese número. Si no, detente y pide el número al usuario.

## Paso 1 — Recopilar información del PR

Ejecuta estos comandos en paralelo para obtener todo el contexto:

```bash
gh pr view $ARGUMENTS
```

```bash
gh pr diff $ARGUMENTS
```

```bash
gh pr view $ARGUMENTS --json title,body,author,baseRefName,headRefName,additions,deletions,changedFiles,commits
```

## Paso 2 — Criterios de revisión

Analiza el diff contra los siguientes estándares:

### 🔴 Problemas Críticos (bloqueantes — cierran el PR automáticamente)

**Seguridad (OWASP Top 10):**
- ¿Hay credenciales, API keys, tokens o secrets hardcodeados?
- ¿Hay inyección SQL, NoSQL o posibilidad de injection attacks?
- ¿Hay exposición de datos sensibles en logs, responses o errores?
- ¿Las rutas protegidas tienen Guards? ¿Se verifica correctamente la autorización?
- ¿Hay deserialización insegura o validación ausente en inputs externos?
- ¿Se usa `eval()`, `exec()` o funciones peligrosas con input del usuario?
- ¿Las variables de entorno sensibles se filtran en responses de la API?
- ¿Hay CORS mal configurado que exponga rutas internas?

**Errores que rompen funcionalidad:**
- ¿Hay código que claramente lanza excepciones no manejadas en flujos críticos?
- ¿Hay condiciones de race condition obvias en operaciones concurrentes?
- ¿Hay memory leaks detectables (subscriptions sin unsubscribe, conexiones sin cerrar)?
- ¿Se modifican datos en producción sin transacciones donde se requieren?

### 🟡 Advertencias (requieren revisión manual)

**Calidad y Clean Code:**
- ¿Las funciones/métodos tienen una sola responsabilidad (SRP)?
- ¿Hay código duplicado que debería abstraerse (DRY)?
- ¿Los nombres de variables, funciones y clases son descriptivos?
- ¿Hay funciones con más de 3-4 parámetros sin usar un objeto/DTO?
- ¿Hay lógica de negocio en controllers que debería estar en services?
- ¿Hay números o strings mágicos que deberían ser constantes o enums?

**NestJS Best Practices:**
- ¿Los DTOs usan `class-validator` para validación (`@IsString()`, `@IsNotEmpty()`, etc.)?
- ¿Se usa `ValidationPipe` globalmente o en los endpoints que lo requieren?
- ¿Los módulos están correctamente encapsulados (exports/imports)?
- ¿Los servicios se inyectan correctamente vía constructor DI?
- ¿Se usan interceptors/filters/guards en vez de lógica inline en controllers?
- ¿Los controllers solo orquestan — delegan todo al service?
- ¿Los errores usan `HttpException` o excepciones personalizadas de NestJS?
- ¿Las entidades de TypeORM/Prisma tienen las relaciones correctamente definidas?

**TypeScript:**
- ¿Se usa `any` donde debería haber un tipo explícito?
- ¿Hay `as unknown as X` o type assertions dudosas?
- ¿Las interfaces/types están bien definidos o se repiten estructuras?
- ¿Se usan tipos de retorno explícitos en funciones públicas?

**Performance:**
- ¿Hay consultas N+1 en loops (queries dentro de forEach/map)?
- ¿Las operaciones pesadas están correctamente asíncronas (async/await)?
- ¿Se cargan relaciones innecesarias (over-fetching con eager loading)?
- ¿Hay índices de BD que deberían crearse para los filtros usados?

### ✅ Aspectos Positivos

Reconoce explícitamente:
- Buenas abstracciones o patrones bien aplicados
- Manejo correcto de errores
- Tests bien escritos
- Seguridad correctamente implementada
- Código legible y bien nombrado

## Paso 3 — Determinar el veredicto

Aplica estos criterios **estrictamente**:

- **REQUIERE_CAMBIOS**: hay al menos 1 problema crítico (seguridad, funcionalidad rota)
- **APROBADO_CON_ADVERTENCIAS**: sin críticos, pero hay advertencias que el autor debe revisar
- **APROBADO_SIN_OBSERVACIONES**: el código cumple con todos los estándares

## Paso 4 — Escribir la revisión

Estructura tu revisión así:

```markdown
## 🔍 Revisión de PR — [título del PR] (#$ARGUMENTS)

**Autor:** @[autor] | **Rama:** `[head]` → `[base]` | **Cambios:** +[adiciones] -[eliminaciones] en [archivos] archivos

---

### ✅ Lo que está bien

[Lista de aspectos positivos, sé específico]

### ⚠️ Advertencias

[Para cada advertencia:]
**[ruta/archivo]:[línea]** — [Descripción del problema]

> 💡 Sugerencia: [corrección específica]

### 🚨 Crítico (bloquea el merge)

[Solo blockers de seguridad o funcionalidad — omitir sección si no hay ninguno]

**[ruta/archivo]:[línea]** — [Descripción del problema crítico]

> 🔧 Corrección requerida: [cómo debe corregirse]

---

_Revisión automática generada por Claude Code._
```

## Paso 5 — Publicar revisión y guardar resumen

Publica la revisión como comentario en el PR:

```bash
gh pr comment $ARGUMENTS --body "[contenido completo de la revisión]"
```

Guarda el resumen estructurado en `/tmp/pr_review_summary.txt` con este formato exacto (sin markdown):

```
VEREDICTO: APROBADO_SIN_OBSERVACIONES | APROBADO_CON_ADVERTENCIAS | REQUIERE_CAMBIOS
CRITICOS: Ninguno | <descripción corta separada por comas>
ADVERTENCIAS: Ninguna | <descripción corta separada por comas>
POSITIVOS: <aspectos positivos separados por comas>
```
