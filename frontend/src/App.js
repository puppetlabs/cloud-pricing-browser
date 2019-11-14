import React from 'react';
import './App.css';

import AppRouter from './AppRouter';

import date from './data_updated.js'

function App() {
  return (
    <div className="App">
      <AppRouter />
      <footer>
      Data Last Updated: { date() }
      </footer>
    </div>
  );
}

export default App;
