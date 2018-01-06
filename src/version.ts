/*!
 *
 * Copyright 2018 - acrazing
 *
 * @author acrazing joking.young@gmail.com
 * @since 2018-01-06 12:23:01
 * @version 1.0.0
 * @desc version.ts
 */

import { AMap } from 'monofile-utilities/lib/map'
import { __VERSIONS__ } from './constants'

export interface VersionStore {
  __versions__: AMap<number>;
  __version__: number;
}

export function version(value: number) {
  return (p: any, key: string) => {
    if (!p.hasOwnProperty(__VERSIONS__)) {
      p[__VERSIONS__] = Object.create(p[__VERSIONS__] || null)
      const toJSON = p.toJSON
      p.toJSON = function (this: any) {
        this[__VERSIONS__] = p[__VERSIONS__]
        this.toJSON = toJSON
        return toJSON ? toJSON.call(this) : this
      }
    }
    p[__VERSIONS__][key] = value
  }
}
