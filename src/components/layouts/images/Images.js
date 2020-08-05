import React, {Component} from 'react';
import Actions from '../../../constants/Constants';
import AppStore from '../../../store/AppStore';
import AppDispatcher from "../../../dispatcher/Dispatcher";
import idGenerator from 'react-id-generator';
import * as PIXI from 'pixi.js';
import _ from 'lodash';
import './Images.css';

export default class Images extends Component {
  constructor(props) {
    super(props);

    this.state = {
      app: AppStore.getApp(),
      images: AppStore.getImages(),
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

  selectSprite = (image) => {
    const {app, currentImage} = this.state;

    if (image !== currentImage) {
      if (app.stage.children.length > 1) {
        app.stage.removeChildren(1, app.stage.children.length);
      }
      app.stage.addChild(image);

      AppDispatcher.dispatch({
        type: Actions.SET_CURRENT_IMAGE,
        payload: image
      });
    }
  }

  removeSprite = (e, image) => {
    e.stopPropagation();

    const {app, currentImage} = this.state;

    if (currentImage === image) {
      app.stage.removeChildren(1, app.stage.children.length);
    }

    AppDispatcher.dispatch({
      type: Actions.REMOVE_IMAGE,
      payload: image
    });
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
    const {images, currentImage} = this.state;

    return (
      <div className='images'>
        <button className='file-uploader' onClick={this.openFileDialog}><span>Загрузка</span></button>
        <input ref={this.fileUploader}
               type='file'
               onChange={this.handleOpenFile}
               onClick={(e) => {
                 e.target.value = ''
               }}/>
        <div className='divider'/>
        <ul className='sprites'>
          {images.map((image, index) => {
            return <li key={index} className={image === currentImage ? 'selected' : ''} onClick={() => {
              this.selectSprite(image)
            }}>
              <img src={image.texture.baseTexture.resource.url} alt=''/>
              <div>
                <button onClick={(e) => {
                  this.removeSprite(e, image)
                }}>×
                </button>
              </div>
            </li>
          })}
        </ul>
      </div>
    );
  }
}
