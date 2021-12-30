const { observable, computed, action } = mobx;
const { Store, storage, storageByUid, markUid } = sven;

@Store('TestStore')
export default class TestStore {
  @storage() @observable observableValue = 0;
  @observable _computedValue = 0;
  @markUid() @observable uid = null;
  @storageByUid() @observable storageByUidValue = 0;

  @computed
  get computedValue() {
    return 'computed_' + this._computedValue;
  }
  @action
  setObValue(v) {
    this.observableValue = v;
  }
  @action
  setComputedObValue(v) {
    this._computedValue = v;
  }
  @action
  setUid(v) {
    this.uid = v;
    sven.emitter.emit('test.login', { uid: v });
  }
  @action
  setStorageByUidValue(v) {
    this.storageByUidValue = v;
  }
}
