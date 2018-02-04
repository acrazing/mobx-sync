/*!
 *
 * Copyright 2018 - acrazing
 *
 * @author acrazing joking.young@gmail.com
 * @since 2018-01-06 12:23:01
 * @version 1.0.0
 * @desc version.ts
 */

import { Keywords } from './constants'

export function version(value: number | string) {
  return (p: any, key = Keywords.NodeVersion) => {
    if (typeof p === 'function') {
      p = p.prototype
    }
    if (!p.hasOwnProperty(Keywords.Versions)) {
      p[Keywords.Versions] = Object.create(p[Keywords.Versions] || null)
      const toJSON = p.toJSON
      p.toJSON = function (this: any) {
        this[Keywords.Versions] = p[Keywords.Versions]
        this.toJSON = toJSON
        return toJSON ? toJSON.call(this) : this
      }
    }
    p[Keywords.Versions][key] = value
  }
}
