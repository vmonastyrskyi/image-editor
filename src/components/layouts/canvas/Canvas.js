import React, {Component} from 'react';
import $ from 'jquery';
import Actions from '../../../constants/Constants';
import AppStore from '../../../store/AppStore';
import AppDispatcher from "../../../dispatcher/Dispatcher";
import * as PIXI from 'pixi.js';
import './Canvas.css';

export default class Canvas extends Component {
  constructor(props) {
    super(props);

    this.state = {
      app: AppStore.getApp(),
      images: AppStore.getImages(),
      currentImage: AppStore.getCurrentImage(),
      enableRemove: false
    };

    this.canvasRef = React.createRef();
  }

  componentWillMount() {
    AppStore.addChangeListener(this.updateState);
  }

  componentWillUnmount() {
    AppStore.removeChangeListener(this.updateState);
  }

  componentDidMount() {
    const canvas = this.canvasRef.current;

    let w = $('.canvas').width();
    let h = $('.canvas').height();

    const app = new PIXI.Application({
      view: canvas,
      width: w,
      height: h,
      transparent: true,
      resolution: window.devicePixelRatio,
      autoDensity: true,
    })

    const graphics = new PIXI.Graphics();
    graphics.lineStyle(1, 0xC8C8C8);
    for (var i = 0; i < w / 40; i++) {
      for (var j = 0; j < h / 40; j++) {
        graphics.drawRect((i * 40) - 1, (j * 40) - 1, 40, 40);
      }
    }
    app.stage.addChild(graphics);

    window.addEventListener('resize', resize);

    function resize() {
      w = $('.canvas').width();
      h = $('.canvas').height();

      app.renderer.resize(w, h);
    }

    AppDispatcher.dispatch({
      type: Actions.SET_APP,
      payload: app,
    });
  }

  startCompare = () => {
    const {app, currentImage} = this.state;

    const lastChild = app.stage.getChildAt(app.stage.children.length - 1)
    if (currentImage !== undefined && currentImage !== lastChild) {
      this.setState({enableRemove: true});
      app.stage.addChild(currentImage);
    }
  }

  endCompare = () => {
    const {app, enableRemove} = this.state;

    if (enableRemove) {
      this.setState({enableRemove: false});
      app.stage.removeChildAt(app.stage.children.length - 1);
    }
  }

  updateState = () => {
    this.setState({
      app: AppStore.getApp(),
      images: AppStore.getImages(),
      currentImage: AppStore.getCurrentImage(),
    });
  }

  render() {
    const {app} = this.state;

    const image = AppStore.getCurrentImage();
    let showHelper = false;

    if (app !== undefined) {
      if (image !== undefined && image !== null) {
        showHelper = true;
      }
    }

    return (
      <div className='canvas'>
        <canvas ref={this.canvasRef}/>
        {showHelper &&
        <div className='helper'>
          <div>
            <span className='size'>{image.texture.width}px × {image.texture.height}px</span>
          </div>
          <div>
            <button className='decrease'>−</button>
            <span className='percent'>{parseInt(100 * image.scale.x)}%</span>
            <button className='increase'>+</button>
          </div>
          <div>
            <button className='compare'
                    onMouseDown={this.startCompare} onMouseUp={this.endCompare}>Сравнить
            </button>
          </div>
        </div>
        }
      </div>
    );
  }
}
