import { NatsOptions, Transport } from '@nestjs/microservices';
import { InboundMessageIdentityDeserializer } from './deserializer';
import { OutboundResponseIdentitySerializer } from './serializer';

export const buildTransportOptions = (url: string): NatsOptions => ({
  transport: Transport.NATS,
  options: {
    url,
    serializer: new OutboundResponseIdentitySerializer(),
    deserializer: new InboundMessageIdentityDeserializer(),
  },
});
