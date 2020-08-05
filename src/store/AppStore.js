import {EventEmitter} from 'events';
import AppDispatcher from '../dispatcher/Dispatcher';
import Actions from '../constants/Constants';
import _ from 'lodash';

class AppStore extends EventEmitter {
  constructor() {
    super();

    this.state = {
      app: undefined,
      currentImage: undefined,
      images: [],
    };

    AppDispatcher.register(this.handleActions.bind(this));
  }

  addImage(image) {
    this.state.images.push(image);
    this.state.currentImage = image;
    this.emit('change');
  }

  getImage(index) {
    return this.state.images[index];
  }

  getImages() {
    return this.state.images;
  }

  removeImage(image) {
    _.pull(this.state.images, image);
    this.state.currentImage = undefined;
    this.emit('change');
  }

  setCurrentImage(image) {
    this.state.currentImage = image;
    this.emit('change');
  }

  getCurrentImage() {
    return this.state.currentImage;
  }

  removeCurrentImage() {
    this.state.currentImage = undefined;
    this.emit('change');
  }

  setApp(app) {
    this.state.app = app;
    this.emit('change');
  }

  getApp() {
    return this.state.app;
  }

  addChangeListener(callback) {
    this.on('change', callback);
  };

  removeChangeListener(callback) {
    this.removeListener('change', callback);
  }

  handleActions(action) {
    switch (action.type) {
      case Actions.ADD_IMAGE: {
        this.addImage(action.payload);
        break;
      }
      case Actions.GET_IMAGE: {
        this.getImages(action.payload);
        break;
      }
      case Actions.GET_IMAGES: {
        this.getImages();
        break;
      }
      case Actions.REMOVE_IMAGE: {
        this.removeImage(action.payload);
        break;
      }
      case Actions.SET_CURRENT_IMAGE: {
        this.setCurrentImage(action.payload);
        break;
      }
      case Actions.GET_CURRENT_IMAGE: {
        this.getCurrentImage();
        break;
      }
      case Actions.REMOVE_CURRENT_IMAGE: {
        this.removeCurrentImage();
        break;
      }
      case Actions.SET_APP: {
        this.setApp(action.payload);
        break;
      }
      case Actions.GET_APP: {
        this.getApp();
        break;
      }
      default: {
        break;
      }
    }
  }
}

export default new AppStore();
