/*!
 *
 * Copyright 2018 - acrazing
 *
 * @author acrazing joking.young@gmail.com
 * @since 2018-04-11 03:30:47
 * @version 1.0.0
 * @desc test.ts
 */


import { observable } from 'mobx'

export function nonenumerable(p: any, key: string, desc?: PropertyDescriptor): any {
  desc = desc || Object.getOwnPropertyDescriptor(p, key)
  let pValue: any
  if (desc) {
    desc.enumerable = false
    const { get, set } = desc
    pValue = desc.value
    desc.set = function (value) {
      set && set.call(this, value)
      if (this === p) {
        pValue = value
        return
      }
      const instDesc = Object.getOwnPropertyDescriptor(this, key)
      if (instDesc) {
        instDesc.enumerable = false
        Object.defineProperty(this, key, instDesc)
      } else {
        Object.defineProperty(this, key, {
          configurable: true,
          enumerable: false,
          writable: true,
          value: value,
        })
      }
    }
    desc.get = function () {
      return get ? get.call(this) : pValue
    }
    return desc
  }
  return {
    enumerable: false,
    configurable: true,
    set(value: any) {
      if (this === p) {
        pValue = value
        return
      }
      Object.defineProperty(this, key, {
        enumerable: false,
        configurable: true,
        writable: true,
        value: value,
      })
    },
    get() {
      return pValue
    },
  }
}

class N1 {
	@nonenumerable @observable ignored = 'ignored'
	@observable normal = 'normal'
}

class N2 {
	@observable normal = 'normal'
	@nonenumerable @observable ignored = 'ignored'
}

const n1 = new N1
const n2 = new N2

console.log('n1.ignored', Object.getOwnPropertyDescriptor(n1, 'ignored'))
console.log('n2.ignored', Object.getOwnPropertyDescriptor(n2, 'ignored'))