interface IItemClient {
  query: (
    input: SdkQueryInput,
    callback: (error: DynamoError, result: SdkQueryResult) => void
  ) => void;
}

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
