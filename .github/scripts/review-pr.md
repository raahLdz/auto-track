---
description: "Revisa un pull request siguiendo los estándares de arquitectura de este proyecto (DDD Lite + Clean Architecture + Riverpod)"
argument-hint: "<número de PR>"
allowed-tools: ["Bash", "Read", "Glob", "Grep"]
---

# Revisar Pull Request

Revisa el pull request **#$ARGUMENTS** de este repositorio siguiendo los estándares de arquitectura del proyecto.

Responde siempre en español.

## Paso 0 — Resolver número de PR

Si `$ARGUMENTS` está vacío, detecta el PR de la rama activa:

```bash
gh pr view --repo BAP-Corporativo/FinvaApp --json number,title 2>/dev/null || echo "No se encontró PR para la rama actual. Proporciona el número: /review-pr <número>"
```

Si se detecta un PR, usa ese número. Si no, detente y pide el número al usuario.

## Paso 1 — Recopilar información del PR

Ejecuta estos comandos en paralelo para obtener todo el contexto:

```bash
gh pr view $ARGUMENTS --repo BAP-Corporativo/FinvaApp
```

```bash
gh pr diff $ARGUMENTS --repo BAP-Corporativo/FinvaApp
```

```bash
gh pr view $ARGUMENTS --repo BAP-Corporativo/FinvaApp --json title,body,author,baseRefName,headRefName,additions,deletions,changedFiles,commits
```

## Paso 2 — Criterios de revisión

Analiza el diff contra los siguientes estándares (definidos en CLAUDE.md):

**Arquitectura & DDD Lite:**

- ¿El código respeta la estructura feature-first (`data/`, `domain/`, `presentation/`)?
- ¿Hay lógica de negocio filtrándose hacia providers o screens?
- ¿Se usan Value Objects en lugar de primitivos crudos (String, double) para conceptos de dominio?
- ¿`domain/` es Dart puro (sin imports de Flutter, freezed ni Dio)?
- ¿Las nuevas features están bajo `lib/features/<nombre>/` con el layering correcto?

**Capas de Clean Architecture:**

- ¿`data/` mapea correctamente DTOs → Entities/Aggregates en `toEntity()`/`toAggregate()`?
- ¿Los repositorios retornan `Result<T>` envolviendo `Failure` para errores de infraestructura?
- ¿Los agregados lanzan `DomainException` para violaciones de reglas de negocio?
- ¿Hay llamadas HTTP directas en providers? (prohibido — deben ir a través del repositorio)
- ¿Se usa `ApiClient` en lugar de Dio crudo?

**Riverpod:**

- ¿Los Notifiers actúan como Application Services (validar → ejecutar → emitir evento)?
- ¿El estado se gestiona exclusivamente a través de Riverpod (sin estado global mutable)?
- ¿Se usa el tipo de provider correcto? (`AsyncNotifierProvider` para estado async con mutaciones, `FutureProvider` para datos de solo lectura, etc.)
- ¿Se usa `ref.watch` en `build()` y `ref.read` solo en callbacks/métodos?

**Calidad de código:**

- ¿Hay imports cruzados entre features? (los features NO deben importar de otros features)
- ¿Hay errores sin tipar (excepciones crudas sin `Result<T>` o `DomainException`)?
- ¿Los DTOs usan `@freezed`? ¿Las entidades de dominio son Dart puro?
- ¿Se siguen las convenciones de nombres? (`<Name>Dto`, `<Name>Entity`, `<Name>Aggregate`, `<Name>RepositoryImpl`, `<Name>RemoteDataSource`)
- ¿Hay strings o números mágicos que deberían ser constantes?

**Buenas prácticas Flutter/Dart avanzadas:**

- ¿Se usan constructores `const` en widgets donde es posible?
- ¿Hay rebuilds innecesarios? (usar `select()` para observar solo el campo necesario)
- ¿Se usa `context` después de un `await` sin verificar `mounted`?
- ¿Los widgets están correctamente descompuestos en piezas pequeñas?
- ¿Se hace `dispose()` de controllers (TextEditingController, AnimationController, etc.)?
- ¿Se usa `ListView.builder` en listas largas?
- ¿Se usan `keys` correctamente en listas dinámicas?
- ¿`ConsumerWidget` vs `ConsumerStatefulWidget` se usa correctamente? (StatefulWidget solo cuando se necesita ciclo de vida)

## Paso 3 — Escribir la revisión

Estructura tu revisión así (en español):

```markdown
## 🔍 Revisión de PR — [título del PR] (#$ARGUMENTS)

**Autor:** @[autor] | **Rama:** `[head]` → `[base]` | **Cambios:** +[adiciones] -[eliminaciones] en [archivos] archivos

---

### ✅ Lo que está bien

[Lista de aspectos positivos]

### ⚠️ Problemas encontrados

[Para cada problema:]
**[ruta/archivo]:[rango de líneas]** — [Descripción del problema]

> Sugerencia: [corrección específica o recomendación]

### 🚨 Crítico (debe corregirse antes del merge)

[Solo blockers — omitir sección si no hay ninguno]

---

_Revisión realizada por Claude Code siguiendo los estándares de CLAUDE.md de Mobile | BAP-Corporativo._
```

## Paso 4 — Publicar la revisión como comentario en el PR

Publica la revisión directamente en el PR:

```bash
gh pr comment $ARGUMENTS --repo BAP-Corporativo/FinvaApp --body "[contenido de la revisión]"
```

Si **no se encontraron problemas**, publica una aprobación corta:

```bash
gh pr comment $ARGUMENTS --repo BAP-Corporativo/FinvaApp --body "## ✅ PR Revisado — Sin problemas

Cumple correctamente con los estándares de arquitectura de CLAUDE.md.

*Revisión realizada por Claude Code — BAP-Corporativo/FinvaApp.*"
```
