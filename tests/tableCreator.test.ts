import { DuplicateTableError } from 'errors';
import TableCreator, { CreateTableInput } from 'tableCreator';

class SdkStub implements ITableClient {
  calls: SdkCreateTableInput[];
  shouldThrowCreatingTableError: boolean;
  shouldThrowExistingTableError: boolean;

  constructor({
    shouldThrowCreatingTableError = false,
    shouldThrowExistingTableError = false,
  } = {}) {
    this.calls = [];
    this.shouldThrowCreatingTableError = shouldThrowCreatingTableError;
    this.shouldThrowExistingTableError = shouldThrowExistingTableError;
  }

  async createTable(configuration, callback) {
    this.calls.push(configuration);
    if (this.shouldThrowCreatingTableError) {
      callback({
        name: 'ResourceInUseException',
        message: 'Attempt to change a resource which is still in use',
      });
      return;
    }
    if (this.shouldThrowExistingTableError) {
      callback({
        name: 'ResourceInUseException',
        message: 'Table already exists',
      });
      return;
    }
    callback();
  }

  async listTables(configuration, callback) {}
}

const getInput = (): CreateTableInput => ({
  key: {
    partition: {
      name: 'partition',
      type: 'string',
    },
    sort: {
      name: 'sort',
      type: 'number',
    },
  },
  name: 'test',
});

test('create existing table throws duplicate table error', async () => {
  const stub = new SdkStub({ shouldThrowExistingTableError: true });
  const tableCreator = new TableCreator({ tableClient: stub });
  const input = getInput();
  await expect(async () => {
    await tableCreator.createTable(input);
  }).rejects.toThrow(DuplicateTableError);
});

test('create table that is already being created throws duplicate table error', async () => {
  const stub = new SdkStub({ shouldThrowCreatingTableError: true });
  const tableCreator = new TableCreator({ tableClient: stub });
  const input = getInput();
  await expect(async () => {
    await tableCreator.createTable(input);
  }).rejects.toThrow(DuplicateTableError);
});

test.each(['foo', 'bar'])(
  'create table calls client with correct partition name',
  async (partitionName: string) => {
    const stub = new SdkStub();
    const tableCreator = new TableCreator({ tableClient: stub });
    const input = getInput();
    input.key.partition.name = partitionName;
    await tableCreator.createTable(input);
    const attributeDefinition = stub.calls[0].AttributeDefinitions.find(
      (definition) => definition.AttributeName === partitionName
    );
    const keySchema = stub.calls[0].KeySchema.find(
      (schema) => schema.AttributeName === partitionName
    );
    expect(attributeDefinition).toBeDefined();
    expect(keySchema.KeyType).toBe('HASH');
  }
);

test.each(['foo', 'bar'])(
  'create table calls client with correct sort name',
  async (sortName: string) => {
    const stub = new SdkStub();
    const tableCreator = new TableCreator({ tableClient: stub });
    const input = getInput();
    input.key.sort.name = sortName;
    await tableCreator.createTable(input);
    const attributeDefinition = stub.calls[0].AttributeDefinitions.find(
      (definition) => definition.AttributeName === sortName
    );
    const keySchema = stub.calls[0].KeySchema.find(
      (schema) => schema.AttributeName === sortName
    );
    expect(attributeDefinition).toBeDefined();
    expect(keySchema.KeyType).toBe('RANGE');
  }
);

test.each(['string', 'number', 'boolean'])(
  'create table calls client with correct partition type',
  async (partitionType: 'string' | 'number' | 'boolean') => {
    const stub = new SdkStub();
    const tableCreator = new TableCreator({ tableClient: stub });
    const input = getInput();
    input.key.partition.type = partitionType;
    await tableCreator.createTable(input);
    const attributeDefinition = stub.calls[0].AttributeDefinitions.find(
      (definition) => definition.AttributeName === 'partition'
    );
    expect(attributeDefinition.AttributeType).toBe(TYPES[partitionType]);
  }
);

const TYPES = {
  boolean: 'B',
  number: 'N',
  string: 'S',
};

test.each(['string', 'number', 'boolean'])(
  'create table calls client with correct partition type',
  async (sortType: 'string' | 'number' | 'boolean') => {
    const stub = new SdkStub();
    const tableCreator = new TableCreator({ tableClient: stub });
    const input = getInput();
    input.key.sort.type = sortType;
    await tableCreator.createTable(input);
    const attributeDefinition = stub.calls[0].AttributeDefinitions.find(
      (definition) => definition.AttributeName === 'sort'
    );
    expect(attributeDefinition.AttributeType).toBe(TYPES[sortType]);
  }
);

test('create table without sort calls client without sort', async () => {
  const stub = new SdkStub();
  const tableCreator = new TableCreator({ tableClient: stub });
  const input = getInput();
  delete input.key.sort;
  await tableCreator.createTable(input);
  expect(stub.calls[0].AttributeDefinitions.length).toBe(1);
  expect(stub.calls[0].KeySchema.length).toBe(1);
});

test('create table calls client with pay per request billing mode', async () => {
  const stub = new SdkStub();
  const tableCreator = new TableCreator({ tableClient: stub });
  const input = getInput();
  await tableCreator.createTable(input);
  expect(stub.calls[0].BillingMode).toBe('PAY_PER_REQUEST');
});

test.each(['foo', 'bar'])(
  'create table calls client with correct table name',
  async (tableName: string) => {
    const stub = new SdkStub();
    const tableCreator = new TableCreator({ tableClient: stub });
    const input = getInput();
    input.name = tableName;
    await tableCreator.createTable(input);
    expect(stub.calls[0].TableName).toBe(tableName);
  }
);
