import { newSymbol, patch } from '../utils/utils';
import { emitter } from './emitter';

export const patchEmitterFlag = newSymbol('patchEmitterFlag');
export const autoOffList = newSymbol('autoOffList');
const pauseFlag = newSymbol('pauseFlag');

/**
 *
 *
 * @sven.event()装饰器
 *
 * */
const defaultEmitterOption = { autoOff: true, priority: 1, pause: true };

function patchEmitter(target) {
  if (target[patchEmitterFlag]) {
    return;
  }
  target[patchEmitterFlag] = true;

  target.pauseListening = function() {
    this[pauseFlag] = true;
  };
  target.resumeListening = function() {
    this[pauseFlag] = false;
  };
  patch(target, 'onDestroy', function() {
    if (this[autoOffList] && this[autoOffList].length > 0) {
      this[autoOffList].forEach(id => emitter.off(id));
      this[autoOffList] = [];
    }
  });
}

export const makeFunctionListenEmitterEvent = (eventList, options) => (context, funname) => {
  options = { ...defaultEmitterOption, ...(options || {}) };
  const { autoOff, priority, pause } = options;
  patch(context, 'onLoad', function() {
    if (!Array.isArray(eventList)) {
      eventList = [eventList];
    }
    this[autoOffList] = this[autoOffList] || [];
    eventList.forEach(event => {
      let id = emitter.on(
        event,
        msg => {
          if (!pause || !this[pauseFlag]) {
            this[funname](msg, event);
          }
        },
        this,
        priority
      );
      autoOff && this[autoOffList].push(id);
    });
  });
  patchEmitter(context);
};
