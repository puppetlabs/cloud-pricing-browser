import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { Provider } from 'mobx-react'

import DataStore from './stores/dataStore'

import Enzyme from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { shallow } from "enzyme";

Enzyme.configure({ adapter: new Adapter() });

class RootStore {
  constructor() {
    this.dataStore           = new DataStore(this)
  }
}

it('renders without crashing', () => {
  const div = document.createElement('div');
  shallow(<App />);
});
