import React, {Component} from 'react';
import AppStore from '../../../store/AppStore';
import * as PIXI from 'pixi.js';
import './Controls.css';

export default class Controls extends Component {
  constructor(props) {
    super(props);

    this.state = {
      app: AppStore.getApp(),
      currentImage: AppStore.getCurrentImage(),
      brightness: 0,
      contrast: 0,
    };
  }

  componentWillMount() {
    AppStore.addChangeListener(this.updateState);
  }

  componentWillUnmount() {
    AppStore.removeChangeListener(this.updateState);
  }

  onBrightnessChange = (e) => {
    this.setState({
      brightness: parseInt(e.target.value),
    })

    this.changeImage();
  }

  onContrastChange = (e) => {
    this.setState({
      contrast: parseInt(e.target.value),
    })

    this.changeImage();
  }

  changeImage = () => {
    const {app, currentImage} = this.state;

    const vW = app.view.width, vH = app.view.height;

    if (currentImage !== undefined) {
      let brightness = this.state.brightness * 1.275;
      let contrast = (100 + this.state.contrast) / 100.0;
      contrast *= contrast;

      let image = new Image();
      image.src = currentImage.texture.baseTexture.resource.url;

      const iW = image.width, iH = image.height;

      const canvas = document.createElement('canvas');
      canvas.width = iW;
      canvas.height = iH;

      const context = canvas.getContext('2d');
      context.drawImage(image, 0, 0);

      const imageData = context.getImageData(0, 0, iW, iH);
      const data = imageData.data;

      let R, G, B, pixel;
      for (var i = 0; i < data.length; i += 4) {
        R = data[i + 0];
        G = data[i + 1];
        B = data[i + 2];

        if (brightness !== 0) {
          R += brightness;
          G += brightness;
          B += brightness;

          if (R < 0) R = 0;
          else if (R > 255) R = 255;
          data[i + 0] = R;
          if (G < 0) G = 0;
          else if (G > 255) G = 255;
          data[i + 1] = G;
          if (B < 0) B = 0;
          else if (B > 255) B = 255;
          data[i + 2] = B;
        }

        if (contrast !== 1) {
          pixel = R / 255.0;
          pixel -= 0.5;
          pixel *= contrast;
          pixel += 0.5;
          pixel *= 255;
          if (pixel < 0) pixel = 0;
          else if (pixel > 255) pixel = 255;
          data[i + 0] = parseInt(pixel);

          pixel = G / 255.0;
          pixel -= 0.5;
          pixel *= contrast;
          pixel += 0.5;
          pixel *= 255;
          if (pixel < 0) pixel = 0;
          else if (pixel > 255) pixel = 255;
          data[i + 1] = parseInt(pixel);

          pixel = B / 255.0;
          pixel -= 0.5;
          pixel *= contrast;
          pixel += 0.5;
          pixel *= 255;
          if (pixel < 0) pixel = 0;
          else if (pixel > 255) pixel = 255;
          data[i + 2] = parseInt(pixel);
        }
      }
      context.putImageData(imageData, 0, 0);

      const sprite = new PIXI.Sprite(PIXI.Texture.from(canvas));
      sprite.x = app.renderer.screen.width / 2;
      sprite.y = (app.renderer.screen.height / 2) - 31;
      sprite.anchor.x = 0.5;
      sprite.anchor.y = 0.5;

      let scale = 1;
      if (iW >= vW - (vW / 10) * 2 || iH >= vH - (vH / 10) * 2) {
        while (iW * scale > vW - (vW / 10) * 2 || iH * scale > vH - (vH / 10) * 2) {
          scale -= scale / 10;
        }
        sprite.scale.set(scale, scale);
      }

      app.stage.removeChildren(1, app.stage.children.length);
      app.stage.addChild(sprite);
    }
  }

  edgeDetection = () => {
    const {app, currentImage} = this.state;

    const vW = app.view.width, vH = app.view.height;

    if (currentImage !== undefined) {
      let image = new Image();
      image.src = currentImage.texture.baseTexture.resource.url;

      const iW = image.width, iH = image.height;

      const canvas = document.createElement('canvas');
      canvas.width = iW;
      canvas.height = iH;

      const context = canvas.getContext('2d');
      context.drawImage(image, 0, 0);

      const imageData = context.getImageData(0, 0, iW, iH);
      const data = imageData.data;

      let kernelX = [], kernelY = [];
      for (let i = 0; i < 3; i++) {
        kernelX[i] = [];
        kernelY[i] = [];
      }
      kernelX[0][0] = -1;
      kernelX[0][1] = 0;
      kernelX[0][2] = 1;
      kernelX[1][0] = -2;
      kernelX[1][1] = 0;
      kernelX[1][2] = 2;
      kernelX[2][0] = -1;
      kernelX[2][1] = 0;
      kernelX[2][2] = 1;

      kernelY[0][0] = -1;
      kernelY[0][1] = -2;
      kernelY[0][2] = -1;
      kernelY[1][0] = 0;
      kernelY[1][1] = 0;
      kernelY[1][2] = 0;
      kernelY[2][0] = 1;
      kernelY[2][1] = 2;
      kernelY[2][2] = 1;

      function getAvPixelColor(data, x, y) {
        const index = (y * iW + x) * 4;
        return (data[index + 0] + data[index + 1] + data[index + 2]) / 3;
      }

      for (let x = 0; x < iW; x++) {
        for (let y = 0; y < iH; y++) {
          let Gx, Gy;
          if (x <= 1 || y <= 1 || x >= iW - 2 || y >= iH - 2) {
            Gx = 0;
            Gy = 0;
          } else {
            let d00 = getAvPixelColor(data, x + 0, y + 0);
            let d10 = getAvPixelColor(data, x + 1, y + 0);
            let d20 = getAvPixelColor(data, x + 2, y + 0);

            let d01 = getAvPixelColor(data, x + 0, y + 1);
            let d11 = getAvPixelColor(data, x + 1, y + 1);
            let d21 = getAvPixelColor(data, x + 2, y + 1);

            let d02 = getAvPixelColor(data, x + 0, y + 2);
            let d12 = getAvPixelColor(data, x + 1, y + 2);
            let d22 = getAvPixelColor(data, x + 2, y + 2);

            Gx =
              (kernelX[0][0] * d00) + (kernelX[0][1] * d10) + (kernelX[0][2] * d20) +
              (kernelX[1][0] * d01) + (kernelX[1][1] * d11) + (kernelX[1][2] * d21) +
              (kernelX[2][0] * d02) + (kernelX[2][1] * d12) + (kernelX[2][2] * d22);

            Gy =
              (kernelY[0][0] * d00) + (kernelY[0][1] * d10) + (kernelY[0][2] * d20) +
              (kernelY[1][0] * d01) + (kernelY[1][1] * d11) + (kernelY[1][2] * d21) +
              (kernelY[2][0] * d02) + (kernelY[2][1] * d12) + (kernelY[2][2] * d22);
          }

          let G = Math.abs(Gx) + Math.abs(Gy);
          if (G > 255) {
            G = 255;
          }
          G = 255 - G;

          data[(y * iW + x) * 4 + 0] = G;
          data[(y * iW + x) * 4 + 1] = G;
          data[(y * iW + x) * 4 + 2] = G;
        }
      }
      context.putImageData(imageData, 0, 0);

      const sprite = new PIXI.Sprite(PIXI.Texture.from(canvas));
      sprite.x = app.renderer.screen.width / 2;
      sprite.y = (app.renderer.screen.height / 2) - 31;
      sprite.anchor.x = 0.5;
      sprite.anchor.y = 0.5;

      let scale = 1;
      if (iW >= vW - (vW / 10) * 2 || iH >= vH - (vH / 10) * 2) {
        while (iW * scale > vW - (vW / 10) * 2 || iH * scale > vH - (vH / 10) * 2) {
          scale -= scale / 10;
        }
        sprite.scale.set(scale, scale);
      }

      app.stage.removeChildren(1, app.stage.children.length);
      app.stage.addChild(sprite);
    }
  }

  updateState = () => {
    this.setState({
      app: AppStore.getApp(),
      currentImage: AppStore.getCurrentImage(),
      brightness: 0,
      contrast: 0
    });
  }

  render() {
    const {currentImage, brightness, contrast} = this.state;

    return (
      <div className='controls'>
        <div className={currentImage !== undefined ? 'options' : 'options disabled'}>
          <span>Базовое регулирование</span>
          <div>
            <span className='title'>Яркость</span>
            <span className='value'>{brightness}</span>
            <input className='slider' type='range' min='-100' max='100' step='1' value={brightness}
                   onMouseUp={this.onBrightnessChange} onChange={this.onBrightnessChange}
                   disabled={currentImage === undefined}/>
          </div>
          <div>
            <span className='title'>Контрастность</span>
            <span className='value'>{contrast}</span>
            <input className='slider' type='range' min='-100' max='100' step='1' value={contrast}
                   onMouseUp={this.onContrastChange} onChange={this.onContrastChange}
                   disabled={currentImage === undefined}/>
          </div>
          <div>
            <span className='title'>Резкость</span>
            <span className='value'>0</span>
            <input className='slider' type='range' min='-100' max='100' step='1' defaultValue='0'
                   disabled={currentImage === undefined}/>
          </div>
          <div>
            <div className='button' onClick={this.edgeDetection} disabled={currentImage === undefined}>
              Отобразить контуры
            </div>
          </div>
        </div>
      </div>
    );
  }
}
