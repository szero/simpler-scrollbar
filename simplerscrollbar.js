const SimplerScrollbar = function() {
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
  padding-right: 1em;
  overflow: auto;
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

.ss-hidden {
  display: none;
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
  const raf = window.requestAnimationFrame || window.setImmediate || function(c) {
    return setTimeout(c);
  };

  addEventListener("DOMContentLoaded", function dom() {
    removeEventListener("DOMContentLoaded", dom, true);
    const head = document.getElementsByTagName("head")[0];
    head.insertAdjacentHTML("afterbegin", styleSheet);
  }, true);


  class simplerscrollbar {
    constructor({container, wrapper, content, rightOffset = 0} = {}) {
      if (!container) {
        throw new Error("You need to specify an element I can bind to");
      }
      this.target = container;

      this.bar = '<div class="ss-scroll">';

      this.wrapper = wrapper || document.createElement('div');
      this.wrapper.setAttribute('class', 'ss-wrapper');

      this.content = content || document.createElement('div');
      this.content.setAttribute('class', 'ss-content');

      if (!wrapper && !content) {
        this.wrapper.appendChild(this.content);

        while (this.target.firstChild) {
          this.content.appendChild(this.target.firstChild);
        }
        this.target.appendChild(this.wrapper);
      }

      this.target.insertAdjacentHTML('beforeend', '<div class="ss-scroll">');
      this.bar = this.target.lastChild;

      this.dragDealer();
      this.moveBar(rightOffset);

      window.addEventListener('resize', this.moveBar.bind(this, rightOffset), {passive: true});
      this.content.addEventListener('scroll', this.moveBar.bind(this, rightOffset), {passive: true});
      this.content.addEventListener('mouseenter', this.moveBar.bind(this, rightOffset), {passive: true});
      this.content.addEventListener('mouseout', this.moveBar.bind(this, rightOffset), {passive: true, once: true});

      this.target.classList.add('ss-container');

      const css = window.getComputedStyle(container);
      if (css.height === '0px' && css['max-height'] !== '0px') {
        container.style.height = css['max-height'];
      }
    }
    moveBar(rightOffset) {
      const totalHeight = this.content.scrollHeight,
        ownHeight = this.content.clientHeight,
        that = this;

      this.scrollRatio = ownHeight / totalHeight;
      const right = (that.target.clientWidth - that.bar.clientWidth - rightOffset) * -1;
      raf(() => {
        // Hide scrollbar if no scrolling is possible
        if (that.scrollRatio >= 1) {
          that.bar.classList.add('ss-hidden');
        }
        else {
          that.bar.classList.remove('ss-hidden');
          that.bar.style.cssText = `height: ${Math.max(that.scrollRatio * 100, 0)}%;
            top: ${(that.content.scrollTop / totalHeight) * 100}%;
            right: ${right}px;`;
        }
      });
    }
    // Mouse drag handler
    dragDealer() {
      let lastPageY;
      const that = this;
      that.bar.addEventListener('mousedown', e => {
        that.bar.classList.add('ss-grabbed');
        lastPageY = e.pageY;
        document.body.classList.add('ss-grabbed');

        document.addEventListener('mousemove', drag, {passive: true});
        document.addEventListener('mouseup', stop, {passive: true});

        return false;
      }, {passive: true});

      function drag(e) {
        const delta = e.pageY - lastPageY;
        lastPageY = e.pageY;
        raf(() => {
          that.content.scrollTop += delta / that.scrollRatio;
        });
      }

      function stop() {
        that.bar.classList.remove('ss-grabbed');
        document.body.classList.remove('ss-grabbed');
        document.removeEventListener('mousemove', drag, {passive: true});
        document.removeEventListener('mouseup', stop, {passive: true});
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

  return {
    initContainer,
    initAll() {
      const all_divs = document.querySelectorAll("*[ss-container]");
      all_divs.forEach(container => {
        initContainer({container});
      });
    }
  };
}.call(this);
