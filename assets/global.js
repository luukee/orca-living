function LiquidErrorCheck(arr, string) {
  var checkingFor = string.toLowerCase().toString(),
    hasError;
  arr.forEach(function (content, index, arr) {
    var check1 =
        content.textContent.toLowerCase().toString().indexOf(checkingFor) > 0,
      check2 =
        content.outerText.toLowerCase().toString().indexOf(checkingFor) > 0,
      check3 =
        content.outerHTML.toLowerCase().toString().indexOf(checkingFor) > 0,
      check4 =
        content.innerText.toLowerCase().toString().indexOf(checkingFor) > 0,
      check5 =
        content.innerHTML.toLowerCase().toString().indexOf(checkingFor) > 0;
    hasError = check1 || check2 || check3 || check4 || check5;
    if (hasError) {
      arr.length = index + 1;
    }
  });
  if (hasError) {
    console.log(
      '%c\n!!!!!!!!!!!!!!!!!!! \n\nLiquid error found! \n\n!!!!!!!!!!!!!!!!!!!\n ',
      'color: red; font-size: 25px'
    );
  } else {
    console.log(
      '%c No liquid errors found. ',
      'color: white; background: green; font-size: 16px'
    );
  }
}

function getFocusableElements(container) {
  return Array.from(
    container.querySelectorAll(
      "summary, a[href], button:enabled, [tabindex]:not([tabindex^='-']), [draggable], area, input:not([type=hidden]):enabled, select:enabled, textarea:enabled, object, iframe"
    )
  );
}

document.querySelectorAll('[id^="Details-"] summary').forEach((summary) => {
  summary.setAttribute('role', 'button');
  summary.setAttribute(
    'aria-expanded',
    summary.parentNode.hasAttribute('open')
  );

  if (summary.nextElementSibling.getAttribute('id')) {
    summary.setAttribute('aria-controls', summary.nextElementSibling.id);
  }

  summary.addEventListener('click', (event) => {
    event.currentTarget.setAttribute(
      'aria-expanded',
      !event.currentTarget.closest('details').hasAttribute('open')
    );
  });

  if (summary.closest('header-drawer')) return;
  summary.parentElement.addEventListener('keyup', onKeyUpEscape);
});

const trapFocusHandlers = {};

function trapFocus(container, elementToFocus = container) {
  var elements = getFocusableElements(container);
  var first = elements[0];
  var last = elements[elements.length - 1];

  removeTrapFocus();

  trapFocusHandlers.focusin = (event) => {
    if (
      event.target !== container &&
      event.target !== last &&
      event.target !== first
    )
      return;

    document.addEventListener('keydown', trapFocusHandlers.keydown);
  };

  trapFocusHandlers.focusout = function () {
    document.removeEventListener('keydown', trapFocusHandlers.keydown);
  };

  trapFocusHandlers.keydown = function (event) {
    if (event.code.toUpperCase() !== 'TAB') return; // If not TAB key
    // On the last focusable element and tab forward, focus the first element.
    if (event.target === last && !event.shiftKey) {
      event.preventDefault();
      first.focus();
    }

    //  On the first focusable element and tab backward, focus the last element.
    if (
      (event.target === container || event.target === first) &&
      event.shiftKey
    ) {
      event.preventDefault();
      last.focus();
    }
  };

  document.addEventListener('focusout', trapFocusHandlers.focusout);
  document.addEventListener('focusin', trapFocusHandlers.focusin);

  elementToFocus.focus();

  if (
    elementToFocus.tagName === 'INPUT' &&
    ['search', 'text', 'email', 'url'].includes(elementToFocus.type) &&
    elementToFocus.value
  ) {
    elementToFocus.setSelectionRange(0, elementToFocus.value.length);
  }
}

// Here run the querySelector to figure out if the browser supports :focus-visible or not and run code based on it.
try {
  document.querySelector(':focus-visible');
} catch (e) {
  focusVisiblePolyfill();
}

function focusVisiblePolyfill() {
  const navKeys = [
    'ARROWUP',
    'ARROWDOWN',
    'ARROWLEFT',
    'ARROWRIGHT',
    'TAB',
    'ENTER',
    'SPACE',
    'ESCAPE',
    'HOME',
    'END',
    'PAGEUP',
    'PAGEDOWN',
  ];
  let currentFocusedElement = null;
  let mouseClick = null;

  window.addEventListener('keydown', (event) => {
    if (navKeys.includes(event.code.toUpperCase())) {
      mouseClick = false;
    }
  });

  window.addEventListener('mousedown', (event) => {
    mouseClick = true;
  });

  window.addEventListener(
    'focus',
    () => {
      if (currentFocusedElement)
        currentFocusedElement.classList.remove('focused');

      if (mouseClick) return;

      currentFocusedElement = document.activeElement;
      currentFocusedElement.classList.add('focused');
    },
    true
  );
}

function pauseAllMedia() {
  document.querySelectorAll('.js-youtube').forEach((video) => {
    video.contentWindow.postMessage(
      '{"event":"command","func":"' + 'pauseVideo' + '","args":""}',
      '*'
    );
  });
  document.querySelectorAll('.js-vimeo').forEach((video) => {
    video.contentWindow.postMessage('{"method":"pause"}', '*');
  });
  document.querySelectorAll('video').forEach((video) => video.pause());
  document.querySelectorAll('product-model').forEach((model) => {
    if (model.modelViewerUI) model.modelViewerUI.pause();
  });
}

function removeTrapFocus(elementToFocus = null) {
  document.removeEventListener('focusin', trapFocusHandlers.focusin);
  document.removeEventListener('focusout', trapFocusHandlers.focusout);
  document.removeEventListener('keydown', trapFocusHandlers.keydown);

  if (elementToFocus) elementToFocus.focus();
}

function onKeyUpEscape(event) {
  if (event.code.toUpperCase() !== 'ESCAPE') return;

  const openDetailsElement = event.target.closest('details[open]');
  if (!openDetailsElement) return;

  const summaryElement = openDetailsElement.querySelector('summary');
  openDetailsElement.removeAttribute('open');
  summaryElement.setAttribute('aria-expanded', false);
  summaryElement.focus();
}

class StickyHeader extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.header = document.querySelector('.section-header');
    this.headerIsAlwaysSticky = this.getAttribute('data-sticky-type') === 'always' || this.getAttribute('data-sticky-type') === 'reduce-logo-size';
    this.headerBounds = {};

    this.setHeaderHeight();

    window.matchMedia('(max-width: 990px)').addEventListener('change', this.setHeaderHeight.bind(this));

    if (this.headerIsAlwaysSticky) {
      this.header.classList.add('shopify-section-header-sticky');
      document.body.classList.add('header-sticky');
    };

    this.currentScrollTop = 0;
    this.preventReveal = false;
    this.predictiveSearch = this.querySelector('predictive-search');

    this.onScrollHandler = this.onScroll.bind(this);
    this.hideHeaderOnScrollUp = () => this.preventReveal = true;

    this.addEventListener('preventHeaderReveal', this.hideHeaderOnScrollUp);
    window.addEventListener('scroll', this.onScrollHandler, false);

    this.createObserver();
  }

  setHeaderHeight() {
    document.documentElement.style.setProperty('--header-height', `${this.header.offsetHeight}px`);
  }

  disconnectedCallback() {
    this.removeEventListener('preventHeaderReveal', this.hideHeaderOnScrollUp);
    window.removeEventListener('scroll', this.onScrollHandler);
  }

  createObserver() {
    let observer = new IntersectionObserver((entries, observer) => {
      this.headerBounds = entries[0].intersectionRect;
      observer.disconnect();
    });

    observer.observe(this.header);
  }

  onScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (this.predictiveSearch && this.predictiveSearch.isOpen) return;

    if (scrollTop > this.currentScrollTop && scrollTop > this.headerBounds.bottom) {
      this.header.classList.add('scrolled-past-header');
      if (this.preventHide) return;
      requestAnimationFrame(this.hide.bind(this));
    } else if (scrollTop < this.currentScrollTop && scrollTop > this.headerBounds.bottom) {
      this.header.classList.add('scrolled-past-header');
      if (!this.preventReveal) {
        requestAnimationFrame(this.reveal.bind(this));
      } else {
        window.clearTimeout(this.isScrolling);

        this.isScrolling = setTimeout(() => {
          this.preventReveal = false;
        }, 66);

        requestAnimationFrame(this.hide.bind(this));
      }
    } else if (scrollTop <= this.headerBounds.top) {
      this.header.classList.remove('scrolled-past-header');
      requestAnimationFrame(this.reset.bind(this));
    }

    this.currentScrollTop = scrollTop;
  }

  hide() {
    if (this.headerIsAlwaysSticky) return;
    document.body.classList.remove('header-sticky');
    this.header.classList.add('shopify-section-header-hidden', 'shopify-section-header-sticky');
    this.closeMenuDisclosure();
    this.closeSearchModal();
  }

  reveal() {
    if (this.headerIsAlwaysSticky) return;
    document.body.classList.add('header-sticky');
    this.header.classList.add('shopify-section-header-sticky', 'animate');
    this.header.classList.remove('shopify-section-header-hidden');
  }

  reset() {
    if (this.headerIsAlwaysSticky) return;
    document.body.classList.remove('header-sticky');
    this.header.classList.remove('shopify-section-header-hidden', 'shopify-section-header-sticky', 'animate');
  }

  closeMenuDisclosure() {
    this.disclosures = this.disclosures || this.header.querySelectorAll('header-menu');
    this.disclosures.forEach(disclosure => disclosure.close());
  }

  closeSearchModal() {
    this.searchModal = this.searchModal || this.header.querySelector('details-modal');
    this.searchModal.close(false);
  }
}

customElements.define('sticky-header', StickyHeader);

class QuantityInput extends HTMLElement {
  constructor() {
    super();
    this.input = this.querySelector('input');
    this.changeEvent = new Event('change', { bubbles: true });
    this.atcButton = document.querySelector('.product-form__submit');

    if (this.atcButton && parseInt(this.input.value) < 1) {
      this.atcButton.setAttribute('disabled','true')
    }

    this.input.addEventListener('change', this.onInputChange.bind(this));
    this.querySelectorAll('button').forEach((button) =>
      button.addEventListener('click', this.onButtonClick.bind(this))
    );
    this.isRunning = false;
  }

  quantityUpdateUnsubscriber = undefined;

  connectedCallback() {
    this.validateQtyRules();
    this.quantityUpdateUnsubscriber = subscribe(
      PUB_SUB_EVENTS.quantityUpdate,
      this.validateQtyRules.bind(this)
    );
  }

  disconnectedCallback() {
    if (this.quantityUpdateUnsubscriber) {
      this.quantityUpdateUnsubscriber();
    }
  }

  onInputChange(event) {
    this.validateQtyRules();
    this.updateAtcPrice();
    this.toggleMessage();
  }

  toggleMessage() {
    const value = parseInt(this.input.value)
    const min = parseInt(this.input.dataset.min)
    const max = parseInt(this.input.dataset.max)
    const isPaver = this.input.hasAttribute('data-paver')

    if(!isPaver) return
    if (value > max || value < min){
      document.querySelector('[data-paver-qty-message]')?.classList.remove('hidden')
    } else {
      document.querySelector('[data-paver-qty-message]')?.classList.add('hidden')
    }
  }

  updateAtcPrice() {
    const value = parseInt(this.input.value);

    if(this.atcButton){
      const atcButtonPrice = this.atcButton.querySelector('.price-item--regular');
      var price = atcButtonPrice.getAttribute('data-price');
      price = parseFloat(price) * value;
      price = (price / 100).toFixed(2);
      atcButtonPrice.textContent = `$${price}`;
    }

    //   console.log(value);
  }

  onButtonClick(event) {
    event.preventDefault();
    const previousValue = this.input.value;
    event.target.name === 'plus' ? this.input.stepUp() : this.input.stepDown();
    if (previousValue !== this.input.value) this.input.dispatchEvent(this.changeEvent);

  }

  validateQtyRules() {
    const value = parseInt(this.input.value) || 0;
    const min = parseInt(this.input.min) ?? 1;
    const max = Number.isNaN(parseInt(this.input.max))? Number.MAX_VALUE : parseInt(this.input.max);
      
    if (this.input.min) {
      const buttonMinus = this.querySelector(".quantity__button[name='minus']");
      buttonMinus.classList.toggle('disabled', value <= min);
    }
    if (this.input.max) {
      const buttonPlus = this.querySelector(".quantity__button[name='plus']");
      buttonPlus.classList.toggle('disabled', value >= max);
    }

    if (value >= min && value <= max) {
      this.atcButton?.removeAttribute('disabled')
    }else {
      this.atcButton?.setAttribute('disabled','true')
    }
  }
}

customElements.define('quantity-input', QuantityInput);

function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

function fetchConfig(type = 'json') {
  return {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: `application/${type}`,
    },
  };
}

/*
 * Shopify Common JS
 *
 */
if (typeof window.Shopify == 'undefined') {
  window.Shopify = {};
}

Shopify.bind = function (fn, scope) {
  return function () {
    return fn.apply(scope, arguments);
  };
};

Shopify.setSelectorByValue = function (selector, value) {
  for (var i = 0, count = selector.options.length; i < count; i++) {
    var option = selector.options[i];
    if (value == option.value || value == option.innerHTML) {
      selector.selectedIndex = i;
      return i;
    }
  }
};

Shopify.addListener = function (target, eventName, callback) {
  target.addEventListener
    ? target.addEventListener(eventName, callback, false)
    : target.attachEvent('on' + eventName, callback);
};

Shopify.postLink = function (path, options) {
  options = options || {};
  var method = options['method'] || 'post';
  var params = options['parameters'] || {};

  var form = document.createElement('form');
  form.setAttribute('method', method);
  form.setAttribute('action', path);

  for (var key in params) {
    var hiddenField = document.createElement('input');
    hiddenField.setAttribute('type', 'hidden');
    hiddenField.setAttribute('name', key);
    hiddenField.setAttribute('value', params[key]);
    form.appendChild(hiddenField);
  }
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
};

Shopify.CountryProvinceSelector = function (
  country_domid,
  province_domid,
  options
) {
  this.countryEl = document.getElementById(country_domid);
  this.provinceEl = document.getElementById(province_domid);
  this.provinceContainer = document.getElementById(
    options['hideElement'] || province_domid
  );

  Shopify.addListener(
    this.countryEl,
    'change',
    Shopify.bind(this.countryHandler, this)
  );

  this.initCountry();
  this.initProvince();
};

Shopify.CountryProvinceSelector.prototype = {
  initCountry: function () {
    var value = this.countryEl.getAttribute('data-default');
    Shopify.setSelectorByValue(this.countryEl, value);
    this.countryHandler();
  },

  initProvince: function () {
    var value = this.provinceEl.getAttribute('data-default');
    if (value && this.provinceEl.options.length > 0) {
      Shopify.setSelectorByValue(this.provinceEl, value);
    }
  },

  countryHandler: function (e) {
    var opt = this.countryEl.options[this.countryEl.selectedIndex];
    var raw = opt.getAttribute('data-provinces');
    var provinces = JSON.parse(raw);

    this.clearOptions(this.provinceEl);
    if (provinces && provinces.length == 0) {
      this.provinceContainer.style.display = 'none';
    } else {
      for (var i = 0; i < provinces.length; i++) {
        var opt = document.createElement('option');
        opt.value = provinces[i][0];
        opt.innerHTML = provinces[i][1];
        this.provinceEl.appendChild(opt);
      }

      this.provinceContainer.style.display = '';
    }
  },

  clearOptions: function (selector) {
    while (selector.firstChild) {
      selector.removeChild(selector.firstChild);
    }
  },

  setOptions: function (selector, values) {
    for (var i = 0, count = values.length; i < values.length; i++) {
      var opt = document.createElement('option');
      opt.value = values[i];
      opt.innerHTML = values[i];
      selector.appendChild(opt);
    }
  },
};

class MenuDrawer extends HTMLElement {
  constructor() {
    super();

    this.mainDetailsToggle = this.querySelector('details');

    this.addEventListener('keyup', this.onKeyUp.bind(this));
    this.addEventListener('focusout', this.onFocusOut.bind(this));
    this.bindEvents();
  }

  bindEvents() {
    this.querySelectorAll('summary').forEach((summary) =>
      summary.addEventListener('click', this.onSummaryClick.bind(this))
    );
    this.querySelectorAll('button:not(.localization-selector)').forEach(
      (button) =>
        button.addEventListener('click', this.onCloseButtonClick.bind(this))
    );
  }

  onKeyUp(event) {
    if (event.code.toUpperCase() !== 'ESCAPE') return;

    const openDetailsElement = event.target.closest('details[open]');
    if (!openDetailsElement) return;

    openDetailsElement === this.mainDetailsToggle
      ? this.closeMenuDrawer(
          event,
          this.mainDetailsToggle.querySelector('summary')
        )
      : this.closeSubmenu(openDetailsElement);
  }

  onSummaryClick(event) {
    const summaryElement = event.currentTarget;
    const detailsElement = summaryElement.parentNode;
    const parentMenuElement = detailsElement.closest('.has-submenu');
    const isOpen = detailsElement.hasAttribute('open');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    function addTrapFocus() {
      trapFocus(
        summaryElement.nextElementSibling,
        detailsElement.querySelector('button')
      );
      summaryElement.nextElementSibling.removeEventListener(
        'transitionend',
        addTrapFocus
      );
    }

    if (detailsElement === this.mainDetailsToggle) {
      if (isOpen) event.preventDefault();
      isOpen
        ? this.closeMenuDrawer(event, summaryElement)
        : this.openMenuDrawer(summaryElement);

      if (window.matchMedia('(max-width: 990px)')) {
        document.documentElement.style.setProperty(
          '--viewport-height',
          `${window.innerHeight}px`
        );
      }
    } else {
      setTimeout(() => {
        detailsElement.classList.add('menu-opening');
        summaryElement.setAttribute('aria-expanded', true);
        parentMenuElement && parentMenuElement.classList.add('submenu-open');
        !reducedMotion || reducedMotion.matches
          ? addTrapFocus()
          : summaryElement.nextElementSibling.addEventListener(
              'transitionend',
              addTrapFocus
            );
      }, 100);
    }
  }

  openMenuDrawer(summaryElement) {
    setTimeout(() => {
      this.mainDetailsToggle.classList.add('menu-opening');
    });
    summaryElement.setAttribute('aria-expanded', true);
    trapFocus(this.mainDetailsToggle, summaryElement);
    document.body.classList.add(`overflow-hidden-${this.dataset.breakpoint}`);
  }

  closeMenuDrawer(event, elementToFocus = false) {
    if (event === undefined) return;

    this.mainDetailsToggle.classList.remove('menu-opening');
    this.mainDetailsToggle.querySelectorAll('details').forEach((details) => {
      details.removeAttribute('open');
      details.classList.remove('menu-opening');
    });
    this.mainDetailsToggle
      .querySelectorAll('.submenu-open')
      .forEach((submenu) => {
        submenu.classList.remove('submenu-open');
      });
    document.body.classList.remove(
      `overflow-hidden-${this.dataset.breakpoint}`
    );
    removeTrapFocus(elementToFocus);
    this.closeAnimation(this.mainDetailsToggle);
  }

  onFocusOut() {
    setTimeout(() => {
      if (
        this.mainDetailsToggle.hasAttribute('open') &&
        !this.mainDetailsToggle.contains(document.activeElement)
      )
        this.closeMenuDrawer();
    });
  }

  onCloseButtonClick(event) {
    const detailsElement = event.currentTarget.closest('details');
    this.closeSubmenu(detailsElement);
  }

  closeSubmenu(detailsElement) {
    const parentMenuElement = detailsElement.closest('.submenu-open');
    parentMenuElement && parentMenuElement.classList.remove('submenu-open');
    detailsElement.classList.remove('menu-opening');
    detailsElement
      .querySelector('summary')
      .setAttribute('aria-expanded', false);
    removeTrapFocus(detailsElement.querySelector('summary'));
    this.closeAnimation(detailsElement);
  }

  closeAnimation(detailsElement) {
    let animationStart;

    const handleAnimation = (time) => {
      if (animationStart === undefined) {
        animationStart = time;
      }

      const elapsedTime = time - animationStart;

      if (elapsedTime < 400) {
        window.requestAnimationFrame(handleAnimation);
      } else {
        detailsElement.removeAttribute('open');
        if (detailsElement.closest('details[open]')) {
          trapFocus(
            detailsElement.closest('details[open]'),
            detailsElement.querySelector('summary')
          );
        }
      }
    };

    window.requestAnimationFrame(handleAnimation);
  }
}

customElements.define('menu-drawer', MenuDrawer);

class HeaderDrawer extends MenuDrawer {
  constructor() {
    super();
  }

  openMenuDrawer(summaryElement) {
    this.header = this.header || document.querySelector('.section-header');
    this.borderOffset =
      this.borderOffset ||
      this.closest('.header-wrapper').classList.contains(
        'header-wrapper--border-bottom'
      )
        ? 1
        : 0;
    document.documentElement.style.setProperty(
      '--header-bottom-position',
      `${parseInt(
        this.header.getBoundingClientRect().bottom - this.borderOffset
      )}px`
    );
    this.header.classList.add('menu-open');

    setTimeout(() => {
      this.mainDetailsToggle.classList.add('menu-opening');
    });

    summaryElement.setAttribute('aria-expanded', true);
    window.addEventListener('resize', this.onResize);
    trapFocus(this.mainDetailsToggle, summaryElement);
    document.body.classList.add(`overflow-hidden-${this.dataset.breakpoint}`);
  }

  closeMenuDrawer(event, elementToFocus) {
    if (!elementToFocus) return;
    super.closeMenuDrawer(event, elementToFocus);
    this.header.classList.remove('menu-open');
    window.removeEventListener('resize', this.onResize);
  }

  onResize = () => {
    this.header &&
      document.documentElement.style.setProperty(
        '--header-bottom-position',
        `${parseInt(
          this.header.getBoundingClientRect().bottom - this.borderOffset
        )}px`
      );
    document.documentElement.style.setProperty(
      '--viewport-height',
      `${window.innerHeight}px`
    );
  };
}

customElements.define('header-drawer', HeaderDrawer);

class ModalDialog extends HTMLElement {
  constructor() {
    super();
    this.querySelector('[id^="ModalClose-"]').addEventListener(
      'click',
      this.hide.bind(this, false)
    );
    this.addEventListener('keyup', (event) => {
      if (event.code.toUpperCase() === 'ESCAPE') this.hide();
    });
    if (this.classList.contains('media-modal')) {
      this.addEventListener('pointerup', (event) => {
        if (
          event.pointerType === 'mouse' &&
          !event.target.closest('deferred-media, product-model')
        )
          this.hide();
      });
    } else {
      this.addEventListener('click', (event) => {
        if (event.target === this) this.hide();
      });
    }
  }

  connectedCallback() {
    if (this.moved) return;
    this.moved = true;
    document.body.appendChild(this);
  }

  show(opener) {
    this.openedBy = opener;
    const popup = this.querySelector('.template-popup');
    document.body.classList.add('overflow-hidden');
    this.setAttribute('open', '');
    if (popup) popup.loadContent();
    trapFocus(this, this.querySelector('[role="dialog"]'));
    window.pauseAllMedia();
  }

  hide() {
    document.body.classList.remove('overflow-hidden');
    document.body.dispatchEvent(new CustomEvent('modalClosed'));
    this.removeAttribute('open');
    removeTrapFocus(this.openedBy);
    window.pauseAllMedia();
  }
}
customElements.define('modal-dialog', ModalDialog);

class ModalOpener extends HTMLElement {
  constructor() {
    super();

    const button = this.querySelector('button');

    if (!button) return;
    button.addEventListener('click', () => {
      const modal = document.querySelector(this.getAttribute('data-modal'));
      if (modal) modal.show(button);
    });
  }
}
customElements.define('modal-opener', ModalOpener);

class DeferredMedia extends HTMLElement {
  constructor() {
    super();
    const poster = this.querySelector('[id^="Deferred-Poster-"]');
    if (!poster) return;
    poster.addEventListener('click', this.loadContent.bind(this));
  }

  loadContent(focus = true) {
    window.pauseAllMedia();
    if (!this.getAttribute('loaded')) {
      const content = document.createElement('div');
      content.appendChild(
        this.querySelector('template').content.firstElementChild.cloneNode(true)
      );

      this.setAttribute('loaded', true);
      const deferredElement = this.appendChild(
        content.querySelector('video, model-viewer, iframe')
      );
      if (focus) deferredElement.focus();
      if (
        deferredElement.nodeName == 'VIDEO' &&
        deferredElement.getAttribute('autoplay')
      ) {
        // force autoplay for safari
        deferredElement.play();
      }
    }
  }
}

customElements.define('deferred-media', DeferredMedia);

class SliderComponent extends HTMLElement {
  constructor() {
    super();
    this.slider = this.querySelector('[id^="Slider-"]');
    this.sliderItems = this.querySelectorAll('[id^="Slide-"]');
    this.enableSliderLooping = false;
    this.currentPageElement = this.querySelector('.slider-counter--current');
    this.pageTotalElement = this.querySelector('.slider-counter--total');
    this.prevButton = this.querySelector('button[name="previous"]');
    this.nextButton = this.querySelector('button[name="next"]');

    if (!this.slider || !this.nextButton) return;

    this.initPages();
    const resizeObserver = new ResizeObserver((entries) => this.initPages());
    resizeObserver.observe(this.slider);

    this.slider.addEventListener('scroll', this.update.bind(this));
    this.prevButton.addEventListener('click', this.onButtonClick.bind(this));
    this.nextButton.addEventListener('click', this.onButtonClick.bind(this));
  }

  initPages() {
    this.sliderItemsToShow = Array.from(this.sliderItems).filter(
      (element) => element.clientWidth > 0
    );
    if (this.sliderItemsToShow.length < 2) return;
    this.sliderItemOffset =
      this.sliderItemsToShow[1].offsetLeft -
      this.sliderItemsToShow[0].offsetLeft;
    this.slidesPerPage = Math.floor(
      (this.slider.clientWidth - this.sliderItemsToShow[0].offsetLeft) /
        this.sliderItemOffset
    );
    this.totalPages = this.sliderItemsToShow.length - this.slidesPerPage + 1;
    this.update();
  }

  resetPages() {
    this.sliderItems = this.querySelectorAll('[id^="Slide-"]');
    this.initPages();
  }

  update() {
    // Temporarily prevents unneeded updates resulting from variant changes
    // This should be refactored as part of https://github.com/Shopify/dawn/issues/2057
    if (!this.slider || !this.nextButton) return;

    const previousPage = this.currentPage;
    this.currentPage =
      Math.round(this.slider.scrollLeft / this.sliderItemOffset) + 1;

    if (this.currentPageElement && this.pageTotalElement) {
      this.currentPageElement.textContent = this.currentPage;
      this.pageTotalElement.textContent = this.totalPages;
    }

    if (this.currentPage != previousPage) {
      this.dispatchEvent(
        new CustomEvent('slideChanged', {
          detail: {
            currentPage: this.currentPage,
            currentElement: this.sliderItemsToShow[this.currentPage - 1],
          },
        })
      );
    }

    if (this.enableSliderLooping) return;

    if (
      this.isSlideVisible(this.sliderItemsToShow[0]) &&
      this.slider.scrollLeft === 0
    ) {
      this.prevButton.setAttribute('disabled', 'disabled');
    } else {
      this.prevButton.removeAttribute('disabled');
    }

    if (
      this.isSlideVisible(
        this.sliderItemsToShow[this.sliderItemsToShow.length - 1]
      )
    ) {
      this.nextButton.setAttribute('disabled', 'disabled');
    } else {
      this.nextButton.removeAttribute('disabled');
    }
  }

  isSlideVisible(element, offset = 0) {
    const lastVisibleSlide =
      this.slider.clientWidth + this.slider.scrollLeft - offset;
    return (
      element.offsetLeft + element.clientWidth <= lastVisibleSlide &&
      element.offsetLeft >= this.slider.scrollLeft
    );
  }

  onButtonClick(event) {
    event.preventDefault();
    const step = event.currentTarget.dataset.step || 1;
    this.slideScrollPosition =
      event.currentTarget.name === 'next'
        ? this.slider.scrollLeft + step * this.sliderItemOffset
        : this.slider.scrollLeft - step * this.sliderItemOffset;
    this.slider.scrollTo({
      left: this.slideScrollPosition,
    });
  }
}

customElements.define('slider-component', SliderComponent);

class SlideshowComponent extends SliderComponent {
  constructor() {
    super();
    this.sliderControlWrapper = this.querySelector('.slider-buttons');
    this.enableSliderLooping = true;

    if (!this.sliderControlWrapper) return;

    this.sliderFirstItemNode = this.slider.querySelector('.slideshow__slide');
    if (this.sliderItemsToShow.length > 0) this.currentPage = 1;

    this.sliderControlLinksArray = Array.from(
      this.sliderControlWrapper.querySelectorAll('.slider-counter__link')
    );
    this.sliderControlLinksArray.forEach((link) =>
      link.addEventListener('click', this.linkToSlide.bind(this))
    );
    this.slider.addEventListener('scroll', this.setSlideVisibility.bind(this));
    this.setSlideVisibility();

    if (this.slider.getAttribute('data-autoplay') === 'true')
      this.setAutoPlay();
  }

  setAutoPlay() {
    this.sliderAutoplayButton = this.querySelector('.slideshow__autoplay');
    this.autoplaySpeed = this.slider.dataset.speed * 1000;

    this.sliderAutoplayButton.addEventListener(
      'click',
      this.autoPlayToggle.bind(this)
    );
    this.addEventListener('mouseover', this.focusInHandling.bind(this));
    this.addEventListener('mouseleave', this.focusOutHandling.bind(this));
    this.addEventListener('focusin', this.focusInHandling.bind(this));
    this.addEventListener('focusout', this.focusOutHandling.bind(this));

    this.play();
    this.autoplayButtonIsSetToPlay = true;
  }

  onButtonClick(event) {
    super.onButtonClick(event);
    const isFirstSlide = this.currentPage === 1;
    const isLastSlide = this.currentPage === this.sliderItemsToShow.length;

    if (!isFirstSlide && !isLastSlide) return;

    if (isFirstSlide && event.currentTarget.name === 'previous') {
      this.slideScrollPosition =
        this.slider.scrollLeft +
        this.sliderFirstItemNode.clientWidth * this.sliderItemsToShow.length;
    } else if (isLastSlide && event.currentTarget.name === 'next') {
      this.slideScrollPosition = 0;
    }
    this.slider.scrollTo({
      left: this.slideScrollPosition,
    });
  }

  update() {
    super.update();
    this.sliderControlButtons = this.querySelectorAll('.slider-counter__link');
    this.prevButton.removeAttribute('disabled');

    if (!this.sliderControlButtons.length) return;

    this.sliderControlButtons.forEach((link) => {
      link.classList.remove('slider-counter__link--active');
      link.removeAttribute('aria-current');
    });
    this.sliderControlButtons[this.currentPage - 1].classList.add(
      'slider-counter__link--active'
    );
    this.sliderControlButtons[this.currentPage - 1].setAttribute(
      'aria-current',
      true
    );
  }

  autoPlayToggle() {
    this.togglePlayButtonState(this.autoplayButtonIsSetToPlay);
    this.autoplayButtonIsSetToPlay ? this.pause() : this.play();
    this.autoplayButtonIsSetToPlay = !this.autoplayButtonIsSetToPlay;
  }

  focusOutHandling(event) {
    const focusedOnAutoplayButton =
      event.target === this.sliderAutoplayButton ||
      this.sliderAutoplayButton.contains(event.target);
    if (!this.autoplayButtonIsSetToPlay || focusedOnAutoplayButton) return;
    this.play();
  }

  focusInHandling(event) {
    const focusedOnAutoplayButton =
      event.target === this.sliderAutoplayButton ||
      this.sliderAutoplayButton.contains(event.target);
    if (focusedOnAutoplayButton && this.autoplayButtonIsSetToPlay) {
      this.play();
    } else if (this.autoplayButtonIsSetToPlay) {
      this.pause();
    }
  }

  play() {
    this.slider.setAttribute('aria-live', 'off');
    clearInterval(this.autoplay);
    this.autoplay = setInterval(
      this.autoRotateSlides.bind(this),
      this.autoplaySpeed
    );
  }

  pause() {
    this.slider.setAttribute('aria-live', 'polite');
    clearInterval(this.autoplay);
  }

  togglePlayButtonState(pauseAutoplay) {
    if (pauseAutoplay) {
      this.sliderAutoplayButton.classList.add('slideshow__autoplay--paused');
      this.sliderAutoplayButton.setAttribute(
        'aria-label',
        window.accessibilityStrings.playSlideshow
      );
    } else {
      this.sliderAutoplayButton.classList.remove('slideshow__autoplay--paused');
      this.sliderAutoplayButton.setAttribute(
        'aria-label',
        window.accessibilityStrings.pauseSlideshow
      );
    }
  }

  autoRotateSlides() {
    const slideScrollPosition =
      this.currentPage === this.sliderItems.length
        ? 0
        : this.slider.scrollLeft +
          this.slider.querySelector('.slideshow__slide').clientWidth;
    this.slider.scrollTo({
      left: slideScrollPosition,
    });
  }

  setSlideVisibility() {
    this.sliderItemsToShow.forEach((item, index) => {
      const linkElements = item.querySelectorAll('a');
      if (index === this.currentPage - 1) {
        if (linkElements.length)
          linkElements.forEach((button) => {
            button.removeAttribute('tabindex');
          });
        item.setAttribute('aria-hidden', 'false');
        item.removeAttribute('tabindex');
      } else {
        if (linkElements.length)
          linkElements.forEach((button) => {
            button.setAttribute('tabindex', '-1');
          });
        item.setAttribute('aria-hidden', 'true');
        item.setAttribute('tabindex', '-1');
      }
    });
  }

  linkToSlide(event) {
    event.preventDefault();
    const slideScrollPosition =
      this.slider.scrollLeft +
      this.sliderFirstItemNode.clientWidth *
        (this.sliderControlLinksArray.indexOf(event.currentTarget) +
          1 -
          this.currentPage);
    this.slider.scrollTo({
      left: slideScrollPosition,
    });
  }
}

customElements.define('slideshow-component', SlideshowComponent);

class VariantSelects extends HTMLElement {
  constructor() {
    super();
    this.addEventListener('change', this.onVariantChange);
  }

  onVariantChange() {
    this.updateOptions();
    this.updateMasterId();
    this.toggleAddButton(true, '', false);
    this.updatePickupAvailability();
    this.removeErrorMessage();
    this.updateVariantStatuses();
    this.updateQtyUnit();

    if (!this.currentVariant) {
      this.toggleAddButton(true, '', true);
      this.setUnavailable();
      this.updateFormVisibility();
    } else {
      this.updateMedia();
      this.updateURL();
      this.updateVariantInput();
      this.renderProductInfo();
      this.updateShareUrl();
      this.updateCarousel();
    }
  }

  updateFeaturedMedia() {
    const productImage= document.querySelector('#selected_image');
    if (productImage) {
      const previewImageSrc = this.currentVariant.featured_image?.src;
      if(previewImageSrc){
        productImage.removeAttribute('srcset')
        productImage.src = previewImageSrc
      }
    }
  }
  
  updateFormVisibility() {
    if (
      !this.currentVariant ||
      (this.currentVariant && this.currentVariant.available)
    ) {
      document.querySelector('.out-of-stock').style.display = 'none';
      return;
    }

    let check_against_inventory = true;
    if (
      this.currentVariant.inventory_management != 'shopify' ||
      this.currentVariant.inventory_policy == 'continue'
    )
      check_against_inventory = false;
    let quantity_rule_soldout = false;

    if (
      this.currentVariant.quantity_rule?.min >
        this.currentVariant.inventory_quantity &&
      check_against_inventory
    )
      quantity_rule_soldout = true;

    if (this.currentVariant.available == false || quantity_rule_soldout) {
      document.querySelector('.out-of-stock').style.display = 'block';
      document
        .querySelector('#k_id_variant_id')
        .setAttribute('value', `${this.currentVariant.name}`);
    } else {
      document.querySelector('.out-of-stock').style.display = 'none';
      return;
    }
  }

  updateCarousel() {
    let product_option = ''
    const options = this.currentVariant.options
    for (let i = 0; i < options.length; i++) {
      product_option = product_option.concat(options[i].toLowerCase())
      if (i != options.length - 1) {
        product_option = product_option.concat('_')
      }
    }
    document.querySelector('.splide').setAttribute('data-current',product_option);
    updateCarouselSlides();
  }
  updateOptions() {
    this.options = Array.from(
      this.querySelectorAll('select'),
      (select) => select.value
    );
  }

  updateMasterId() {
    this.currentVariant = this.getVariantData().find((variant) => {
      return !variant.options
        .map((option, index) => {
          return this.options[index] === option;
        })
        .includes(false);
    });
  }
  
  updateMedia() {
    if (!this.currentVariant) return;
    if (!this.currentVariant.featured_media) return;

    const mediaGalleries = document.querySelectorAll(
      `[id^="MediaGallery-${this.dataset.section}"]`
    );
    mediaGalleries.forEach((mediaGallery) =>
      mediaGallery.setActiveMedia(
        `${this.dataset.section}-${this.currentVariant.featured_media.id}`,
        true
      )
    );

    const modalContent = document.querySelector(
      `#ProductModal-${this.dataset.section} .product-media-modal__content`
    );
    if (!modalContent) return;
    const newMediaModal = modalContent.querySelector(
      `[data-media-id="${this.currentVariant.featured_media.id}"]`
    );
    modalContent.prepend(newMediaModal);
  }

  updateURL() {
    if (!this.currentVariant || this.dataset.updateUrl === 'false') return;
    window.history.replaceState(
      {},
      '',
      `${this.dataset.url}?variant=${this.currentVariant.id}`
    );
  }

  updateShareUrl() {
    const shareButton = document.getElementById(
      `Share-${this.dataset.section}`
    );
    if (!shareButton || !shareButton.updateUrl) return;
    shareButton.updateUrl(
      `${window.shopUrl}${this.dataset.url}?variant=${this.currentVariant.id}`
    );
  }

  updateVariantInput() {
    const productForms = document.querySelectorAll(
      `#product-form-${this.dataset.section}, #product-form-installment-${this.dataset.section}`
    );
    productForms.forEach((productForm) => {
      const input = productForm.querySelector('input[name="id"]');
      input.value = this.currentVariant.id;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }

  updateVariantStatuses() {
    const selectedOptionOneVariants = this.variantData.filter(
      (variant) => this.querySelector(':checked').value === variant.option1
    );
    const inputWrappers = [...this.querySelectorAll('.product-form__input')];
    inputWrappers.forEach((option, index) => {
      if (index === 0) return;
      const optionInputs = [
        ...option.querySelectorAll('input[type="radio"], option'),
      ];
      const previousOptionSelected =
        inputWrappers[index - 1].querySelector(':checked').value;
      const availableOptionInputsValue = selectedOptionOneVariants
        .filter(
          (variant) =>
            variant.available &&
            variant[`option${index}`] === previousOptionSelected
        )
        .map((variantOption) => variantOption[`option${index + 1}`]);
      this.setInputAvailability(optionInputs, availableOptionInputsValue);
    });
  }

  setInputAvailability(listOfOptions, listOfAvailableOptions) {
    listOfOptions.forEach((input) => {
      if (listOfAvailableOptions.includes(input.getAttribute('value'))) {
        input.innerText = input.getAttribute('value');
      } else {
        input.innerText = window.variantStrings.unavailable_with_option.replace(
          '[value]',
          input.getAttribute('value')
        );
      }
    });
  }

  updatePickupAvailability() {
    const pickUpAvailability = document.querySelector('pickup-availability');
    if (!pickUpAvailability) return;

    if (this.currentVariant && this.currentVariant.available) {
      pickUpAvailability.fetchAvailability(this.currentVariant.id);
    } else {
      pickUpAvailability.removeAttribute('available');
      pickUpAvailability.innerHTML = '';
    }
  }

  removeErrorMessage() {
    const section = this.closest('section');
    if (!section) return;

    const productForm = section.querySelector('product-form');
    if (productForm) productForm.handleErrorMessage();
  }

  updateQtyUnit() {
    const section = this.closest('section');
    if (!section || !this.currentVariant) return;
    // const productInfo = section.querySelector('product-info');

    // const varTitle = this.currentVariant.name;
    // var qtyLabel = 'sqft';
    // // console.log(varTitle);
    // if (varTitle.includes('Paver')) {
    //   if (varTitle.includes('Sample')) {
    //     qtyLabel = 'piece';
    //   }
    //   if (varTitle.includes('Thin')) {
    //     document.querySelector('.thin-note').style.display = 'inline-block';
    //   } else {
    //     document.querySelector('.thin-note').style.display = 'none';
    //   }
    //   var qtyLabels = productInfo.querySelectorAll('.qtyLabel');
    //   qtyLabels.forEach(function (label, index) {
    //     var checkQuantityInput = label.closest('quantity-input');
    //     if (checkQuantityInput) {
    //       label.style.display = 'none';
    //       label.textContent = qtyLabel.replace('/', '');
    //       if (qtyLabel == 'sqft') {
    //         // console.log(qtyLabel);
    //         label.style.display = 'inline-block';
    //       }
    //     } else {
    //       label.textContent = '/' + qtyLabel;
    //       label.style.display = 'inline-block';
    //     }
    //   });
    // }

    section.querySelector('.quantity__input').value = 1
  }

  renderProductInfo() {
    const requestedVariantId = this.currentVariant.id;
    const sectionId = this.dataset.originalSection
      ? this.dataset.originalSection
      : this.dataset.section;

    fetch(
      `${this.dataset.url}?variant=${requestedVariantId}&section_id=${
        this.dataset.originalSection
          ? this.dataset.originalSection
          : this.dataset.section
      }`
    )
      .then((response) => response.text())
      .then((responseText) => {
        // prevent unnecessary ui changes from abandoned selections
        if (this.currentVariant.id !== requestedVariantId) return;

        const html = new DOMParser().parseFromString(responseText, 'text/html');
        const destination = document.getElementById(
          `price-${this.dataset.section}`
        );
        const source = html.getElementById(
          `price-${
            this.dataset.originalSection
              ? this.dataset.originalSection
              : this.dataset.section
          }`
        );
        const skuSource = html.getElementById(
          `Sku-${
            this.dataset.originalSection
              ? this.dataset.originalSection
              : this.dataset.section
          }`
        );
        const skuDestination = document.getElementById(
          `Sku-${this.dataset.section}`
        );
        const inventorySource = html.getElementById(
          `Inventory-${
            this.dataset.originalSection
              ? this.dataset.originalSection
              : this.dataset.section
          }`
        );
        const inventoryDestination = document.getElementById(
          `Inventory-${this.dataset.section}`
        );

        if (source && destination) destination.innerHTML = source.innerHTML;
        if (inventorySource && inventoryDestination)
          inventoryDestination.innerHTML = inventorySource.innerHTML;
        if (skuSource && skuDestination) {
          skuDestination.innerHTML = skuSource.innerHTML;
          skuDestination.classList.toggle(
            'visibility-hidden',
            skuSource.classList.contains('visibility-hidden')
          );
        }

        const price = document.getElementById(`price-${this.dataset.section}`);

        if (price) price.classList.remove('visibility-hidden');

        if (inventoryDestination)
          inventoryDestination.classList.toggle(
            'visibility-hidden',
            inventorySource.innerText === ''
          );

        const addButtonUpdated = html.getElementById(
          `ProductSubmitButton-${sectionId}`
        );
        this.toggleAddButton(
          addButtonUpdated ? addButtonUpdated.hasAttribute('disabled') : true,
          window.variantStrings.soldOut
        );

        const sampleButtonUpdated = html.getElementById(
          `SampleOrderButton-${sectionId}`
        );

        const sampleButton = document.getElementById(`SampleOrderButton-${sectionId}`)
        if (sampleButton) {
          if (!sampleButtonUpdated) {
            sampleButton.style.display = 'none'
          }
          else {
            sampleButton.setAttribute('data-value',sampleButtonUpdated.getAttribute('data-value'))
            sampleButton.innerHTML = sampleButtonUpdated.innerHTML
            sampleButton.disabled = sampleButtonUpdated.hasAttribute('disabled')
          }
        }
        
        this.updateFormVisibility();
        this.updateVariantMetafields(html);
        publish(PUB_SUB_EVENTS.variantChange, {
          data: {
            sectionId,
            html,
            variant: this.currentVariant,
          },
        });
      });
  }

  updateVariantMetafields(html) {
    const destination = document.getElementById(
      `Quantity-${this.dataset.section}`
    );
    const source = html.getElementById(
      `Quantity-${
        this.dataset.originalSection
          ? this.dataset.originalSection
          : this.dataset.section
      }`
    );
    var sourcePalletQty = source.getAttribute('data-pallet-qty');
    var destinationPalletQty = destination.getAttribute('data-pallet-qty');
    sourcePalletQty = parseInt(sourcePalletQty);
    destinationPalletQty = parseInt(destinationPalletQty);
    if (sourcePalletQty > 1 || destinationPalletQty > 1) {
      destination.setAttribute('data-pallet-qty', sourcePalletQty);
      // destination.setAttribute('min',sourcePalletQty);
      // destination.setAttribute('data-min',sourcePalletQty);
      // destination.setAttribute('step',sourcePalletQty);
      // destination.setAttribute('value',sourcePalletQty);
      // destination.value = sourcePalletQty;
      // console.log(sourcePalletQty);
      var event = new Event('change');
      destination.dispatchEvent(event);
    }
  }

  toggleAddButton(disable = true, text, modifyClass = true) {
    const productForm = document.getElementById(
      `product-form-${this.dataset.section}`
    );
    if (!productForm) return;
    const addButton = productForm.querySelector('[name="add"]');
    const addButtonText = productForm.querySelector('[name="add"] > span');
    if (!addButton) return;

    if (disable) {
      addButton.setAttribute('disabled', 'disabled');
      if (text) addButtonText.textContent = text;
    } else {
      addButton.removeAttribute('disabled');
      addButtonText.textContent = window.variantStrings.addToCart;
      const currentPrice = document
        .getElementById(`price-${this.dataset.section}`)
        .querySelector('.price__container').innerHTML;
      if (currentPrice) {
        addButtonText.innerHTML = `<span>${window.variantStrings.addToCart}</span> <span> - </span> <span>${currentPrice}</span>`;
      }
    }

    if (!modifyClass) return;
  }

  setUnavailable() {
    const button = document.getElementById(
      `product-form-${this.dataset.section}`
    );
    const addButton = button.querySelector('[name="add"]');
    const addButtonText = button.querySelector('[name="add"] > span');
    const price = document.getElementById(`price-${this.dataset.section}`);
    const inventory = document.getElementById(
      `Inventory-${this.dataset.section}`
    );
    const sku = document.getElementById(`Sku-${this.dataset.section}`);

    if (!addButton) return;
    addButtonText.textContent = window.variantStrings.unavailable;
    if (price) price.classList.add('visibility-hidden');
    if (inventory) inventory.classList.add('visibility-hidden');
    if (sku) sku.classList.add('visibility-hidden');
  }

  getVariantData() {
    this.variantData =
      this.variantData ||
      JSON.parse(this.querySelector('[type="application/json"]').textContent);
    return this.variantData;
  }
}

customElements.define('variant-selects', VariantSelects);

class VariantRadios extends VariantSelects {
  constructor() {
    super();
  }

  setInputAvailability(listOfOptions, listOfAvailableOptions) {
    listOfOptions.forEach((input) => {
      if (listOfAvailableOptions.includes(input.getAttribute('value'))) {
        input.classList.remove('disabled');
      } else {
        input.classList.add('disabled');
      }
    });
  }

  updateOptions() {
    const fieldsets = Array.from(this.querySelectorAll('fieldset'));
    this.options = fieldsets.map((fieldset) => {
      return Array.from(fieldset.querySelectorAll('input')).find(
        (radio) => radio.checked
      ).value;
    });
  }
}

customElements.define('variant-radios', VariantRadios);

class ProductRecommendations extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const handleIntersection = (entries, observer) => {
      if (!entries[0].isIntersecting) return;
      observer.unobserve(this);

      fetch(this.dataset.url)
        .then((response) => response.text())
        .then((text) => {
          const html = document.createElement('div');
          html.innerHTML = text;
          const recommendations = html.querySelector('product-recommendations');

          if (recommendations && recommendations.innerHTML.trim().length) {
            this.innerHTML = recommendations.innerHTML;
          }

          if (
            !this.querySelector('slideshow-component') &&
            this.classList.contains('complementary-products')
          ) {
            this.remove();
          }

          if (html.querySelector('.grid__item')) {
            this.classList.add('product-recommendations--loaded');
          }
        })
        .catch((e) => {
          console.error(e);
        });
    };

    new IntersectionObserver(handleIntersection.bind(this), {
      rootMargin: '0px 0px 400px 0px',
    }).observe(this);
  }
}

customElements.define('product-recommendations', ProductRecommendations);

// class CalculatorModule extends HTMLElement {
//   constructor() {
//     super();
//     this.calculatorContainer = this.querySelector('calculator');
//     this.sectionId = this.calculatorContainer.getAttribute('data-sectionId');
//     this.inputArea = this.calculatorContainer.querySelector('.inputArea');
//     this.recommendations =
//       this.calculatorContainer.querySelector('.recommendations');
//     this.recomQty = this.calculatorContainer.querySelector('.recomQty');
//     this.mainProductForm = document.querySelector(
//       `#product-form-${this.sectionId}`
//     );
//     this.qtyForm = document.querySelector(`#Quantity-Form-${this.sectionId}`);
//     this.mainProductInfo = document.querySelector(
//       `#ProductInfo-${this.sectionId}`
//     );
//     this.formQty = this.qtyForm.querySelector('.quantity__input');
//     this.variantMeta =
//       this.calculatorContainer.querySelector('.productMetafields');
//     this.variantMeta = JSON.parse(this.variantMeta.textContent);
//     this.calToggle = this.querySelector('calBtn');
//     this.closeToggles = this.querySelectorAll('calculator-close');
//     this.calculateBtn = this.querySelector('#calc-btn');
//     this.updateQtyBtn = this.querySelector('quantity-updater');
//     this.noOfBricks = 0;

//     this.container = 'calculator';

//     this.calculateBtn.addEventListener(
//       'click',
//       this.calculateBricks.bind(this)
//     );
//     this.formQty.addEventListener('click', this.formQtyCheck.bind(this));
//     this.calToggle.addEventListener('click', this.onCalToggleClick.bind(this));
//     this.closeToggles.forEach((closeToggle, index) => {
//       closeToggle.addEventListener('click', this.onCalToggleClick.bind(this));
//     });
//     this.updateQtyBtn.addEventListener(
//       'click',
//       this.onUpdateQtyBtnClick.bind(this)
//     );
//   }

//   onCalToggleClick(event) {
//     event.preventDefault();
//     event.target.closest(this.container).classList.contains('open')
//       ? this.close()
//       : this.open(event);
//   }

//   calculateBricks(event) {
//     event.preventDefault();
//     this.boxes = 0;
//     const variantId = this.mainProductForm.querySelector(
//       '.product-variant-id'
//     ).value;
//     const dimensions = Object.entries(this.variantMeta)
//       .map(([, value]) => value[variantId])
//       .find((value) => value !== null && value !== undefined);
//     this.area = this.calculatorContainer.querySelector('#area').value;
//     this.palletQty = this.formQty.getAttribute('data-pallet-qty');
//     this.palletQty = parseInt(this.palletQty);
//     const totalSqft = this.area;
//     var areaOfBrick =
//       parseFloat(dimensions.width) * parseFloat(dimensions.length);
//     this.noOfBricks = Math.ceil(totalSqft / areaOfBrick);
//     //console.log(dimensions.unitsPerSqFt);
//     if (dimensions.unitsPerSqFt != '') {
//       areaOfBrick = dimensions.unitsPerSqFt;
//       this.noOfBricks = totalSqft * areaOfBrick;
//     }

//     // console.log(this.noOfBricks);
//     if (!this.noOfBricks > 0) {
//       this.updateQtyBtn
//         .querySelector('button')
//         .setAttribute('disabled', 'disabled');
//       return;
//     }
//     this.recomQty.textContent = this.noOfBricks;
//     if (this.palletQty > 1) {
//       this.boxes = Math.ceil(this.noOfBricks / this.palletQty);
//       // console.log(this.boxes);
//       this.noOfBricks = this.boxes * this.palletQty;
//     }

//     this.inputArea.textContent = this.area;

//     this.recommendations.style.display = 'block';
//     this.calculateBtn.textContent = 'Recalculate';

//     if (this.boxes > 0) {
//       this.calculatorContainer.querySelector('.boxes').textContent = this.boxes;
//       this.calculatorContainer.querySelector('.bricksInBox').textContent =
//         this.palletQty;
//       this.calculatorContainer.querySelector('.palletEstimate').style.display =
//         'block';
//     } else {
//       this.calculatorContainer.querySelector('.palletEstimate').style.display =
//         'none';
//     }

//     this.updateQtyBtn.querySelector('button').removeAttribute('disabled');
//   }

//   formQtyCheck(event) {
//     event.preventDefault();
//     this.palletQty = this.formQty.getAttribute('data-pallet-qty');
//     this.palletQty = parseInt(this.palletQty);
//     if (this.palletQty > 1) {
//       event.target.setAttribute('readonly', 'readonly');
//       this.calculatorContainer.classList.add('open');
//     } else {
//       event.target.removeAttribute('readonly');
//     }
//   }

//   onUpdateQtyBtnClick(event) {
//     event.preventDefault();
//     // console.log(this.boxes);
//     if (this.boxes > 0) {
//       this.formQty.value = Math.ceil(this.boxes * 7.7);
//       this.formQty.setAttribute('value', Math.ceil(this.boxes * 7.7));
//     } else {
//       this.formQty.value = this.area;
//       this.formQty.setAttribute('value', this.area);
//     }

//     setTimeout(() => {
//       this.close();
//     }, 500);

//     var event = new Event('change');
//     this.formQty.dispatchEvent(event);
//   }

//   onBodyClick(event) {
//     if (
//       !this.contains(event.target) ||
//       event.target.classList.contains('modal-overlay')
//     )
//       this.close(false);
//   }

//   open(event) {
//     this.onBodyClickEvent =
//       this.onBodyClickEvent || this.onBodyClick.bind(this);
//     event.target.closest(this.container).classList.add('open');
//     document.body.addEventListener('click', this.onBodyClickEvent);
//     document.body.classList.add('overflow-hidden');
//   }

//   close(focusToggle = true) {
//     this.calculatorContainer.classList.remove('open');
//     document.body.removeEventListener('click', this.onBodyClickEvent);
//     document.body.classList.remove('overflow-hidden');
//   }
// }

// customElements.define('calculator-module', CalculatorModule);

VideoRatio();

function VideoRatio() {
  var videos = [].slice.call(
    document.querySelectorAll(
      '.video-ratio:not(.for-modal) iframe, .video-ratio:not(.for-modal) video'
    )
  );
  window.addEventListener('load', initRatio);
  window.addEventListener('resize', initRatio);
  window.addEventListener('orientationChange', initRatio);
  function initRatio() {
    var winWdth = window.innerWidth,
      ratio = 0.56;
    if (videos.length) {
      videos.forEach(function (video) {
        if (typeof video.getAttribute('data-video-ratio') !== 'undefined') {
          ratio = video.getAttribute('data-video-ratio');
        }
        var videoPar = video.closest('div'),
          videoParHght = videoPar.offsetHeight,
          cssHght = videoParHght,
          cssWdth = cssHght / ratio;
        if (cssWdth < winWdth) {
          var cssWdth = winWdth,
            cssHght = cssWdth * ratio;
        }
        video.setAttribute(
          'style',
          'width: ' +
            cssWdth +
            'px !important;height: ' +
            cssHght +
            'px !important;'
        );
      });
    }
  }
}

function featuredFeedImage() {
  var items = document.querySelectorAll(
      '#product-grid .card-wrapper, .blog-articles .card-wrapper'
    ),
    firstItem = document.querySelector(
      '#product-grid li:first-child .card-wrapper, .blog-articles > div:first-child .card-wrapper'
    ),
    titleLocation = document.querySelector('.hovered-item__title'),
    imageLocation = document.querySelector('.hovered-item__image');

  if (titleLocation) {
    changeFeaturedFeedImage(firstItem);

    items.forEach(function (item, index) {
      item.addEventListener('mouseenter', function () {
        changeFeaturedFeedImage(this);
      });
    });
  }

  function changeFeaturedFeedImage(cardWrapper) {
    var ttl = cardWrapper.querySelector('.card > .card__content h3').innerText,
      img = cardWrapper.querySelector('.card > .card__inner').cloneNode(true);

    titleLocation.innerHTML = '';
    imageLocation.innerHTML = '';

    titleLocation.innerHTML = ttl;
    imageLocation.innerHTML = img.outerHTML;
    imageLocation.querySelector('.card__content').remove();
  }
}

function feedDisplay(argument) {
  const feedTriggers = document.querySelectorAll('.feed--view-type a'),
    feed = document.querySelector('.feed-view'),
    activeClass = 'current';

  feedTriggers.forEach(function (feedTrigger, index) {
    feedTrigger.addEventListener('click', function (event) {
      toggleView(this);
    });
  });

  function toggleView(element) {
    event.preventDefault();

    feedTriggers.forEach(function (feedTrigger, index) {
      var triggerType = feedTrigger.getAttribute('data-type');
      feedTrigger.classList.remove(activeClass);
      if (feed.classList.contains(triggerType)) {
        feed.classList.remove(triggerType);
      }
    });

    element.classList.add(activeClass);
    feed.classList.add(element.getAttribute('data-type'));
  }
}

function scrollTo(to, duration) {
  if (!to) return false;
  window.scroll({
    behavior: 'smooth',
    left: 0,
    top: to.offsetTop,
  });
}

function anchorScrolls(argument) {
  var anchorLinks = document.querySelectorAll('[href^="#"]'),
    thisHash = window.location.hash;
  anchorLinks.forEach(function (anchorLink, index) {
    anchorLink.addEventListener('click', (event) => {
      event.preventDefault();
      scrollTo(
        document.getElementById(
          event.target.getAttribute('href').replace('#', '')
        ),
        500
      );
    });
  });
  if (thisHash) {
    history.pushState(thisHash, '', window.location.pathname); // removes hash from href
    scrollTo(document.getElementById(thisHash.replace('#', '')), 500);
  }
}

document.addEventListener('DOMContentLoaded', function () {
  anchorScrolls();

  featuredFeedImage();

  feedDisplay();
});

// Accordian
$('#tabs-select').on('change', function () {
  var url = $(this).val(); // get selected value
  if (url) {
    // require a URL
    // window.location = url; // redirect
    console.log($('a[href="' + url + '"]'));
    // $('a[href="' + url + '"]').trigger('click');
    document.querySelector(url).scrollIntoView({
      behavior: 'smooth',
    });
  }
  return false;
});

// sidebar links
$('.sidebar-link').on('click  touch', function () {
  // body...
  $('.sidebar-link').removeClass('active');
  $(this).addClass('active');
});
// Accordian
$(document).on('touch click', '.acc-btn', function () {
  var btn = '.acc-btn',
    animTime = 300,
    justClickedDelay = 500,
    justClicked = false,
    active = 'selected',
    cont = '.acc-content',
    par = '.acc-container',
    ttlTxt = 'h3',
    imgItm = '.img',
    $thsPar = $(this).closest(par),
    clckdIndx = $(this).index(btn), //must not have '- 1' for section style, if page style stops working a new solution is needed
    $cont = $(this).next(cont),
    inrChld = $cont.children(),
    inrChldHght = inrChld.outerHeight(),
    $thsTtl = $thsPar.find(ttlTxt).eq(clckdIndx),
    $thsImg = $thsPar.find(imgItm).eq(clckdIndx),
    isOpen = $thsTtl.hasClass(active),
    winWidth = $(window).width(),
    clearItem = $('#shopify-section-header'),
    actTab = $(ttlTxt + '.' + active),
    actTabTop = !!actTab
      ? ''
      : actTab[0].getBoundingClientRect().top + window.scrollY;

  // console.log($thsPar)
  // console.log(clckdIndx)
  // console.log($cont)
  if (!!clearItem && !!actTab) {
    actTabTop = actTabTop + clearItem.outerHeight(true) + 15;
  }

  if (!justClicked) {
    justClicked = true;
    if (isOpen) {
      removeClasses();
      openClose();
      // console.log('close')
    } else {
      // console.log('open')
      removeClasses();
      addClasses();
      openClose(true);
      // mobScroll();
    }
    setTimeout(function () {
      justClicked = false;
    }, justClickedDelay);
  }

  function mobScroll() {
    if (winWidth < 750) {
      setTimeout(function () {
        console.log(openTabDist);
        $([document.documentElement, document.body]).animate(
          {
            scrollTop: openTabDist,
          },
          animTime
        );
      }, animTime * 2.5);
    }
  }

  function removeClasses() {
    $thsPar.find(btn + ' ' + ttlTxt).removeClass(active);
    $thsPar.find(btn + ' ' + imgItm).removeClass(active);
  }

  function addClasses() {
    $thsTtl.addClass(active);
    $thsImg.addClass(active);
  }

  function zeroHght() {
    $thsPar.find(cont).stop().animate({ height: 0 }, animTime);
  }

  function setHght() {
    $thsPar
      .find(cont)
      .eq(clckdIndx)
      .stop()
      .animate({ height: inrChldHght }, animTime);
  }

  function openClose(dir) {
    if (dir == 'open' || dir == true) {
      zeroHght();
      setHght();
    } else {
      setHght();
      zeroHght();
    }
  }
});

// Homepage button click handler
document.addEventListener('DOMContentLoaded', function () {
  var shopButton = document.getElementById('shop_click');

  if (shopButton) {
    shopButton.addEventListener('click', function () {
      // Ensure this only runs on mobile
      if (window.innerWidth <= 768) {
        openMenuDrawer();
      }
    });
  }
});

function openMenuDrawer() {
  const menuDrawerElement = document.querySelector('menu-drawer');

  if (menuDrawerElement) {
    const mainDetailsToggle = menuDrawerElement.querySelector('details');
    if (mainDetailsToggle) {
      const summaryElement = mainDetailsToggle.querySelector('summary');
      if (summaryElement) {
        summaryElement.click();
      }
    }
  }
}
