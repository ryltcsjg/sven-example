const { computed, observable } = mobx;
const store = require('./store/store').store;

sven.init({
  i18n: { lan: 'zh', path: 'resources/i18n/zh.json' },
  store,
});
//建议debug模式下启用，再配合chrome插件:MobX Developer Tools使用
CC_DEBUG && mobx.configure({ enforceActions: 'observed' });

cc.Class({
  extends: cc.Component,
  properties: {
    uid: cc.Label,
    storageByUid: cc.Label,
  },

  ctor() {
    this.computedValue = computed(() => {
      return 'computed_' + store.test._computedValue;
    });

    //建议observable Value尽量都放在store中
    this.observableValue = observable.box(0);
  },
  onLoad() {
    cc.loader.loadRes('i18n/zh', (err, result) => {
      !err && sven.i18n.setLanguage('zh', result);
    });
  },

  @sven.onClick('switchLan')
  onSwitchLan(event, param) {
    let lan = sven.i18n.getLanguage() == 'zh' ? 'en' : 'zh';
    cc.loader.loadRes(`i18n/${lan}`, (err, result) => {
      !err && sven.i18n.setLanguage(lan, result);
    });
  },
  @sven.onClick(['storeOb', 'storeComputed', 'localComputed', 'localOb', 'storageByUid', 'uid'], { throttle: 0 })
  onClick(name, node, param) {
    switch (name) {
      case 'storeOb':
        store.test.setObValue(store.test.observableValue + 1);
        break;
      case 'storeComputed':
        store.test.setComputedObValue(store.test._computedValue + 1);
        break;
      case 'localComputed':
        store.test.setComputedObValue(store.test._computedValue + 1);
        break;
      case 'localOb':
        mobx.runInAction('localOb', () => {
          this.observableValue.set(this.observableValue + 1);
        });
        break;
      case 'storageByUid':
        store.test.setStorageByUidValue(store.test.storageByUidValue + 1);
        break;
      case 'uid':
        store.test.setUid(store.test.uid ? store.test.uid + 1 : 1);
        break;
    }
  },
  @sven.onClick()
  clickAny(name) {
    console.log('click', name);
  },
  @sven.event('test.login')
  onTestLogin(msg, event) {
    console.log('收到event', event, msg);
  },

  @sven.autorun
  renderUid() {
    this.uid.string = store.test.uid;
  },

  @sven.reaction(ref => store.test.storageByUidValue, { fireImmediately: true })
  reactionStorageByUid(value) {
    this.storageByUid.string = value;
  },
});
