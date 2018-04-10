/*!
 *
 * Copyright 2018 - acrazing
 *
 * @author acrazing joking.young@gmail.com
 * @since 2018-04-11 02:59:42
 * @version 1.0.0
 * @desc ignore.spec.ts
 */


import { ignore } from './ignore'
import { observable } from 'mobx'
import * as assert from 'assert'
import { toJSON } from './to-json'

describe('ignore', () => {
	it('should be ignored', () => {
		class Node {
			@ignore
			@observable
			ignored = 'ignored'

			@observable normal = 'normal'
		}

		const node = new Node()
		assert.deepEqual(toJSON(node), { normal: 'normal' })
	})

	it('should not be enumerable', () => {
		class N1 {
			@ignore @observable ignored = 'ignored'
			@observable normal = 'normal'
		}

		class N2 {
			@observable normal = 'normal'
			@ignore @observable ignored = 'ignored'
		}

		const n1 = new N1
		const n2 = new N2
		assert.equal(toJSON(Object.getOwnPropertyDescriptor(n1, 'ignored')), { enumerable: false, configurable: true })
		assert.equal(toJSON(Object.getOwnPropertyDescriptor(n2, 'ignored')), { enumerable: false, configurable: true })
	})
})