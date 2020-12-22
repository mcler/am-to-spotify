import './index.css';

import React from 'react';
import ReactDOM from 'react-dom';
import { store } from './store';
import App from './App';

import { StoreContext } from 'storeon/react'

ReactDOM.render(
    // <React.StrictMode>
        <StoreContext.Provider value={store}>
            <App />
        </StoreContext.Provider>
    // </React.StrictMode>
    ,
    document.getElementById('root')
);
