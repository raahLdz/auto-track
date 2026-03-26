import * as Joi from 'joi';

export const baseEnvSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'qa')
    .default('development'),

  // RabbitMQ — todos los servicios lo usan
  RABBITMQ_URL: Joi.string()
    .uri({ scheme: ['amqp', 'amqps'] })
    .required(),

  // Redis — para caché y sockets
  REDIS_URL: Joi.string()
    .uri({ scheme: ['redis', 'rediss'] })
    .required(),

  // PostgreSQL
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432),
  DB_USER: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),
  DB_SSL: Joi.boolean().default(false),

  // Telemetría — OpenTelemetry
  OTEL_EXPORTER_OTLP_ENDPOINT: Joi.string().uri().optional(),
  OTEL_SERVICE_NAME: Joi.string().optional(),
});