import { DynamoClient } from 'dynamoClient';
import type { CreateTableInput, ITableCreator } from 'tableCreator';
import type { IItemReader, ReadItemsInput, ReadItemsResult } from 'itemReader';

class TableCreatorStub implements ITableCreator {
  readonly calls: CreateTableInput[];

  constructor({}) {
    this.calls = [];
  }

  async createTable(input: CreateTableInput) {
    this.calls.push(input);
  }
}

class ItemReaderStub implements IItemReader {
  readonly calls: ReadItemsInput[];
  readonly result: Record<string, unknown>[];

  constructor({
    result = [{ test: 'test' }],
  }: {
    result?: Record<string, unknown>[];
  }) {
    this.calls = [];
    this.result = result;
  }

  async readItems(input: ReadItemsInput): ReadItemsResult {
    this.calls.push(input);
    return new Promise((resolve) => resolve(this.result));
  }
}

const getCreateTableInput = (): CreateTableInput => ({
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

const getReadItemsInput = (): ReadItemsInput => ({
  partitionName: 'test',
  partitionValue: 'test',
  table: 'test',
});

test.each(['foo', 'bar'])(
  'create table forwards correct name',
  async (name) => {
    const stub = new TableCreatorStub({});
    const client = new DynamoClient({
      tableCreator: stub,
    });
    const input = getCreateTableInput();
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
    const input = getCreateTableInput();
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
    const input = getCreateTableInput();
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
    const input = getCreateTableInput();
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
    const input = getCreateTableInput();
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
  const input = getCreateTableInput();
  delete input.key.sort;
  await client.createTable(input);
  expect(stub.calls[0].key).not.toHaveProperty('sort');
});

test.each(['foo', 'bar'])(
  'read items forwards correct partition value',
  async (value) => {
    const stub = new ItemReaderStub({});
    const client = new DynamoClient({
      itemReader: stub,
    });
    const input = getReadItemsInput();
    input.partitionValue = value;
    await client.readItems(input);
    expect(stub.calls[0].partitionValue).toBe(value);
  }
);

test.each(['foo', 'bar'])(
  'read items forwards correct table',
  async (value) => {
    const stub = new ItemReaderStub({});
    const client = new DynamoClient({
      itemReader: stub,
    });
    const input = getReadItemsInput();
    input.table = value;
    await client.readItems(input);
    expect(stub.calls[0].table).toBe(value);
  }
);

test.each(['foo', 'bar'])(
  'read items forwards correct partition name',
  async (partitionName) => {
    const stub = new ItemReaderStub({});
    const client = new DynamoClient({
      itemReader: stub,
    });
    const input = getReadItemsInput();
    input.partitionName = partitionName;
    await client.readItems(input);
    expect(stub.calls[0].partitionName).toBe(partitionName);
  }
);

test.each(['foo', 'bar'])(
  'read items correctly returns ItemReader result',
  async (value) => {
    const stub = new ItemReaderStub({
      result: [{ [value]: value }],
    });
    const client = new DynamoClient({
      itemReader: stub,
    });
    const input = getReadItemsInput();
    const result = await client.readItems(input);
    expect(result).toStrictEqual([{ [value]: value }]);
  }
);
