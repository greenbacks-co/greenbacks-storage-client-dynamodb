import {
  DuplicateTableError,
  DynamoError,
  isDuplicateTableError,
} from 'errors';

class TableCreator implements ITableCreator {
  readonly tableClient: ITableClient;

  constructor({ tableClient }: ConstructorInput) {
    this.tableClient = tableClient;
  }

  async createTable(input: CreateTableInput): CreateTableResult {
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

export interface ITableCreator {
  createTable: (input: CreateTableInput) => CreateTableResult;
}

interface ConstructorInput {
  tableClient: ITableClient;
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

export type CreateTableResult = Promise<void>;

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
