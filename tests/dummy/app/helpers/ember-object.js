import { helper } from '@ember/component/helper';
import EmberObject from '@ember/object';

export default helper(function emberObjectHelper() {
  return EmberObject.create();
});
