interface ITableClient {
  createTable: (
    configuration: SdkCreateTableInput,
    callback: (error: DynamoError) => void
  ) => void;
  listTables: (
    configuration: SdkListTablesInput,
    callback: (error: DynamoError) => void
  ) => void;
}

interface SdkCreateTableInput {
  AttributeDefinitions: { AttributeName: string; AttributeType: string }[];
  BillingMode: string;
  KeySchema: { AttributeName: string; KeyType: string }[];
  TableName: string;
}

interface SdkListTablesInput {
  Limit?: number;
}
