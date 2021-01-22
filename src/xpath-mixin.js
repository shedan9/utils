export default {
  data() {
    return {
      _colorClassName: 'xpath-highlight-red',
      _curTarget: null,
    };
  },
  methods: {
    initIframe(iframeEl) {
      iframeEl.onload = () => {
        const style = iframeEl.contentDocument.createElement('style');
        style.setAttribute('type', 'text/css');
        style.innerHTML=`.${this._data._colorClassName}{background-color: #f9cc9d !important;}`;
        iframeEl.contentDocument.querySelector('head').appendChild(style);

        this.showDom(iframeEl.contentDocument.querySelector('body'));

        let tempTarget = null;

        iframeEl.contentDocument.onclick = event => {
          this.clearTempHighlight(iframeEl.contentDocument);

          let target = tempTarget = event.target;
          let currentPath = null;

          if (event.shiftKey) {
            if (this._data._curTarget && this._data._curTarget.tagName === 'BODY') return false;
            this._data._curTarget = this._data._curTarget ? this._data._curTarget.parentNode : target.parentNode;
            currentPath = this.index(this._data._curTarget, true);
          } else {
            currentPath = this.index(target, true);
            this._data._curTarget = target;
          }

          window.parent.postMessage({
            type: 'xpath',
            data: {
              xpath: currentPath,
              value: this.evaluateQuery(currentPath, 'click', iframeEl.contentDocument),
            }
          }, '*');

          return false;
        };
        document.onkeydown = event => {
          if (tempTarget && event.key === 'Backspace') {
            tempTarget.style.display = 'none';
          }
        };
        iframeEl.contentDocument.onmouseover = event => {
          event.target.style.backgroundColor = '#fff59d';
        };
        iframeEl.contentDocument.onmouseout = event => {
          event.target.style.backgroundColor = '';
        };
      };
    },
    showDom(el) {
      const style = getComputedStyle(el, null);
      el.removeAttribute('v-cloak');
      if (style.width === '1px' || style.width === '0px') {
        el.style.width = 'auto';
      }
      if (style.height === '1px' || style.height === '0px') {
        el.style.height = 'auto';
      }
      if (style.display === 'none' && el.innerText.replace(/[\s\n]/g, '').length >= 200) {
        el.style.display = 'block';
      }
      if (el.children.length) {
        Array.from(el.children).forEach(node => this.showDom(node));
      }
    },
    DOMNodePathStep(value, optimized) {
      class DomClass {
        constructor(value, optimized) {
          this.value = value;
          this.optimized = optimized || false;
        }
        toString() {
          return this.value;
        }
      }

      return new DomClass(value, optimized);
    },
    evaluateQuery(query, type, _document) {
      var xpathResult = null;
      var str = '';
      var nodeCount = 0;
      var toHighlight = [];

      try {
        xpathResult = _document.evaluate(query, _document, null, XPathResult.ANY_TYPE, null);
      } catch (e) {
        str = '[INVALID XPATH EXPRESSION]';
        nodeCount = 0;
        console.log(e);
      }

      if (!xpathResult) {
        return [str, nodeCount];
      }

      if (xpathResult.resultType === XPathResult.BOOLEAN_TYPE) {
        str = xpathResult.booleanValue ? '1' : '0';
        nodeCount = 1;
      } else if (xpathResult.resultType === XPathResult.NUMBER_TYPE) {
        str = xpathResult.numberValue.toString();
        nodeCount = 1;
      } else if (xpathResult.resultType === XPathResult.STRING_TYPE) {
        str = xpathResult.stringValue;
        nodeCount = 1;
      } else if (xpathResult.resultType === XPathResult.UNORDERED_NODE_ITERATOR_TYPE) {
        for (var node = xpathResult.iterateNext(); node; node = xpathResult.iterateNext()) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            toHighlight.push(node);
          }
          if (str) {
            str += '\n';
          }
          str += node.textContent;
          nodeCount++;
        }
        if (nodeCount === 0) {
          str = '[NULL]';
        }
      } else {
        str = '[INTERNAL ERROR]';
        nodeCount = 0;
      }
      for (let i = 0, l = toHighlight.length; i < l; i++) {
        let ele = toHighlight[i];
        if(type === 'flash') {
          if(i === 0) {
            scrollTo(ele, 'body');
          }
          ele.classList.add('block-flash');
          setTimeout(() => {
            ele.classList.remove('block-flash');
          }, 1000);
        } else {
          ele.classList.add(this._data._colorClassName);
        }
      }
      return str;
    },
    clearTempHighlight(_document) {
      let els = _document.querySelectorAll('.' + this._data._colorClassName);
      for (let i = 0, l = els.length; i < l; i++) {
        els[i].classList.remove(this._data._colorClassName);
      }
    },
    index(node, optimized) {
      if (node.nodeType === Node.DOCUMENT_NODE) {
        return '/';
      }
      var steps = [];
      var contextNode = node;
      while (contextNode) {
        var step = this._xPathValue(contextNode, optimized);
        if (!step) {
          break;
        }
        steps.push(step);
        if (step.optimized) {
          break;
        }
        contextNode = contextNode.parentNode;
      }
      steps.reverse();
      return (steps.length && steps[0].optimized ? '' : '/') + steps.join('/');
    },
    _xPathValue(node, optimized) {
      var ownValue;
      var ownIndex = this._xPathIndex(node);
      if (ownIndex === -1) {
        return null;
      }
      switch (node.nodeType) {
        case Node.ELEMENT_NODE:
          if (optimized && node.getAttribute('id')) {
            return this.DOMNodePathStep('//*[@id="' + node.getAttribute('id') + '"]', true);
          }
          ownValue = node.localName;
          if (node.className) {
            ownValue = ownValue+'[@class="' + node.className + '"]';
          }
          break;
        case Node.ATTRIBUTE_NODE:
          ownValue = '@' + node.nodeName();
          break;
        case Node.TEXT_NODE:
        case Node.CDATA_SECTION_NODE:
          ownValue = 'text()';
          break;
        case Node.PROCESSING_INSTRUCTION_NODE:
          ownValue = 'processing-instruction()';
          break;
        case Node.COMMENT_NODE:
          ownValue = 'comment()';
          break;
        case Node.DOCUMENT_NODE:
          ownValue = '';
          break;
        default:
          ownValue = '';
          break;
      }

      if (ownIndex > 0) {
        ownValue += '[' + ownIndex + ']';
      }
      return this.DOMNodePathStep(ownValue, node.nodeType === Node.DOCUMENT_NODE);
    },
    _xPathIndex(node) {
      function areNodesSimilar(left, right) {
        if (left === right)
          return true;

        if (left.nodeType === Node.ELEMENT_NODE && right.nodeType === Node.ELEMENT_NODE) {
          if (left.localName === right.localName) {
            if (left.className) {
              return left.className === right.className;
            } else {
              return true;
            }
          } else {
            return false;
          }
        }

        if (left.nodeType === right.nodeType)
          return true;
        var leftType = left.nodeType === Node.CDATA_SECTION_NODE ? Node.TEXT_NODE : left.nodeType;
        var rightType = right.nodeType === Node.CDATA_SECTION_NODE ? Node.TEXT_NODE : right.nodeType;
        return leftType === rightType;
      }

      var siblings = node.parentNode ? node.parentNode.children : null;
      if (!siblings) {
        return 0;
      }
      var hasSameNamedElements;
      for (let i = 0; i < siblings.length; ++i) {
        if (areNodesSimilar(node, siblings[i]) && siblings[i] !== node) {
          hasSameNamedElements = true;
          break;
        }
      }
      if (!hasSameNamedElements)
        return 0;
      var ownIndex = 1;
      for (let i = 0; i < siblings.length; ++i) {
        if (areNodesSimilar(node, siblings[i])) {
          if (siblings[i] === node) {
            return ownIndex;
          }
          ++ownIndex;
        }
      }
      return -1;
    },
  },
}
