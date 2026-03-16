import { Provider } from '@nestjs/common';
import { ClientProxyFactory, Transport, ClientProxy } from '@nestjs/microservices';
import { MICROSERVICE_NAMES } from '../microservices';

export const AuthClientProvider: Provider = {
    provide: MICROSERVICE_NAMES.AUTH,
    useFactory: (): ClientProxy => {
        return ClientProxyFactory.create({
            transport: Transport.TCP,
            options: {
                port: +process.env.AUTH_SERVICE_PORT,
                host: process.env.AUTH_SERVICE_HOST,
            },
        });
    },
};
