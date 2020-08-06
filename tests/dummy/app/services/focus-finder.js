import MFF from '../utils/focus-finder';
import Service, { inject as service } from '@ember/service';
import { action, set } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class FocusFinderService extends Service {
  @service() notifications;

  @tracked
  config =  {
    // keymap : {},  //override the default browser keymap
    // weightOverrideAttribute : 'weight-override', // weight-override-up, down, left, and right can be set to 'distance' or 'azimuth' and the other will be disregarded
    // focusedClass : '', // a focus class for non focusable elements
    // defaultFocusedElement : '', // a element reference, or a selector
    // container : '', //the container in which this thing lives, default to the document.,
    // eventNamespace : '', //custom namespace for events, default to 'magicFocusFinder'
    // overrideDirectionAttribute : 'focus-overrides',
    // captureFocusAttribute : 'capture-focus',
    // dynamicPositionAttribute : 'dynamic-position',
    // useRealFocus : true, // Will trigger `blur` and `focus` on the actual elements, if set to false, bypass this.
    azimuthWeight: 1, // Higher value means that it will prefer elements in the direction it is going
    distanceWeight : 1, // Higher value means that it will prefer elements that are closer
    debug: false, // Setting to true will replace the elements innerHTML with the computed distance (weighted azimuth + weighted distance),
  };

  constructor(...args) {
    super(...args);
    this.mff = MFF.configure(this.config);
  }

  start() {
    this.mff
      .start();

    this.mff
      .getContainer()
      .addEventListener('focus-moved', (event) => {
        console.log(event);
        this.notifications.info(`Focus Moved : ${event.data.direction}`, {
          autoClear: true,
          clearDuration: 1000
        });
      });
  }

  @action
  onConfigChanged(property, { target: { value }}) {
    set(this.config, property, value);
    this.mff
      .configure(this.config)
      .start();
  }

  @action
  toggleDebug() {
    set(this.config, 'debug', !this.config.debug);
    this.mff
      .configure(this.config)
      .start();
  }
}
