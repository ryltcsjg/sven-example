export function throttle(time = 300, callWhenEnd = false) {
  let flag = true;
  let callAgain = null;
  return function(target, key, descriptor) {
    let func = target[key];
    let descriptorFun = function(...args) {
      if (!flag) {
        callWhenEnd && (callAgain = { args });
        return;
      }
      flag = false;
      callAgain = null;
      func.apply(this, args);
      if (!time) {
        flag = true;
        return;
      }
      setTimeout(() => {
        flag = true;
        if (callWhenEnd && callAgain) {
          descriptorFun.apply(this, callAgain.args);
        }
      }, time);
    };
    descriptor.value = descriptorFun;
  };
}
