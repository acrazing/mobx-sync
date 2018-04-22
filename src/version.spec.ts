/*!
 *
 * Copyright 2018 - acrazing
 *
 * @author acrazing joking.young@gmail.com
 * @since 2018-01-06 17:06:43
 * @version 1.0.0
 * @desc version.spec.ts
 */

import * as assert from 'assert';
import { Keywords } from './constants';
import { toJSON } from './to-json';
import { version } from './version';

describe('version control', () => {
  @version(2)
  class Node {
    @version(1)
    id = 0;
  }

  const node = new Node();

  it('should persist versions', () => {
    assert.deepEqual(toJSON(node), { [Keywords.Versions]: { id: 1, [Keywords.NodeVersion]: 2 }, id: 0 });
  });
});