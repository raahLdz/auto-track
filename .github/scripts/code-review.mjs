import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = process.env.REPO_OWNER;
const REPO_NAME = process.env.REPO_NAME;
const PR_NUMBER = process.env.PR_NUMBER;
const BASE_SHA = process.env.BASE_SHA;
const HEAD_SHA = process.env.HEAD_SHA;

const GITHUB_API = 'https://api.github.com';

async function githubRequest(path, options = {}) {
  const response = await fetch(`${GITHUB_API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GitHub API error ${response.status}: ${text}`);
  }

  return response.json();
}

async function getPRDiff() {
  const response = await fetch(
    `${GITHUB_API}/repos/${REPO_OWNER}/${REPO_NAME}/compare/${BASE_SHA}...${HEAD_SHA}`,
    {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3.diff',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to get PR diff: ${response.status}`);
  }

  return response.text();
}

async function getPRFiles() {
  return githubRequest(
    `/repos/${REPO_OWNER}/${REPO_NAME}/pulls/${PR_NUMBER}/files`
  );
}

async function postReviewComment(body) {
  return githubRequest(
    `/repos/${REPO_OWNER}/${REPO_NAME}/issues/${PR_NUMBER}/comments`,
    {
      method: 'POST',
      body: JSON.stringify({ body }),
    }
  );
}

async function deletePreviousReviews() {
  const comments = await githubRequest(
    `/repos/${REPO_OWNER}/${REPO_NAME}/issues/${PR_NUMBER}/comments`
  );

  const previousReviews = comments.filter(
    (c) =>
      c.user.login === 'github-actions[bot]' &&
      c.body.includes('🤖 **Claude Code Review**')
  );

  for (const comment of previousReviews) {
    await githubRequest(
      `/repos/${REPO_OWNER}/${REPO_NAME}/issues/comments/${comment.id}`,
      { method: 'DELETE' }
    );
  }
}

async function runCodeReview() {
  console.log(`Running code review for PR #${PR_NUMBER}...`);

  const [diff, files] = await Promise.all([getPRDiff(), getPRFiles()]);

  const MAX_DIFF_LENGTH = 80000;
  const truncatedDiff =
    diff.length > MAX_DIFF_LENGTH
      ? diff.slice(0, MAX_DIFF_LENGTH) + '\n\n[... diff truncado por ser muy largo ...]'
      : diff;

  const filesSummary = files
    .map((f) => `- ${f.filename} (+${f.additions} -${f.deletions})`)
    .join('\n');

  const stream = client.messages.stream({
    model: 'claude-opus-4-6',
    max_tokens: 4096,
    thinking: { type: 'adaptive' },
    system: `Eres un experto en code review con amplio conocimiento en TypeScript, NestJS, Node.js y buenas prácticas de software.
Tu tarea es revisar el código de los pull requests y proporcionar feedback constructivo, claro y accionable.

Debes revisar:
1. **Calidad de código**: legibilidad, mantenibilidad, patrones de diseño, principios SOLID
2. **Seguridad**: vulnerabilidades OWASP, inyección, exposición de datos sensibles, autenticación/autorización
3. **Buenas prácticas**: nomenclatura, estructura, DRY, separación de responsabilidades
4. **Performance**: consultas N+1, uso ineficiente de recursos, memory leaks
5. **Errores potenciales**: edge cases, manejo de errores, null checks

Formatea tu respuesta en Markdown con secciones claras. Sé específico citando líneas o archivos cuando sea posible.
Si no hay problemas significativos, dilo claramente. Prioriza los issues de mayor a menor impacto.`,
    messages: [
      {
        role: 'user',
        content: `## Pull Request #${PR_NUMBER}

**Archivos modificados:**
${filesSummary}

**Diff completo:**
\`\`\`diff
${truncatedDiff}
\`\`\`

Por favor realiza un code review completo de estos cambios.`,
      },
    ],
  });

  let reviewText = '';
  for await (const event of stream) {
    if (
      event.type === 'content_block_delta' &&
      event.delta.type === 'text_delta'
    ) {
      reviewText += event.delta.text;
      process.stdout.write(event.delta.text);
    }
  }

  await stream.finalMessage();

  const comment = `## 🤖 **Claude Code Review**

> Revisión automática generada por Claude Opus 4.6 para el commit \`${HEAD_SHA.slice(0, 7)}\`

---

${reviewText}

---
<sub>Generado automáticamente · [Claude Code Review Action]</sub>`;

  await deletePreviousReviews();
  await postReviewComment(comment);

  console.log('\n✅ Code review publicado en el PR');
}

runCodeReview().catch((error) => {
  console.error('Error en code review:', error);
  process.exit(1);
});
