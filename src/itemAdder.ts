import {
  InvalidKeyError,
  isInvalidKeyError,
  isMissingTableError,
  MissingTableError,
} from 'errors';

class ItemAdder {
  readonly itemClient: IItemClient;

  constructor({ itemClient }: ConstructorInput) {
    this.itemClient = itemClient;
  }

  async addItem({ item, table }: AddItemInput): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.itemClient.put(
        {
          Item: item,
          TableName: table,
        },
        (error) => {
          if (error) {
            if (isMissingTableError(error)) {
              reject(new MissingTableError());
              return;
            }
            if (isInvalidKeyError(error)) {
              reject(new InvalidKeyError());
              return;
            }
            reject(error);
            return;
          }
          resolve();
        }
      );
    });
  }
}

interface ConstructorInput {
  itemClient: IItemClient;
}

interface AddItemInput {
  item: Record<string, unknown>;
  table: string;
}

export default ItemAdder;
