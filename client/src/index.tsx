import ReactDOM from 'react-dom';
import MainProvider from './app';
import './index.css';

ReactDOM.render(
  // <React.StrictMode> //If StrictMode is enabled, external funtions that use array.push() e.g. hit() won't work correctly in the player reducer
  <MainProvider />,
  // </React.StrictMode>,
  document.getElementById('root')
);

/**
 * Sound
 * UI refactoring and responsiveness
 */