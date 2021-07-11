import { MissingTableError } from 'errors';

class ItemReader implements IItemReader {
  readonly itemClient: IItemClient;

  constructor({ itemClient }: ConstructorInput) {
    this.itemClient = itemClient;
  }

  async readItems(input: ReadItemsInput): ReadItemsResult {
    const queryParameters = buildQueryParameters(input);
    return new Promise((resolve, reject) => {
      this.itemClient.query(
        queryParameters,
        (error, result: SdkQueryResult) => {
          if (error && error.name === 'ResourceNotFoundException') {
            reject(new MissingTableError());
            return;
          }
          resolve(
            result.Items.map(
              (item) => <Record<string, unknown>>removeTypes(item)
            )
          );
        }
      );
    });
  }
}

export interface IItemReader {
  readItems: (input: ReadItemsInput) => ReadItemsResult;
}

type ConstructorInput = {
  itemClient: IItemClient;
};

export type ReadItemsInput = {
  partitionName: string;
  partitionValue: string | number | boolean;
  table: string;
};

export type ReadItemsResult = Promise<Record<string, unknown>[]>;

const buildQueryParameters = (input): SdkQueryInput => ({
  ExpressionAttributeNames: { '#partitionName': input.partitionName },
  ExpressionAttributeValues: { ':partitionValue': input.partitionValue },
  KeyConditionExpression: '#partitionName = :partitionValue',
  TableName: input.table,
});

const removeTypes = (
  object: { B?: boolean; N?: number; S?: string } | Record<string, unknown>
): string | number | boolean | Record<string, unknown> => {
  const { B, N, S } = object;
  if (B) return <boolean>B;
  if (N) return <number>N;
  if (S) return <string>S;
  const result = {};
  Object.entries(object).forEach(([key, value]) => {
    if (value && typeof value === 'object') {
      if (Array.isArray(value)) {
        result[key] = value.map((valueInList) => removeTypes(valueInList));
      } else {
        result[key] = removeTypes(value);
      }
    } else {
      result[key] = value;
    }
  });
  return result;
};

export default ItemReader;
