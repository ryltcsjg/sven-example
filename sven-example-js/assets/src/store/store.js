const TestStore = require('./TestStore');

class Store {
  test = new TestStore();
}

export const store = new Store();
