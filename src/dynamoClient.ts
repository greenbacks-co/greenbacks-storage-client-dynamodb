import DynamoDB from 'aws-sdk/clients/dynamodb';
// import DynamoDB, { DocumentClient } from 'aws-sdk/clients/dynamodb';

import { AuthenticationError, isAuthenticationError } from 'errors';
import {
  CreateTableInput,
  CreateTableResult,
  ITableCreator,
} from 'tableCreator';

export class DynamoClient {
  readonly tableClient: ITableClient;
  readonly tableCreator: ITableCreator;

  constructor({ tableClient, tableCreator }: ConstructorInput) {
    this.tableClient = tableClient;
    this.tableCreator = tableCreator;
  }

  async validateAuthentication(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.tableClient.listTables({}, (error) => {
        if (error && isAuthenticationError(error)) {
          reject(new AuthenticationError());
          return;
        }
        resolve(null);
      });
    });
  }

  async createTable(input: CreateTableInput): CreateTableResult {
    return await this.tableCreator.createTable(input);
  }
}

interface ConstructorInput {
  tableClient?: ITableClient;
  tableCreator?: ITableCreator;
}

export const getClient = async ({
  credentials,
  region = 'us-east-1',
}: GetClientInput): Promise<DynamoClient> => {
  const configuration = {
    accessKeyId: credentials.id,
    region,
    secretAccessKey: credentials.secret,
  };
  const tableClient = new DynamoDB(configuration);
  // const itemClient = new DocumentClient(configuration);
  const client = new DynamoClient({ tableClient });
  await client.validateAuthentication();
  return client;
};

interface GetClientInput {
  credentials: {
    id: string;
    secret: string;
  };
  region?: string;
}

export default getClient;
