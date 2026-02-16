export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class EntityNotFoundError extends DomainError {
  constructor(
    public readonly entityName: string,
    public readonly entityId: string,
  ) {
    super(`Entity '${entityName}' with '${entityId}' not found`);
  }
}
