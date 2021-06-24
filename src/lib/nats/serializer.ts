import {
  Serializer,
  OutgoingResponse,
  WritePacket,
} from '@nestjs/microservices';
import * as context from '../context';

const propagator = new context.NatsPropagator();
export class OutboundResponseIdentitySerializer implements Serializer {
  serialize(value: WritePacket & { id: string }): OutgoingResponse {
    const ctx = context.active();
    if (ctx) propagator.inject(value, ctx);
    return value;
  }
}
