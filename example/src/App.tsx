/*!
 * Copyright 2018 acrazing <joking.young@gmail.com>. All rights reserved.
 * @since 2018-09-08 11:13:51
 */

import { observer } from 'mobx-react';
import * as React from 'react';
import { store } from './store';

@observer
export class App extends React.Component {
  render() {
    return (
      <div>
        {store.storeLoaded ? 'Persisted store is loaded' : 'Loading stores...'}
      </div>
    );
  }
}
