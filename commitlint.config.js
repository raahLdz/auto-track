/** @type {import('@commitlint/types').UserConfig} */
module.exports = {
  extends: ['@commitlint/config-conventional'],

  rules: {
    // Tipos permitidos
    'type-enum': [
      2, // 2 = error (rompe el commit)
      'always',
      [
        'feat',     // Nueva funcionalidad
        'fix',      // Corrección de bug
        'docs',     // Solo documentación
        'style',    // Formato, puntos y comas, etc (no afecta lógica)
        'refactor', // Refactorización sin feat ni fix
        'perf',     // Mejora de rendimiento
        'test',     // Agregar o corregir tests
        'chore',    // Tareas de mantenimiento, deps, CI
        'revert',   // Revertir un commit anterior
        'build',    // Cambios en build system o dependencias externas
        'ci',       // Cambios en configuración de CI/CD
      ],
    ],

    // Scopes válidos — uno por microservicio + globales
    'scope-enum': [
      1, // 1 = warning (no rompe pero avisa)
      'always',
      [
        // Servicios
        'api-gateway',
        'auth-service',
        'user-service',
        'workshop-service',
        'reservation-service',
        'repair-service',
        'payment-service',
        'notification-service',
        'socket-gateway',
        'reporting-service',
        // Librerías
        'common',
        'messaging',
        'telemetry',
        // Globales
        'ci',
        'docker',
        'deps',
        'release',
      ],
    ],

    // El subject no puede estar vacío
    'subject-empty': [2, 'never'],

    // El subject no puede terminar con punto
    'subject-full-stop': [2, 'never', '.'],

    // El subject debe estar en minúsculas
    'subject-case': [2, 'always', 'lower-case'],

    // Máximo 100 caracteres en la primera línea
    'header-max-length': [2, 'always', 100],

    // El body debe tener una línea en blanco antes
    'body-leading-blank': [2, 'always'],

    // El footer debe tener una línea en blanco antes
    'footer-leading-blank': [1, 'always'],
  },
};