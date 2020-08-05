import React, {Component} from 'react';
import Actions from '../../../constants/Constants';
import AppStore from '../../../store/AppStore';
import AppDispatcher from "../../../dispatcher/Dispatcher";
import idGenerator from 'react-id-generator';
import * as PIXI from 'pixi.js';
import _ from 'lodash';
import './Header.css';

export default class Header extends Component {
  constructor(props) {
    super(props);

    this.state = {
      app: AppStore.getApp(),
      sprites: AppStore.getImages(),
      currentImage: AppStore.getCurrentImage()
    };

    this.fileUploader = React.createRef();
  }

  componentWillMount() {
    AppStore.addChangeListener(this.updateState);
  }

  componentWillUnmount() {
    AppStore.removeChangeListener(this.updateState);
  }

  handleOpenFile = (e) => {
    const {app, currentImage} = this.state;

    const vW = app.view.width, vH = app.view.height;

    var file = e.target.files[0];

    if (file !== undefined) {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);

      fileReader.onload = (e) => {
        const loader = PIXI.Loader.shared;

        let id = undefined;
        _.forEach(loader.resources, (value, key) => {
          if (value.url === e.target.result) {
            id = key;
            return;
          }
        });

        if (id === undefined) {
          loader.add(id = idGenerator('sprite-'), e.target.result);
        }

        loader.load(() => {
          const image = new PIXI.Sprite(loader.resources[id].texture);

          image.x = app.renderer.screen.width / 2;
          image.y = (app.renderer.screen.height / 2) - 31;
          image.anchor.x = 0.5;
          image.anchor.y = 0.5;

          const iW = image.width, iH = image.height;

          let scale = 1;
          if (iW >= vW - (vW / 10) * 2 || iH >= vH - (vH / 10) * 2) {
            while (iW * scale > vW - (vW / 10) * 2 || iH * scale > vH - (vH / 10) * 2) {
              scale -= scale / 10;
            }
            image.scale.set(scale, scale);
          }

          app.stage.removeChild(currentImage);
          app.stage.addChild(image);

          AppDispatcher.dispatch({
            type: Actions.ADD_IMAGE,
            payload: image
          });
        });
      }
    }
  }

  original = () => {
    const {app, currentImage} = this.state;

    const lastChild = app.stage.getChildAt(app.stage.children.length - 1)
    if (currentImage !== undefined && currentImage !== lastChild) {
      app.stage.removeChild(lastChild);
      app.stage.addChild(currentImage);

      AppDispatcher.dispatch({
        type: Actions.SET_CURRENT_IMAGE,
        payload: currentImage
      });
    }
  }

  save = () => {

  }

  openFileDialog = () => {
    this.fileUploader.current.click();
  }

  updateState = () => {
    this.setState({
      app: AppStore.getApp(),
      images: AppStore.getImages(),
      currentImage: AppStore.getCurrentImage()
    });
  }

  render() {
    const {currentImage} = this.state;

    return (
      <div className='header'>
        <div className='logo'>
          <span>Foto Editor</span>
        </div>
        <div className='buttons'>
          <div onClick={this.openFileDialog}>
            <i className="fas fa-folder-open"></i><span>Открыть</span>
          </div>
          <div className='disabled'>
            <i className="fas fa-undo"></i><span>Отменить</span>
          </div>
          <div className='disabled'>
            <i className="fas fa-redo"></i><span>Повторить</span>
          </div>
          <div className={currentImage === undefined ? 'disabled' : ''} onMouseDown={this.original}>
            <i className="fas fa-image"></i><span>Оригинал</span>
          </div>
          <div className={currentImage === undefined ? 'disabled' : ''} onClick={this.save}>
            <i className="fas fa-save"></i><span>Сохранить</span>
          </div>
          <input type='file' ref={this.fileUploader} onChange={this.handleOpenFile}
                 onClick={(e) => {
                   e.target.value = ''
                 }}>
          </input>
        </div>
      </div>
    );
  }
}
