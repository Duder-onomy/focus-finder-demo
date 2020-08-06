import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class IndexRoute extends Route {
  @service() focusFinder;

  afterModel() {
    this.focusFinder.start();
  }
}
