interface IItemClient {
  put: SdkFunction<SdkPutInput, SdkPutResult>;

  query: SdkFunction<SdkQueryInput, SdkQueryResult>;
}

type SdkFunction<Input, Result> = (
  input: Input,
  callback: (error: DynamoError, result: Result) => void
) => void;

type SdkQueryInput = {
  ExpressionAttributeNames: {
    '#partitionName': string;
  };
  ExpressionAttributeValues: {
    ':partitionValue': string | number | boolean;
  };
  KeyConditionExpression: string;
  TableName: string;
};

type SdkQueryResult = {
  Items: Record<string, unknown>[];
};

type SdkPutInput = {
  Item: Record<string, unknown>;
  TableName: string;
};

type SdkPutResult = Record<string, unknown>;
