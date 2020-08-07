focus-finder-demo
==============================================================================

This is the src for the focus-finder demo website. I will be open sourcing focus-finder soon.
This is just the demo website.

Find the demo here: https://duder-onomy.github.io/focus-finder-demo/

The intention here is to update the core lib and send a pr to https://github.com/SolidDigital/magic-focus-finder

Focus Finder
=========

Brain dump / Explanation / Making plans for refactors after demos are complete. 

How focus finder works right now. 
![works right now](https://docs.google.com/drawings/d/e/2PACX-1vSCEsmjFg1eykOqTKV23_w6be9y1dTH_WY0XxjzJPzqn8T7w0NiHqZhdE4XKwK9MUV5pDiNj8Xy99Sq/pub?w=1182&h=1498)

How it works right now: 
We calculate a position for each element when it is inserted into the dom (via Mutation Observer) and append it to a list of known focusables.
When a direction key is pressed, (lets say the person pressed the right arrow key)
We check for any element level direction overrides, they have them, we use them to push focus and bail out.
We toss out all elements whose center left is less than the currently focused elements center right.
If the distance exceeds the maxDistance, we bail out
If the element contains a special class, which bounce
For elements beyond the maxDistance, we reduce weight drastically, but still keep it in the set, this is to enable any ‘last ditch effort’ to push focus
We compute and sort the list by its weighted result. If there are per element weights defined, we use those. 
Grab the first item, push focus it to. 

function _getWeightedResult(azimuth, maxAzimuth = 1, azimuthWeight, distance, maxDistance = 1, distanceWeight) {
 return azimuthWeight * (Math.abs(azimuth) / maxAzimuth) +
   distanceWeight * (Math.abs(distance) / maxDistance);
}

Todo (how we want it to work): 
* Canonical focus should be maintained by the browser, abandon our own mgmt of currentFocus and ask the browser for it every time. Use real focus always.
* Lets change the way any maxDistance or maxAzimuth calcs work to hard filter on the max, if no elements are left after the hard filter, increase the maxDistance and try again. This will, I think, simplify the code to a more declarative `map, filter, reduce`
* Lets change how elements are registered. Somehow, can we get away with only calling `getBoundingClientRect` on a certain subset of the DOM? 
* Lets make sure we run in a raf so that the getBoundingClientRect calls are cheaper. 
* Because all the positions are precalculated, everything breaks down when elements positions are dynamic. 


Options Object

```javascript
{
  keymap : {},  //override the default browser keymap
  weightOverrideAttribute : 'weight-override', // weight-override-up, down, left, and right can be set to 'distance' or 'azimuth' and the other will be disregarded
  focusableAttribute : '', //override the default data attribute used to denote focusability
  focusedClass : '', // a focus class for non focusable elements
  defaultFocusedElement : '', // a element reference, or a selector
  container : '', //the container in which this thing lives, default to the document.,
  eventNamespace : '', //custom namespace for events, default to 'magicFocusFinder'
  overrideDirectionAttribute : 'focus-overrides',
  captureFocusAttribute : 'capture-focus',
  dynamicPositionAttribute : 'dynamic-position',
  useRealFocus : true, // Will trigger `blur` and `focus` on the actual elements, if set to false, bypass this.
  azimuthWeight : 5, // Higher value means that it will prefer elements in the direction it is going
  distanceWeight : 1, // Higher value means that it will prefer elements that are closer
  debug : false, // Setting to true will replace the elements innerHTML with the computed distance (weighted azimuth + weighted distance),
  attributeWatchInterval : 100, // If your browser does not support mutation observers. This is how often it will check the known elements for attribute changes.
  useNativeMutationObserver : true // You can force the repo to use the non native mutation observer fallback.
}
```

All elements with `config.focusableAttribute` can be given focus to. After starting and a key press, focus is given to `config.defaultFocusedElement`, or the first element found with `config.focusdClass`, or the first element found with the focusable attribute.

## Events
It will fire the following events in the following order - events bubble up and are cancelable, so you can listen on `mff.getContainer()` for all these events.

This example moves focus from Element One to Element Two

1. `losing-focus` - on Element One - `event.data` has `{ "from" : domElementOne }`
2. `focus-lost` - on Element One - `event.data` has `{ "from" : domElementOne }`
3. `gaining-focus` - on Element Two - `event.data` has `{ "to" : domElementTwo }`
4. `focus-gained` - on Element Two - `event.data` has `{ "to" : domElementTwo }`
5. `focus-moved` - on Element Two - `event.data` is the object:

    ```json
    {
        "direction" : "up|down|left|right",
        "from"      : domElementOne,
        "to"        : domElementTwo
    }
    ```

### Element level

1. `focus` normal focus event
2. `blur` normal blur event
5. `magicFocusFinder:focus:from:<% direction %>` namespaced focus event telling you which direction the focus came  from
6. `magicFocusFinder:blur:to:<% direction %>` namespaced blur event telling you which direction the element was blurred to.

### Container level
Implemented

Not Implemented:
1. `magicFocusFinder:elementAdded` event telling you a focusable element was added to the container.
2. `magicFocusFinder:elementRemoved` event telling you a focusable element was removed from the container.

## Attributes

You can specify on a per element basis whether you want `distance` or `azimuth` to be the only factor in determining the
next focused element. You have to specify up, down, left, or right following the `weightOverrideAttribute`.  Element attributes will be watched for changes and appropriately updated.

```html
<div weight-override-up='azimuth' focusable> </div>
```

You can specify on a per element basis if you want to override the default behavior of that direction fired. This will be recalculated on each movement so you can use this attribute to change the directional behavior in real time if you need. The direction overrides will take a normal single line selector. The order of the overrides occur 'up' 'right' 'down' and 'left'. You can also used the keys null and skip. Null will bypass the direction override for that direction. In the example below, when moving down it will use the default focus behavior.  If you use the work 'skip' it will skip this direction entirely, essentially canceling the movement. In the example below, when you go left, nothing will happen. Please not, the selectors for the overrides need to be a simple word as we split the directions on a space. Also note, the selectors must exist in inside your configured container.

```html
<div focus-overrides='.something-up #somethingRight null skip'></div>
```


##Methods

### configure(options)
configure the defaults, can be called at anytime to change the configuration
```javascript
magicFocusFinder.configure(options)
```

### getConfig()
returns the current configuration
```javascript
magicFocusFinder.getConfig()
```

### getContainer()
returns the overall container - events bubble up to this

### start()
starts the dang thing, if start is called before configure, then default options will be used.
```javascript
magicFocusFinder.start();
```

### lock()
Prevents all navigation from key events.
```javascript
magicFocusFinder.lock();
```

### unlock()
Allows navigation from key events.
```javascript
magicFocusFinder.unlock();
```

### refresh()
will refresh the element mapping (should only be used if your browser does not support mutation observers)
Otherwise it will watch the DOM for new elements.
```javascript
magicFocusFinder.refresh();
```

### setCurrent(element)
set the current focused element, element ref or selector
```javascript
magicFocusFinder.setCurrent();
```

### getCurrent()
get the current focused element, element ref of selector
```javascript
magicFocusFinder.getCurrent()
```

### move[direction](options)
Tell the focus to move in a direction, this will bypass a lock, if one was set via `mff.lock()`.
```javascript
mff.move.right()
mff.move.down({ events : false });
```

Can move up, down, left, or right. Can turn off all events for a move by setting the events key to `false` on the options object.


### getKnownElements()
Returns an array of all elements that can be focused by mff.
```javascript
magicFocusFinder.getKnownElements();
```

### destroy()
destroy this thing and free up all memory
```javascript
magicFocusFinder.destroy();
```
---

Rawk.
