import { newSymbol } from '../utils/utils';
import { reaction } from 'mobx';

const storageList = newSymbol('storageList');
const markUidFlag = newSymbol('markUidFlag');
const storageByIdList = newSymbol('storageByIdList');
const disposeList = newSymbol('disposeList');
const storageByIdInitalValue = newSymbol('storageByIdInitalValue');

const defaultStorageOptions = { key: null };

export const storage = options => (context, prop) => {
  options = { ...defaultStorageOptions, ...(options || {}) };
  const { key } = options;
  context[storageList] = context[storageList] || [];
  context[storageList].push({ prop, key });
};

let storeList = [];
export const storageByUid = options => (context, prop) => {
  options = { ...defaultStorageOptions, ...(options || {}) };
  const { key } = options;
  context[storageByIdList] = context[storageByIdList] || [];
  context[storageByIdList].push({ prop, key });
};

let userid = null;

export const markUid = () => (context, prop) => {
  context[markUidFlag] = prop;
};

export const Store = mainKey => Context => {
  let context = Context.prototype;
  context[storageList] = context[storageList] || [];
  class Son extends Context {
    constructor() {
      super();
      if (CC_EDITOR) {
        return;
      }
      storeList.push(this);
      this.__initStore();
    }

    __initStore() {
      this[storageList] = this[storageList] || [];
      this[storageList].forEach(({ prop, key }) => {
        //从storage中加载数据
        const itemKey = `${mainKey}.${key || prop}`;
        let data = cc.sys.localStorage.getItem(itemKey);
        if (data != null) {
          let value = JSON.parse(data);

          CC_DEBUG && console.log('@storage-------get------', { itemKey, value });

          this[prop] = value;
        }
        //监听数值变化
        reaction(
          () => this[prop],
          value => {
            if (value !== undefined) {
              const itemKey = `${mainKey}.${key || prop}`;
              CC_DEBUG && console.log('@storage-------set------', { itemKey, value });
              cc.sys.localStorage.setItem(itemKey, JSON.stringify(value));
            }
          }
        );
      });

      this[storageByIdList] = this[storageByIdList] || [];

      this[storageByIdInitalValue] = {};
      //记录绑定ID的初始化的值
      this[storageByIdList].forEach(({ prop, key }) => {
        this[storageByIdInitalValue][prop] = this[prop];
      });

      //监听uid变化
      this[markUidFlag] &&
        reaction(
          () => this[this[markUidFlag]],
          id => {
            userid = id;
            if (id != null) {
              storeList.forEach(store => store.__unloadUidStorage());
              storeList.forEach(store => store.__loadUidStorage());
            } else {
              storeList.forEach(store => store.__unloadUidStorage());
            }
          },
          { fireImmediately: true }
        );
    }

    __loadUidStorage() {
      this[storageByIdList] = this[storageByIdList] || [];
      this[disposeList] = this[storageByIdList].map(({ prop, key }) => {
        //从storage中加载数据
        const itemKey = `${mainKey}.${userid}.${key || prop}`;
        let data = cc.sys.localStorage.getItem(itemKey);
        if (data != null) {
          let value = JSON.parse(data);
          CC_DEBUG && console.log('@storageById-------get------', { itemKey, value });
          this[prop] = value;
        }

        //监听数值变化
        return reaction(
          () => this[prop],
          value => {
            if (value !== undefined) {
              const itemKey = `${mainKey}.${userid}.${key || prop}`;
              CC_DEBUG && console.log('@storageById-------set------', { itemKey, value });
              cc.sys.localStorage.setItem(itemKey, JSON.stringify(value));
            }
          }
        );
      });
    }

    __unloadUidStorage() {
      //停止监听
      this[disposeList] && this[disposeList].forEach(dispose => dispose());
      this[disposeList] = [];
      //设置为初始化的数值
      this[storageByIdList] &&
        this[storageByIdList].forEach(({ prop, key }) => {
          this[prop] = this[storageByIdInitalValue][prop];
        });
    }
  }
  if (CC_DEBUG && Object.defineProperty) {
    //MobX Developer Tools
    Object.defineProperty(Son, 'name', {
      get: function() {
        return mainKey;
      },
    });
  }
  return Son;
};
