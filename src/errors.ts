export class ClientError extends Error {}

export class AuthenticationError extends ClientError {}

export const isAuthenticationError = (error: DynamoError): boolean =>
  AUTHENTICATION_ERRORS.includes(error.name);

const AUTHENTICATION_ERRORS = [
  'UnrecognizedClientException',
  'InvalidSignatureException',
];

export class InvalidKeyError extends ClientError {}

export const isInvalidKeyError = (error: DynamoError): boolean =>
  error.name === 'ValidationException' &&
  INVALID_KEY_MESSAGES.includes(error.message);

const INVALID_KEY_MESSAGES = [
  'One or more parameter values were invalid: Missing the key',
  'One or more parameter values were invalid: Type mismatch for key',
];

export class DuplicateTableError extends ClientError {}

export const isDuplicateTableError = (error: DynamoError): boolean =>
  error.name === 'ResourceInUseException' &&
  (error.message.startsWith('Table already exists') ||
    error.message.startsWith(
      'Attempt to change a resource which is still in use'
    ));

export class MissingTableError extends ClientError {}

export const isMissingTableError = (error: DynamoError): boolean =>
  error.name === 'ResourceNotFoundException';

export interface DynamoError {
  message: string;
  name: string;
}

export default {
  AuthenticationError,
  DuplicateTableError,
};
