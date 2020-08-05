import React, {Component} from 'react';
import Header from './components/layouts/header/Header';
import Canvas from './components/layouts/canvas/Canvas';
import Controls from './components/layouts/controls/Controls';
import Images from './components/layouts/images/Images';
import './App.css';

export default class App extends Component {
  render() {
    return (
      <div className="body">
        <Header/>
        <div className='container'>
          <Controls/>
          <Canvas/>
          <Images/>
        </div>
      </div>
    );
  }
};
