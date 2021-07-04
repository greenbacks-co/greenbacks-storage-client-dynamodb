import DynamoDB, { DocumentClient } from 'aws-sdk/clients/dynamodb';

import { AuthenticationError, isAuthenticationError } from 'errors';

export class DynamoClient {
  sdkWrapper: BaseSdkWrapper;

  constructor({ sdkWrapper }) {
    this.sdkWrapper = sdkWrapper;
  }

  async validateAuthentication() {
    return new Promise((resolve, reject) => {
      this.sdkWrapper.client.listTables({}, (error) => {
        if (error && isAuthenticationError(error)) {
          reject(new AuthenticationError());
          return;
        }
        resolve(null);
      });
    });
  }
}

export const getClient = async ({
  credentials,
  region = 'us-east-1',
}: GetClientArgs): Promise<DynamoClient> => {
  const configuration = {
    accessKeyId: credentials.id,
    region,
    secretAccessKey: credentials.secret,
  };
  const sdkClient = new DynamoDB(configuration);
  const sdkDocumentClient = new DocumentClient(configuration);
  const sdkWrapper = new SdkWrapper({
    client: sdkClient,
    documentClient: sdkDocumentClient,
  });
  const client = new DynamoClient({ sdkWrapper });
  await client.validateAuthentication();
  return client;
};

interface GetClientArgs {
  credentials: {
    id: string;
    secret: string;
  };
  region?: string;
}

class BaseSdkWrapper {
  client: DynamoDB;
  documentClient: DocumentClient;
}

export interface TableClient {
  createTable: (configuration: any, callback: (error: any) => void) => void;
}

class SdkWrapper extends BaseSdkWrapper {
  constructor({ client, documentClient }) {
    super();
    this.client = client;
    this.documentClient = documentClient;
  }
}

export default getClient;
