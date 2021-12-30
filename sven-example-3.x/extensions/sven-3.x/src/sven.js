import * as _mobx from 'mobx';
import { reaction, _autorun } from './cc-mobx/ObserverClass';
import { emitter } from './emitter/emitter';
import { makeFunctionListenEmitterEvent } from './emitter/EmitterClass';
import { makeFunctionListenClickEvent } from './click/clickEvent';
import { throttle } from './throttle/throttle';
import { Store, storage, markUid, storageByUid } from './storage/storage';
import { i18nLogic } from './i18n/i18nLogic';
// import './fitCccJs';

function init(options) {
  options.store && (sven._store = options.store);
  options.i18n && i18nLogic.setEditorLanguage(options.i18n.lan, options.i18n.path);
}

export const sven = {
  autorun: _autorun,
  reaction,
  emitter,
  throttle,
  event: makeFunctionListenEmitterEvent,
  onClick: makeFunctionListenClickEvent,
  Store,
  storage,
  markUid,
  storageByUid,
  i18n: i18nLogic,
  _store: null,
  init,
};

export const mobx = _mobx;
