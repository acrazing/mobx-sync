/*!
 * Copyright 2018 acrazing <joking.young@gmail.com>. All rights reserved.
 * @since 2018-06-27 00:31:58
 */

import * as assert from 'assert';
import { observable } from 'mobx';
import { describe, it } from 'mocha';
import { nonenumerable } from 'monofile-utilities';
import { date, ignore, regexp, version } from './decorators';
import { KeyNodeVersion, KeyVersions } from './keys';
import { parseStore } from './parse-store';
import { toJSON } from './utils';

describe('decorator:format', () => {
  it('format date/regexp', () => {
    const time = new Date();
    const reg = /abc/igum;

    class N {
      @date date = time;
      @regexp reg = reg;
    }

    const n = new N();

    assert.deepStrictEqual(toJSON(n), {
      date: time.toISOString(),
      reg: { source: reg.source, flags: reg.flags },
    });
    const data = JSON.parse(JSON.stringify(n));
    const store = new N();
    store.date = new Date(0);
    store.reg = /def/igu;
    assert.notDeepEqual(toJSON(store), toJSON(n));
    parseStore(store, data);
    assert.deepStrictEqual(store, n);
  });
});

describe('decorator:ignore', () => {
  it('should be ignored', () => {
    class Node {
      @observable n0 = 'n0';
      @ignore @observable ignored = 'ignored';
      @observable normal = 'normal';
    }

    const node = new Node();
    assert.deepStrictEqual(toJSON(node), { normal: 'normal', n0: 'n0' });
  });

  it('should not working with nonenumerable', () => {
    class Node {
      @observable n0 = 'n0';
      @nonenumerable @observable n1 = 'n1';
      @observable n2 = 'n2';
      @nonenumerable n3 = 'n3';
    }

    assert.deepStrictEqual(
      toJSON(new Node()),
      { n0: 'n0', n1: 'n1', n2: 'n2' },
    );
  });
});

describe('decorator:version', () => {
  @version(2)
  class Node {
    @version(1)
    id = 0;
  }

  const node = new Node();

  it('should persist versions', () => {
    assert.deepStrictEqual(
      toJSON(node),
      { [KeyVersions]: { id: 1, [KeyNodeVersion]: 2 }, id: 0 },
    );
  });

  it('should persist versions with extends', () => {
    class P {
      @version(1)
      p = 1;
    }

    class C extends P {
      @version(2)
      c = 2;
    }

    const c = new C();
    assert.deepStrictEqual(toJSON(c), {
      p: 1,
      c: 2,
      [KeyVersions]: {
        p: 1,
        c: 2,
      },
    });
  });
});
