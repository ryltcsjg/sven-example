import { throttle } from '../throttle/throttle';
import { newSymbol } from '../utils/utils';
import { emitter } from '../emitter/emitter';

export const clickEvents = newSymbol('clickEvents');
export const patchClickFlag = newSymbol('patchClickFlag');
/**
 *
 *
 * @sven.onClick()装饰器
 *
 * */
const onClick = function(event, param) {
  let node = event.target;
  let name = node.name;

  if (this[clickEvents]) {
    if (this[clickEvents]['*']) {
      this[clickEvents]['*'].forEach(funname => this[funname](name, node, param));
    }
    if (this[clickEvents][name]) {
      this[clickEvents][name].forEach(funname => this[funname](name, node, param));
    }
  }
};

function patchClick(target) {
  if (target[patchClickFlag]) {
    return;
  }
  target[patchClickFlag] = true;
  target['@OnClickToggle'] = function(event, param) {
    emitter.emit('@clickToggle', { node: event.target, param, ref: this });
    onClick.call(this, event, param);
  };
  target['@OnClickButton'] = function(event, param) {
    emitter.emit('@clickButton', { node: event.target, param, ref: this });
    onClick.call(this, event, param);
  };
}

const defaultClickOptions = { throttle: 300, callWhenEnd: false };

export const makeFunctionListenClickEvent = (nameList, options) => (context, funname, descriptor) => {
  options = { ...defaultClickOptions, ...(options || {}) };
  context[clickEvents] = context[clickEvents] || {};
  nameList = nameList || '*';
  if (!Array.isArray(nameList)) {
    nameList = [nameList];
  }
  nameList.forEach(name => {
    context[clickEvents][name] = context[clickEvents][name] || [];
    context[clickEvents][name].push(funname);
  });

  if (options.throttle > 0) {
    throttle(options.throttle, options.callWhenEnd)(context, funname, descriptor);
  }
  patchClick(context);
};
