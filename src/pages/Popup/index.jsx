import React from 'react';
import { render } from 'react-dom';
import { QueryClient, QueryClientProvider } from 'react-query'

import Popup from './Popup';
import './index.css';

const queryClient = new QueryClient();

render(<QueryClientProvider client={queryClient}><Popup /></QueryClientProvider>, window.document.querySelector('#app-container'));

if (module.hot) module.hot.accept();
