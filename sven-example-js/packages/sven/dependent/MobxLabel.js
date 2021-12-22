const MobxLabelFormat = cc.Class({
  name: 'MobxLabelFormat',
  properties: {
    target: { default: null, type: cc.Node },
    key: '',
    defaultValue: '',
  },
});

const regI18n = /^@i18n\./;

export const MobxLabel = cc.Class({
  extends: cc.Component,
  editor: {
    executeInEditMode: true,
    menu: 'component/MobxLabel',
  },
  properties: {
    _i18n: '',
    i18n: {
      type: cc.String,
      get: function() {
        return this._i18n;
      },
      set: function(v) {
        this._i18n = v;
        if (CC_EDITOR) {
          this.__editorUpdateLabel();
        } else {
          this.renderLabel();
        }
      },
    },
    _format: [],
    format: {
      type: MobxLabelFormat,
      get: function() {
        return this._format;
      },
      set: function(v) {
        this._format = v;
        if (CC_EDITOR) {
          this.__editorUpdateLabel();
        } else {
          this.renderLabel();
        }
      },
    },
  },
  ctor() {
    if (CC_EDITOR) {
      setTimeout(() => this.renderLabel(), 0);
    }
  },
  @sven.throttle(1000, true)
  __editorUpdateLabel() {
    this.renderLabel();
  },
  @sven.autorun
  renderLabel() {
    let formatString = [];
    this._format.forEach(({ target, key, defaultValue }) => {
      if (regI18n.test(defaultValue)) {
        defaultValue = sven.i18n.get(defaultValue.replace('@i18n.', ''));
      }
      let from = sven._store;
      let keyList = key.split('.');
      if (target) {
        keyList[0] && (from = target.getComponent(keyList.shift()));
        if (!from) {
          formatString.push(defaultValue);
          return;
        }
      }

      for (let i = 0; i < keyList.length; i++) {
        from = from && from[keyList[i]];
        if (from == null) {
          formatString.push(defaultValue);
          return;
        }
      }
      if ((mobx.isComputed(from) || mobx.isObservable(from)) && from.get) {
        from = from.get();
      }

      //在编辑器中为了容易预览，对值为空字符串的内容展示默认值
      formatString.push(
        typeof from == 'object' || typeof from == 'undefined' || (CC_EDITOR && from === '') ? defaultValue : from
      );
    });
    let labelString = '';
    if (regI18n.test(this._i18n)) {
      labelString = sven.i18n.get(this._i18n.replace('@i18n.', ''));
    } else {
      labelString = this._i18n;
    }
    if (labelString) {
      labelString = sven.i18n.format(labelString, ...formatString);
    } else {
      labelString = formatString.join('');
    }
    let labelComponent = this.node.getComponent(cc.Label);
    labelComponent && labelComponent.string != labelString && (labelComponent.string = labelString);
  },
});

sven.MobxLabel = MobxLabel;
