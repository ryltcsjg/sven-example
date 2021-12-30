import { autorun, reaction as mobxReaction } from 'mobx';
import { newSymbol, patch } from '../utils/utils';

const mobxIsUnmounted = newSymbol('isUnmounted');

export const symbolAutorun = newSymbol('autorun');
export const symbolReaction = newSymbol('reaction');
export const symbolPatchFlag = newSymbol('patchFlag');

const symbolDispose = newSymbol('dispose');

export function _autorun(context, funname) {
  context[symbolAutorun] = context[symbolAutorun] || [];
  context[symbolAutorun].push(funname);
  makeClassComponentObserver(context);
}

export const reaction = (reactionFun, option) => (context, funname) => {
  context[symbolReaction] = context[symbolReaction] || [];
  context[symbolReaction].push({ funname, reactionFun: reactionFun, option });
  makeClassComponentObserver(context);
};

function makeClassComponentObserver(target) {
  if (target[symbolPatchFlag]) {
    return;
  }
  target[symbolPatchFlag] = true;

  //被添加到舞台上时调用
  patch(target, 'onLoad', function () {
    let autorunKeys = this[symbolAutorun] || [];
    let reactionKeys = this[symbolReaction] || [];
    let name = '';
    if (CC_DEBUG) {
      name = `${(this.node && this.node.name) || ''}.${(this.constructor && this.constructor.name) || ''}.`;
    }
    this[symbolDispose] = [];
    autorunKeys.forEach((key) => {
      let dispose = autorun(
        (r) => {
          this[key](r);
        },
        { name: name + key } //方便调试
      );
      this[symbolDispose].push(dispose);
    });
    this[mobxIsUnmounted] = false;

    reactionKeys.forEach(({ funname, reactionFun, option }) => {
      let dispose = mobxReaction(
        (r) => reactionFun(this, r),
        (data, r) => {
          this[funname](data, r);
        },
        { name: name + funname, ...option }
      );
      this[symbolDispose].push(dispose);
    });
  });

  patch(target, 'onDestroy', function () {
    this[symbolDispose] && this[symbolDispose].forEach((dispose) => dispose());
    this[symbolDispose] = [];

    this[mobxIsUnmounted] = true;
  });
}
