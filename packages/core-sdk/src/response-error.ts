export class ResponseError extends Error {
  constructor(
    message: string,
    public readonly response?: Response,
    public readonly data?: any,
  ) {
    super(message)
  }
}
