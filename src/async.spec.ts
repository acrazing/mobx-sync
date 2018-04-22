/*!
 *
 * Copyright 2017 - acrazing
 *
 * @author acrazing joking.young@gmail.com
 * @since 2017-11-28 18:39:59
 * @version 1.0.0
 * @desc example.ts
 */

import * as assert from 'assert';
import { observable } from 'mobx';
import { sleep } from 'monofile-utilities/lib/sleep';
import { AsyncTrunk } from './async';
import { Keywords } from './constants';
import { ignore } from './ignore';
import { MemoryStorage } from './memory-storage';
import { toJSON } from './to-json';
import { version } from './version';

@version(4)
class N1 {
  @observable
  int = 1;
  map = observable.map<string, number>();
  list = observable.array<number>();
  @version(1)
  @observable
  vStr = 'vStr';
  @version(2)
  vMap = observable.map<string, number>();
  @version(3)
  vList = observable.array<number>();
}

class N2 {
  @observable hello = 'world';
  @ignore @observable ignored = 'ignored';
}

class N3 {
  none = 'none';
}

class Nm {
  @version(4)
  version = 'version';
}

class Root {
  n1 = new N1();
  @version(5)
  n2 = new N2();
  @ignore
  n3 = new N3();
  nm = new Nm();
}

const root = new Root();

const storage = new MemoryStorage();

const t1 = new AsyncTrunk(root, { storage });

describe('async trunk', () => {
  it('should be ignored', () => {
    const n2 = new N2();
    assert.deepEqual(toJSON(n2), { hello: 'world' });
  });
  it('version control', () => {
    assert.deepEqual(toJSON(root), {
      n1: {
        int: 1,
        map: {},
        list: [],
        vStr: 'vStr',
        vMap: {},
        vList: [],
        [Keywords.Versions]: {
          [Keywords.NodeVersion]: 4,
          vStr: 1,
          vMap: 2,
          vList: 3,
        },
      },
      n2: {
        hello: 'world',
      },
      nm: {
        [Keywords.Versions]: {
          version: 4,
        },
        version: 'version',
      },
      [Keywords.Versions]: {
        n2: 5,
      },
    });
  });
  it('init', async () => {
    await t1.init();
    root.n1.map.set('1', 2);
    root.n1.list.push(3);
    root.n1.vList.push(4);
    root.n2.hello = '5';
    root.n3.none = '6';
    root.n1.vMap.set('7', 8);
    root.nm.version = 'changed version';
    await sleep(100);
    t1.disposer();

    console.log('next');

    @version(6)
    class N4 extends N1 {
    }

    class N5 extends Nm {
      @version(5)
      version = 'new version';
    }

    const root2 = new Root();
    root2.n1 = new N4();
    root2.nm = new N5();

    const t2 = new AsyncTrunk(root2, { storage });
    await t2.init();
    await sleep(100);
    assert.deepEqual(toJSON(root2.n1), toJSON(new N1()));
    assert.deepEqual(toJSON(root2.n2), toJSON(root.n2));
    assert.deepEqual(toJSON(root2.n3), { none: '6' });
    assert.deepEqual(toJSON(root2.nm), toJSON(new N5()));
  });

  it('should autorun', async () => {
    class Node {
      @observable hello = 'world';
    }

    const store = { node: new Node };

    const storage = new MemoryStorage(true);

    const trunk = new AsyncTrunk(store, { storage, storageKey: 'key' });

    await trunk.init();
    store.node.hello = 'John';
    await sleep(100);
    assert.deepEqual(JSON.parse(storage.getItem('key') as string), { node: { hello: 'John' } });
  });
});