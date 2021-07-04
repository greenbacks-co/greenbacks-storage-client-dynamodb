import type { TableClient } from 'dynamoClient';
import {
  DuplicateTableError,
  DynamoError,
  isDuplicateTableError,
} from 'errors';

class TableCreator {
  readonly tableClient: TableClient;

  constructor({ tableClient }: ConstructorInput) {
    this.tableClient = tableClient;
  }

  async createTable(input: CreateTableInput): Promise<void> {
    const configuration = {
      AttributeDefinitions: buildAttributeDefinitions(input),
      BillingMode: 'PAY_PER_REQUEST',
      KeySchema: buildKeySchema(input),
      TableName: input.name,
    };
    return new Promise<void>((resolve, reject) => {
      this.tableClient.createTable(
        configuration,
        (error: DynamoError | void) => {
          if (error && isDuplicateTableError(error)) {
            reject(new DuplicateTableError());
            return;
          }
          resolve();
        }
      );
    });
  }
}

interface ConstructorInput {
  tableClient: TableClient;
}

export interface CreateTableInput {
  key: {
    partition: {
      name: string;
      type: 'string' | 'number' | 'boolean';
    };
    sort?: {
      name: string;
      type: 'string' | 'number' | 'boolean';
    };
  };
  name: string;
}

const buildAttributeDefinitions = ({
  key: { partition, sort },
}: CreateTableInput) => {
  const attributeDefinitions = [
    {
      AttributeName: partition.name,
      AttributeType: TYPES[partition.type],
    },
  ];
  if (sort)
    attributeDefinitions.push({
      AttributeName: sort.name,
      AttributeType: TYPES[sort.type],
    });
  return attributeDefinitions;
};

const TYPES = {
  boolean: 'B',
  number: 'N',
  string: 'S',
};

const buildKeySchema = ({ key: { partition, sort } }: CreateTableInput) => {
  const schema = [
    {
      AttributeName: partition.name,
      KeyType: 'HASH',
    },
  ];
  if (sort) schema.push({ AttributeName: sort.name, KeyType: 'RANGE' });
  return schema;
};

export default TableCreator;
