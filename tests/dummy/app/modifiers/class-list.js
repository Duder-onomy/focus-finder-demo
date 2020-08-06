import { setModifierManager } from '@ember/modifier';

export default setModifierManager(
  () => ({
    createModifier() {
      return { element: null };
    },

    installModifier(state, element, args) {
      state.element = element;

      this.updateClasses(state, args);
    },

    updateModifier(state, args) {
      this.updateClasses(state, args);
    },

    updateClasses(state, args) {
      let staticClasses = args.positional[0];

      if (staticClasses) {
        state.element.classList.add(...staticClasses.split(' '));
      }

      Object.keys(args.named).forEach((key) => {
        if (args.named[key]) {
          state.element.classList.add(key);
        } else {
          state.element.classList.remove(key);
        }
      });
    },

    destroyModifier(/* state */) { },
  }),
  class ClassListManager {},
);
