import { v4 as uuidv4 } from 'uuid';

import TraceIdProvider from './trace-id-provider';

export class UUIDTraceIdProvider implements TraceIdProvider {
  create(): string {
    return uuidv4().replace(/-/g, '').substring(0, 16);
  }

  extend(id: string): string {
    return `${id};${this.create().substring(0, 6)}`;
  }
}

export default UUIDTraceIdProvider;
