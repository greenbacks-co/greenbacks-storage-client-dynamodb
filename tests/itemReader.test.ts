import { MissingTableError } from 'errors';
import ItemReader from 'itemReader';
import getClient from 'dynamoClient';

class SdkStub implements IItemClient {
  readonly calls: SdkQueryInput[];
  readonly result: any;
  readonly shouldThrow: boolean;

  constructor({ result = { Items: [] }, shouldThrow = false } = {}) {
    this.calls = [];
    this.result = result;
    this.shouldThrow = shouldThrow;
  }

  async query(input, callback) {
    this.calls.push(input);
    if (this.shouldThrow) {
      callback({ name: 'ResourceNotFoundException' });
    } else {
      callback(null, this.result);
    }
  }
}

const getInput = () => ({
  partitionName: 'test',
  partitionValue: 'test',
  table: 'test',
});

test('read items with missing table throws missing table error', async () => {
  const stub = new SdkStub({ shouldThrow: true });
  const itemReader = new ItemReader({ itemClient: stub });
  const input = getInput();
  await expect(async () => {
    await itemReader.readItems(input);
  }).rejects.toThrow(MissingTableError);
});

test.each(['foo', 'bar'])(
  'read items calls client with correct partition name',
  async (name) => {
    const stub = new SdkStub();
    const itemReader = new ItemReader({ itemClient: stub });
    const input = getInput();
    input.partitionName = name;
    await itemReader.readItems(input);
    expect(stub.calls[0].ExpressionAttributeNames['#partitionName']).toBe(name);
  }
);

test.each(['foo', 'bar'])(
  'read items calls client with correct partition value',
  async (value) => {
    const stub = new SdkStub();
    const itemReader = new ItemReader({ itemClient: stub });
    const input = getInput();
    input.partitionValue = value;
    await itemReader.readItems(input);
    expect(stub.calls[0].ExpressionAttributeValues[':partitionValue']).toBe(
      value
    );
  }
);

test.each(['foo', 'bar'])(
  'read items calls client with correct table',
  async (name) => {
    const stub = new SdkStub();
    const itemReader = new ItemReader({ itemClient: stub });
    const input = getInput();
    input.table = name;
    await itemReader.readItems(input);
    expect(stub.calls[0].TableName).toBe(name);
  }
);

test('read items calls client with correct key condition expression', async () => {
  const stub = new SdkStub();
  const itemReader = new ItemReader({ itemClient: stub });
  const input = getInput();
  await itemReader.readItems(input);
  expect(stub.calls[0].KeyConditionExpression).toBe(
    '#partitionName = :partitionValue'
  );
});

test.each([
  ['S', 'test'],
  ['N', 1],
  ['B', true],
])('read items correctly removes nested types', async (type, value) => {
  const stub = new SdkStub({
    result: { Items: [{ id: 'test', nested: { test: { [type]: value } } }] },
  });
  const itemReader = new ItemReader({ itemClient: stub });
  const input = getInput();
  const result = await itemReader.readItems(input);
  expect(result).toStrictEqual([{ id: 'test', nested: { test: value } }]);
});

test.each([
  ['S', 'test'],
  ['N', 1],
  ['B', true],
])(
  'read items correctly removes types from objects in array',
  async (type, value) => {
    const stub = new SdkStub({
      result: {
        Items: [{ id: 'test', nested: [{ test: { [type]: value } }] }],
      },
    });
    const itemReader = new ItemReader({ itemClient: stub });
    const input = getInput();
    const result = await itemReader.readItems(input);
    expect(result).toStrictEqual([{ id: 'test', nested: [{ test: value }] }]);
  }
);

test('read items correctly returns nested null', async () => {
  const stub = new SdkStub({
    result: {
      Items: [{ id: 'test', nested: null }],
    },
  });
  const itemReader = new ItemReader({ itemClient: stub });
  const input = getInput();
  const result = await itemReader.readItems(input);
  expect(result).toStrictEqual([{ id: 'test', nested: null }]);
});
