import React from 'react';
import Router from './Router';
import './styles/global.scss';

function App({ RouterComponent = React.Fragment }) {
  return (
    <RouterComponent>
      <Router />
    </RouterComponent>
  );
}

export default App;
