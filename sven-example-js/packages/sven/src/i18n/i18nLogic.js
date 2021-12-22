import { format } from '../utils/stringUtil';
import { observable } from 'mobx';

class I18nLogic {
  language = observable.box('');
  content = null;
  filePath = '';
  format = format;

  setEditorLanguage(lan, path) {
    if (!CC_EDITOR || !Editor) {
      return;
    }
    let prefix = Editor.url('db://assets/') + '/';
    const fs = Editor.require('fs');
    let filePath = prefix + path;
    try {
      if (this.filePath) {
        fs.unwatchFile(this.filePath);
      }
      fs.unwatchFile(filePath);
      fs.watchFile(filePath, () => {
        cc.log('i18n文件变化，重新加载', lan);
        this.refreshEditorLanguage();
      });
      this.filePath = filePath;
      this.refreshEditorLanguage();
      mobx.runInAction('setLanguage', () => this.language.set(lan));
    } catch (e) {
      cc.error('i18n.setEditorLanguage出错', e);
    }
  }

  refreshEditorLanguage() {
    if (!CC_EDITOR) {
      return;
    }
    if (!this.filePath) {
      return;
    }
    const fs = Editor.require('fs');
    let buffer = fs.readFileSync(this.filePath);
    this.content = JSON.parse(buffer.toString());
    // cc.log('加载i18n文件成功', filePath.format(lan));

    cc.director
      .getScene()
      .getComponentsInChildren('MobxLabel')
      .forEach(mobxLabel => mobxLabel.renderLabel());
  }

  get(key, ...formatStr) {
    if (!this.language.get()) {
      return formatStr ? formatStr.join('') : '';
    }
    let keys = key.split('.');
    let result = this.content;
    for (let i = 0; i < keys.length; i++) {
      result = result && result[keys[i]];
      if (result == null) {
        console.warn(`找不到key值为${key}的文本`);
        return '';
      }
    }
    if (typeof result == 'string') {
      return formatStr.length > 0 ? format(result, ...formatStr) : result;
    }
    console.warn(`找不到key值为${key}的文本`);
    return '';
  }

  setLanguage(lan, json) {
    this.content = json;
    mobx.runInAction('setLanguage', () => this.language.set(lan));
  }

  getLanguage() {
    return this.language.get();
  }
}

export const i18nLogic = new I18nLogic();
