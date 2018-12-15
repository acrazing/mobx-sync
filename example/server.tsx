/*!
 * Copyright 2018 acrazing <joking.young@gmail.com>. All rights reserved.
 * @since 2018-12-15 16:09:12
 */

import http from 'http';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { config } from '../src/config';
import { App } from './App';
import { RootStore } from './store';

// Note: this is required for avoid ignore some important store node/field
// when you render template by use JSON.stringify.
config({ ssr: true });

http.createServer((_req, res) => {
  const store = new RootStore();
  res.end(`<!doctype html>
<html>
<body>
<div id="root">${renderToStaticMarkup(<App/>)}</div>
<script>
// this is the initial state will be loaded by trunk
var __INITIAL_STATE__ = ${JSON.stringify(store)}
</script>
<script src="./index.tsx"></script>
</body>
</html>`);
});
