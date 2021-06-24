export interface TraceIdProvider {
  /**
   * Creates a new RequestId on demand.
   * ex: 3ab9a9e9ffa9d
   */
  create: () => string;
  /**
   * Extends an existing RequestId
   * ex: 3ab9a9e9ffa9d => 3ab9a9e9ffa9d;b9302
   */
  extend: (id: string) => string;
}

export default TraceIdProvider;
