import React from 'react';
import { render } from 'react-dom';
import { createSyncedStorageAtom } from '@utils/createSyncedStorageAtom';
import Options from './Options';
import './index.css';

createSyncedStorageAtom();

render(<Options />, window.document.querySelector('#app-container'));

if (module.hot) module.hot.accept();
