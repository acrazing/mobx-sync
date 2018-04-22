/*!
 *
 * Copyright 2018 - acrazing
 *
 * @author acrazing joking.young@gmail.com
 * @since 2018-04-11 02:59:42
 * @version 1.0.0
 * @desc ignore.spec.ts
 */

import * as assert from 'assert';
import { observable } from 'mobx';
import { nonenumerable } from 'monofile-utilities/lib/nonenumerable';
import { ignore } from './ignore';
import { toJSON } from './to-json';

describe('ignore', () => {
  it('should be ignored', () => {
    class Node {
      @observable n0 = 'n0';
      @ignore @observable ignored = 'ignored';
      @observable normal = 'normal';
    }

    const node = new Node();
    assert.deepEqual(toJSON(node), { normal: 'normal', n0: 'n0' });
  });

  it('should not working with nonenumerable', () => {
    class Node {
      @observable n0 = 'n0';
      @nonenumerable @observable n1 = 'n1';
      @observable n2 = 'n2';
      @nonenumerable n3 = 'n3';
    }

    assert.deepEqual(toJSON(new Node()), { n0: 'n0', n1: 'n1', n2: 'n2' });
  });
});