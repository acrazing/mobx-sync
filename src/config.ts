/*!
 * Copyright 2018 acrazing <joking.young@gmail.com>. All rights reserved.
 * @since 2018-12-15 15:35:02
 */

import { __assign } from 'tslib';

export const options = {
  /**
   * is ssr or not, this only need to be set as true at server side.
   */
  ssr: false,
};

/**
 * update the configuration
 * @param input
 */
export function config(input: Partial<typeof options>) {
  __assign(options, input);
}
