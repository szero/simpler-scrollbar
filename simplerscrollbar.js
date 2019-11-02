;(function(root, factory) {
  "use strict";
  if (typeof exports === "object") {
    module.exports = factory(window, document);
  }
  else {
    root.SimplerScrollbar = factory(window, document);
  }
})(this, function(w, d) {
  'use strict';
  const styleSheet = `<style type="text/css">
.ss-wrapper {
  overflow: hidden;
  height: 100%;
  width: 100%
  position: relative;
  z-index: 1;
  float: left;
}

.ss-content {
  height: 100%;
  width: calc(100% + 0.8em);
  padding: 0 0 0 0;
  position: relative;
  overflow-x: auto;
  overflow-y: scroll;
  box-sizing: border-box;
}

.ss-scroll {
  position: relative;
  background: rgba(127, 127, 127, 0.5);
  width: 8px;
  border-radius: 4px;
  top: 0;
  z-index: 2;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.25s linear;
}

.ss-container:hover .ss-scroll,
.ss-container:active .ss-scroll {
  opacity: 1;
}

.ss-grabbed {
  -o-user-select: none;
  -ms-user-select: none;
  -moz-user-select: none;
  -webkit-user-select: none;
  user-select: none;
}
</style>`;
  const raf = w.requestAnimationFrame || w.setImmediate || function(c) {
    return setTimeout(c);
  };

  addEventListener("DOMContentLoaded", function dom() {
    removeEventListener("DOMContentLoaded", dom, true);
    const head = d.getElementsByTagName("head")[0];
    head.insertAdjacentHTML("afterbegin", styleSheet);
  }, true);

  class simplerscrollbar {
    constructor({container, wrapper, content, rightOffset = 0} = {}) {
      if (!container) {
        throw new Error("You need to specify an element I can bind to");
      }
      this.target = container;

      this.wrapper = wrapper || d.createElement('div');
      this.wrapper.setAttribute('class', 'ss-wrapper');

      this.content = content || d.createElement('div');
      this.content.setAttribute('class', 'ss-content');
      this.content.style.width = `calc(100% + ${this.scrollWidth}px)`;

      if (!wrapper && !content) {
        this.wrapper.appendChild(this.content);

        while (this.target.firstChild) {
          this.content.appendChild(this.target.firstChild);
        }
        this.target.appendChild(this.wrapper);
      }

      this.target.insertAdjacentHTML('beforeend', '<div class="ss-scroll">');
      this.bar = this.target.lastChild;
      this.eventArgs = {passive: true, capture: true};

      this.dragDealer();
      this.moveBar(rightOffset);

      w.addEventListener('resize', this.moveBar.bind(this, rightOffset), this.eventArgs);
      this.content.addEventListener('scroll', this.moveBar.bind(this, rightOffset), this.eventArgs);
      this.content.addEventListener('mouseenter', this.moveBar.bind(this, rightOffset), this.eventArgs);

      this.target.classList.add('ss-container');

      const css = w.getComputedStyle(container);
      if (css.height === '0px' && css['max-height'] !== '0px') {
        container.style.height = css['max-height'];
      }
    }
    // Credit: https://github.com/buzinas/simple-scrollbar/pull/37
    get scrollWidth() {
      const outer = d.createElement('div');
      const inner = d.createElement('div');
      outer.style.width = inner.style.width = '100%';
      outer.style.overflow = 'scroll';
      d.body.appendChild(outer).appendChild(inner);
      const scroll_width = outer.offsetWidth - inner.offsetWidth;
      outer.parentNode.removeChild(outer);
      return scroll_width;
    }

    moveBar(rightOffset) {
      const totalHeight = this.content.scrollHeight,
        ownHeight = this.content.clientHeight,
        that = this;

      const scrollRatio = ownHeight / totalHeight;
      if (scrollRatio >= 1) {
        that.bar.style.opacity = 0;
        that.bar.style.cursor = "auto";
        return;
      }
      if (scrollRatio >= 0.1) {
        this.scrollRatio = scrollRatio;
      }
      else {
        this.scrollRatio = scrollRatio * (0.9 + scrollRatio);
      }
      raf(() => {
        const ratio = that.scrollRatio * 100;
        that.bar.style.cssText = `height: ${Math.max(ratio, 10)}%;
        top: ${(that.content.scrollTop / totalHeight) * (ratio >= 10 ? 100 : 90 + ratio)}%;
        right: ${(that.target.clientWidth - that.bar.clientWidth + rightOffset) * -1}px;`;
      });
    }
    getOffsetFromEvent(e) {
      let op = e.target.parentElement;
      if (!op || !op.offsetTop) return null;
      while (op.offsetTop < 1) {
        if (op === undefined) return null;
        op = op.parentElement;
      }
      if (op.offsetTop === undefined) return null;
      return op.offsetTop;
    }
    // Mouse drag handler
    dragDealer() {
      let lastPageY;
      let mousePosOnBar;
      let offset;
      const that = this;
      that.bar.addEventListener('mousedown', e => {
        that.bar.classList.add('ss-grabbed');
        offset = that.getOffsetFromEvent(e);
        lastPageY = e.pageY;
        mousePosOnBar = e.clientY - e.target.offsetTop;
        d.body.classList.add('ss-grabbed');

        d.addEventListener('mousemove', drag, that.eventArgs);
        d.addEventListener('mouseup', stop, that.eventArgs);

        return false;
      }, that.eventArgs);

      function drag(e) {
        if (offset === null) return;
        const delta = e.pageY - lastPageY;
        if (lastPageY < e.pageY) {
          if ((mousePosOnBar + offset) <= e.clientY) {
            raf(() => {
              that.content.scrollTop += delta / that.scrollRatio;
            });
          }
        }
        else if ((offset + that.target.clientHeight -
          (that.bar.clientHeight - mousePosOnBar)) >= e.clientY) {
          raf(() => {
            that.content.scrollTop += delta / that.scrollRatio;
          });
        }
        lastPageY = e.pageY;
      }
      function stop() {
        that.bar.classList.remove('ss-grabbed');
        d.body.classList.remove('ss-grabbed');
        d.removeEventListener('mousemove', drag, that.eventArgs);
        d.removeEventListener('mouseup', stop, that.eventArgs);
      }
    }
  }
  const initContainer = function(argObj) {
    const {container} = argObj;
    if (Object.prototype.hasOwnProperty.call(container, 'data-simple-scrollbar')) return;
    Object.defineProperty(container, 'data-simple-scrollbar', {
      value: new simplerscrollbar(argObj)
    });
  };
  const SimplerScrollbar = {
    initContainer,
    initAll() {
      const all_divs = d.querySelectorAll("*[ss-container]");
      all_divs.forEach(container => {
        initContainer({container});
      });
    }
  };
  return SimplerScrollbar;
});
