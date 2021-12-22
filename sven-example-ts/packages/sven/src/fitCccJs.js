import { clickEvents, patchClickFlag } from './click/clickEvent';
import { patchEmitterFlag, autoOffList } from './emitter/EmitterClass';
import { symbolPatchFlag, symbolAutorun, symbolReaction } from './cc-mobx/ObserverClass';
import { mobxMixins } from './utils/utils';

const filterProps = [
  clickEvents,
  patchClickFlag,
  patchEmitterFlag,
  autoOffList,
  symbolAutorun,
  symbolReaction,
  symbolPatchFlag,
  mobxMixins,
];

const orignal = cc.Class;
const CCClass = function(options) {
  let props = [];
  filterProps.forEach(key => {
    if (options[key]) {
      props.push({ key, value: options[key] });
      delete options[key];
    }
  });
  if (props.length > 0) {
    let func = options.ctor;
    options.ctor = function() {
      props.forEach(({ key, value }) => (this[key] = value));
      func && func.call(this);
    };
  }

  return orignal(options);
};

for (let key in cc.Class) {
  CCClass[key] = cc.Class[key];
}

cc.Class = CCClass;
