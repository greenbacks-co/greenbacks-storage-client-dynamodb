export class ClientError extends Error {}

export class AuthenticationError extends ClientError {}

export class DuplicateTableError extends ClientError {}

export interface DynamoError {
  message: string;
  name: string;
}

export const isDuplicateTableError = (error: DynamoError): boolean =>
  error.name === 'ResourceInUseException' &&
  (error.message.startsWith('Table already exists') ||
    error.message.startsWith(
      'Attempt to change a resource which is still in use'
    ));

export default {
  AuthenticationError,
  DuplicateTableError,
};
