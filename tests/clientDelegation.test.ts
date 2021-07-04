import { DynamoClient } from 'dynamoClient';
import type { CreateTableInput, ITableCreator } from 'tableCreator';

class TableCreatorStub implements ITableCreator {
  calls: CreateTableInput[];

  constructor({}) {
    this.calls = [];
  }

  async createTable(input: CreateTableInput) {
    this.calls.push(input);
  }
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

test.each(['foo', 'bar'])(
  'create table forwards correct name',
  async (name) => {
    const stub = new TableCreatorStub({});
    const client = new DynamoClient({
      tableCreator: stub,
    });
    const input = getInput();
    input.name = name;
    await client.createTable(input);
    expect(stub.calls[0].name).toBe(name);
  }
);

test.each(['foo', 'bar'])(
  'create table forwards correct partition name',
  async (name) => {
    const stub = new TableCreatorStub({});
    const client = new DynamoClient({
      tableCreator: stub,
    });
    const input = getInput();
    input.key.partition.name = name;
    await client.createTable(input);
    expect(stub.calls[0].key.partition.name).toBe(name);
  }
);

test.each(['foo', 'bar'])(
  'create table forwards correct sort name',
  async (name) => {
    const stub = new TableCreatorStub({});
    const client = new DynamoClient({
      tableCreator: stub,
    });
    const input = getInput();
    input.key.sort.name = name;
    await client.createTable(input);
    expect(stub.calls[0].key.sort.name).toBe(name);
  }
);

test.each(['string', 'number', 'boolean'])(
  'create table forwards correct partition type',
  async (type: 'string' | 'number' | 'boolean') => {
    const stub = new TableCreatorStub({});
    const client = new DynamoClient({
      tableCreator: stub,
    });
    const input = getInput();
    input.key.partition.type = type;
    await client.createTable(input);
    expect(stub.calls[0].key.partition.type).toBe(type);
  }
);

test.each(['string', 'number', 'boolean'])(
  'create table forwards correct sort type',
  async (type: 'string' | 'number' | 'boolean') => {
    const stub = new TableCreatorStub({});
    const client = new DynamoClient({
      tableCreator: stub,
    });
    const input = getInput();
    input.key.sort.type = type;
    await client.createTable(input);
    expect(stub.calls[0].key.sort.type).toBe(type);
  }
);

test('create table correctly forwards input without sort', async () => {
  const stub = new TableCreatorStub({});
  const client = new DynamoClient({
    tableCreator: stub,
  });
  const input = getInput();
  delete input.key.sort;
  await client.createTable(input);
  expect(stub.calls[0].key).not.toHaveProperty('sort');
});
