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

  // Telemetría — OpenTelemetry
  OTEL_EXPORTER_OTLP_ENDPOINT: Joi.string().uri().optional(),
  OTEL_SERVICE_NAME: Joi.string().optional(),
});