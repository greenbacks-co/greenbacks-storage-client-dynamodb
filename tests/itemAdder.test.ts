import { InvalidKeyError, MissingTableError } from 'errors';
import ItemAdder from 'itemAdder';

class SdkStub implements IItemClient {
  readonly calls;
  readonly shouldReturnMissingKeyException: boolean;
  readonly shouldReturnResourceNotFoundException: boolean;
  readonly shouldReturnTypeMismatchException: boolean;

  constructor({
    shouldReturnMissingKeyException = false,
    shouldReturnResourceNotFoundException = false,
    shouldReturnTypeMismatchException = false,
  } = {}) {
    this.calls = [];
    this.shouldReturnMissingKeyException = shouldReturnMissingKeyException;
    this.shouldReturnResourceNotFoundException =
      shouldReturnResourceNotFoundException;
    this.shouldReturnTypeMismatchException = shouldReturnTypeMismatchException;
  }

  async put(input, callback) {
    this.calls.push(input);
    if (this.shouldReturnMissingKeyException) {
      callback({
        name: 'ValidationException',
        message: 'One or more parameter values were invalid: Missing the key',
      });
      return;
    }
    if (this.shouldReturnResourceNotFoundException) {
      callback({ name: 'ResourceNotFoundException' });
      return;
    }
    if (this.shouldReturnTypeMismatchException) {
      callback({
        name: 'ValidationException',
        message:
          'One or more parameter values were invalid: Type mismatch for key',
      });
      return;
    }
    callback(null, null);
  }

  async query(input, callback) {}
}

const getInput = () => ({
  table: 'test',
  item: {
    test: 'test',
  },
});

describe('item adder', () => {
  describe('input', () => {
    test.each(['foo', 'bar'])(
      'calls client with table name %s',
      async (value) => {
        const stub = new SdkStub();
        const itemAdder = new ItemAdder({ itemClient: stub });
        const input = getInput();
        input.table = value;
        await itemAdder.addItem(input);
        expect(stub.calls[0].TableName).toBe(value);
      }
    );

    test.each(['foo', 'bar'])(
      'calls client with item key %s',
      async (value) => {
        const stub = new SdkStub();
        const itemAdder = new ItemAdder({ itemClient: stub });
        const input = getInput();
        delete input.item.test;
        input.item[value] = 'test';
        await itemAdder.addItem(input);
        expect(stub.calls[0].Item[value]).toBe('test');
      }
    );

    test.each(['foo', 'bar'])(
      'calls client with item value %s',
      async (value) => {
        const stub = new SdkStub();
        const itemAdder = new ItemAdder({ itemClient: stub });
        const input = getInput();
        input.item.test = value;
        await itemAdder.addItem(input);
        expect(stub.calls[0].Item.test).toBe(value);
      }
    );
  });

  describe('error handling', () => {
    test('throws missing table error if client returns resource not found exception', async () => {
      const stub = new SdkStub({ shouldReturnResourceNotFoundException: true });
      const itemAdder = new ItemAdder({ itemClient: stub });
      const input = getInput();
      await expect(async () => {
        await itemAdder.addItem(input);
      }).rejects.toThrow(MissingTableError);
    });

    test('throws invalid key error if client returns missing key exception', async () => {
      const stub = new SdkStub({ shouldReturnMissingKeyException: true });
      const itemAdder = new ItemAdder({ itemClient: stub });
      const input = getInput();
      await expect(async () => {
        await itemAdder.addItem(input);
      }).rejects.toThrow(InvalidKeyError);
    });

    test('throws invalid key error if client returns type mismatch exception', async () => {
      const stub = new SdkStub({ shouldReturnTypeMismatchException: true });
      const itemAdder = new ItemAdder({ itemClient: stub });
      const input = getInput();
      await expect(async () => {
        await itemAdder.addItem(input);
      }).rejects.toThrow(InvalidKeyError);
    });
  });
});
