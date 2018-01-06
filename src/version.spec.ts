/*!
 *
 * Copyright 2018 - acrazing
 *
 * @author acrazing joking.young@gmail.com
 * @since 2018-01-06 17:06:43
 * @version 1.0.0
 * @desc version.spec.ts
 */

import * as assert from 'assert'
import { toJSON } from './misc.spec'
import { version } from './version'

describe('version control', () => {
  class Node {
    __version__ = 1

    @version(1)
    id = 0
  }

  const node = new Node()

  it('should persist versions', () => {
    assert.deepEqual(toJSON(node), { __versions__: { id: 1 }, __version__: 1, id: 0, toJSON: void 0 })
  })
})