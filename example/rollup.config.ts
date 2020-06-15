/*!
 * Copyright 2020 acrazing <joking.young@gmail.com>. All rights reserved.
 * @since 2020-06-15 20:08:47
 */
import commonjs from '@rollup/plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import sourceMaps from 'rollup-plugin-sourcemaps';
import typescript from 'rollup-plugin-typescript2';

import pkg from './package.json';

export default {
  input: 'src/index.tsx',
  output: [
    { file: pkg.main, format: 'cjs', sourcemap: true },
    { file: pkg.module, format: 'es', sourcemap: true },
  ],
  external: Object.keys(pkg.dependencies).filter((v) => v !== 'mobx-sync'),
  plugins: [
    typescript(),
    commonjs(),
    resolve({ preferBuiltins: true }),
    sourceMaps(),
  ],
};
