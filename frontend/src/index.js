import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

import { Provider } from 'mobx-react'

import DataStore from './stores/dataStore'

// import 'bootstrap/dist/css/bootstrap.min.css';
import '@puppet/react-components/source/scss/library/ui.scss';

import { transitions, positions, Provider as AlertProvider } from 'react-alert'
import AlertTemplate from 'react-alert-template-basic'

// optional cofiguration
const options = {
  // you can also just use 'bottom center'
  position: positions.BOTTOM_LEFT,
  timeout: 5000,
  offset: '30px',
  // you can also just use 'scale'
  transition: transitions.SCALE
}

class RootStore {
  constructor() {
    this.dataStore           = new DataStore(this)
  }
}


ReactDOM.render(
	<Provider rootStore={new RootStore()}>
		<AlertProvider template={AlertTemplate} {...options}>
			<App />
		</AlertProvider>
	</Provider>,
	document.getElementById('root')
)
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
