import { _decorator, Component, Label, JsonAsset, log } from 'cc';
const { property, ccclass } = _decorator;

import { store } from './store/store';
import { DEBUG } from 'cc/env';
const { computed, observable } = mobx;
sven.init({
  i18n: { lan: 'zh', path: 'res/i18n/zh.json' },
  store,
});

//建议debug模式下启用，再配合chrome插件:MobX Developer Tools使用
//该模式下所有对observable数值的改变，都需要在mobx.runInAction、@mobx.action中变更
DEBUG && mobx.configure({ enforceActions: 'observed' });

@ccclass('main')
export class Main extends Component {
  @property(Label) uid: Label = null;
  @property(Label) storageByUid: Label = null;
  @property(JsonAsset) zh: JsonAsset = null;
  @property(JsonAsset) en: JsonAsset = null;

  //建议observable Value尽量都放在store中
  @observable observableValue = 0;
  onLoad() {
    sven.i18n.setLanguage('zh', this.zh.json);
  }
  @computed
  get computedValue() {
    return 'computed_' + store.test._computedValue;
  }
  @sven.onClick('switchLan')
  onSwitchLan(event, param) {
    let lan = sven.i18n.getLanguage() == 'zh' ? 'en' : 'zh';
    sven.i18n.setLanguage(lan, lan == 'zh' ? this.zh.json : this.en.json);
  }
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
          this.observableValue += 1;
        });
        break;
      case 'storageByUid':
        store.test.setStorageByUidValue(store.test.storageByUidValue + 1);
        break;
      case 'uid':
        store.test.setUid(store.test.uid ? store.test.uid + 1 : 1);
        break;
    }
  }
  @sven.onClick()
  clickAny(name) {
    console.log('click', name);
  }
  @sven.event('test.login')
  onTestLogin(msg, event) {
    console.log('收到event', event, msg);
  }
  @sven.autorun
  renderUid() {
    this.uid.string = store.test.uid?.toString() || 'null';
  }
  @sven.reaction(ref => store.test.storageByUidValue, { fireImmediately: true })
  reactionStorageByUid(value) {
    this.storageByUid.string = value.toString();
  }
}
