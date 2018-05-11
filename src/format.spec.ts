/*!
 *
 * Copyright 2018 - acrazing
 *
 * @author acrazing joking.young@gmail.com
 * @since 2018-05-11 21:28:55
 * @version 1.0.0
 * @desc unmarshal.spec.ts
 */

import * as assert from 'assert';
import { date, regexp } from './format';
import { parseStore } from './parse-store';
import { toJSON } from './to-json';

describe('specify unmarshal function', () => {
  it('should unmarshal date/regexp', () => {
    const time = new Date();
    const reg = /abc/igum;

    class N {
      @date date = time;
      @regexp reg = reg;
    }

    const n = new N();

    assert.deepEqual(toJSON(n), {
      date: time.toISOString(),
      reg: { source: reg.source, flags: reg.flags },
    });
    const data = JSON.parse(JSON.stringify(n));
    const store = new N();
    store.date = new Date(0);
    store.reg = /def/igu;
    assert.notDeepEqual(toJSON(store), toJSON(n));
    parseStore(store, data);
    assert.deepEqual(store, n);
  });
});