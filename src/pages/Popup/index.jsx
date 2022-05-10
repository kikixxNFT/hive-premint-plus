import React from 'react';
import { render } from 'react-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { createSyncedStorageAtom } from '@utils/createSyncedStorageAtom';

import Popup from './Popup';
import './index.css';

const queryClient = new QueryClient();
createSyncedStorageAtom();

render(
  <QueryClientProvider client={queryClient}>
    <Popup />
  </QueryClientProvider>,
  window.document.querySelector('#app-container')
);

if (module.hot) module.hot.accept();
