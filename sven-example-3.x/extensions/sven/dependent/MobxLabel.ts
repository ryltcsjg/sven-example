import { Node, CCString, _decorator, Component, Label } from 'cc';
import { EDITOR } from 'cc/env';
const { property, ccclass, executeInEditMode } = _decorator;

@ccclass('MobxLabelFormat')
class MobxLabelFormat {
  @property(Node) target: Node = null;
  @property(CCString) key = '';
  @property(CCString) defaultValue = '';
}

const regI18n = /^@i18n\./;

@ccclass('MobxLabel')
@executeInEditMode
export class MobxLabel extends Component {
  @property(CCString) _i18n = '';
  @property(CCString)
  get i18n() {
    return this._i18n;
  }
  set i18n(v) {
    this._i18n = v;
    if (EDITOR) {
      this.__editorUpdateLabel();
    } else {
      this.renderLabel();
    }
  }

  @property(MobxLabelFormat) _format: MobxLabelFormat[] = [];
  @property(MobxLabelFormat)
  get format() {
    return this._format;
  }
  set format(v) {
    this._format = v;
    if (EDITOR) {
      this.__editorUpdateLabel();
    } else {
      this.renderLabel();
    }
  }

  @sven.throttle(300, true)
  __editorUpdateLabel() {
    this.renderLabel();
  }

  @sven.autorun
  renderLabel() {
    let formatString: string[] = [];
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
        typeof from == 'object' || typeof from == 'undefined' || (EDITOR && from === '') ? defaultValue : from
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
    let labelComponent = this.node.getComponent(Label);
    labelComponent && labelComponent.string != labelString && (labelComponent.string = labelString);
  }
}

sven.MobxLabel = MobxLabel;
