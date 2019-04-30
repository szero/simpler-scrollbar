# SimplerScrollbar
Indirect fork of [SimpleScrollbar](https://github.com/buzinas/simple-scrollbar).

I rewrote it using ES6 features with intention to be used as an require drop-in 
in greasemonkey  scripts. It still can be used as a module. 
I changed the constructor to accept the wrapper and content divs directly as an option 
so it can be used as a plug-in scrollbar in existing sites without a need of 
creating extra nodes.

## Benefits

- Extremely lightweight (less than 1.5KB after gzip and minify)
- It uses the native and [passive](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#Improving_scrolling_performance_with_passive_listeners)
scroll events, so:
- All the events work and are smooth (mouse wheel, space, page down, page up, arrows etc).
- The performance is awesome!
- No dependencies, completely vanilla Javascript!

## Browser Support

Don't use Micro$oft browsers and you should be ok.

## Usage

The `initContainer` method takes an object as an argument. All of the object 
properties are named arguments described below:

```Javascript
const argObj = {
  container: Element // reqired
  wrapper: Element // optional
  content: Element // optional
  rightOffset: 0 // optional
  // You can offset position of the bar from the right edge of div by changing the value above.
}
```

How to plug it in your UserScript:

```Javascript
// @require https://cdn.jsdelivr.net/gh/szero/simpler-scrollbar/simplerscrollbar.min.js
```

### Manual binding
If you want to manually turn your div in a SimpleScrollbar, you can use the
`SimpleScrollbar.initContainer` method.

```HTML
<div class="myClass"></div>

<script>
  const container = document.querySelector('.myClass');
  SimplerScrollbar.initContainer({container});
</script>
```

### Dynamically added content
If the site you want to plug the scrollbar in have DOMElements generated dynamically, and you 
want to use the SimpleScrollbar `ss-container` attribute, you can use the 
`SimpleScrollbar.initAll` method, and it will turn all the elements with that attribute in
a scrollable one for you.

```Javascript
var div = document.createElement('div');
div.insertAdjacentHTML('afterbegin', '<span>One</span>');
div.setAttribute('ss-container', true);

var otherDiv = div.cloneNode(true);
otherDiv.querySelector('span').textContent = 'Two';

document.body.appendChild(div);
document.body.appendChild(otherDiv);

SimpleScrollbar.initAll();
```

