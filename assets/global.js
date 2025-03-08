/**
 * Checks for Liquid template errors in DOM elements by searching for specific error strings
 * across multiple element properties.
 *
 * @param {Array<Element>} arr - Array of DOM elements to check for Liquid errors
 * @param {string} string - The error string to search for in the elements
 *
 * @description
 * This function performs a thorough check for Liquid template errors by:
 * - Converting the search string to lowercase for case-insensitive matching
 * - Checking multiple DOM element properties (textContent, outerText, outerHTML, innerText, innerHTML)
 * - Stopping the search when first error is found
 * - Providing visual console output indicating whether errors were found
 *
 * @example
 * // Check for Liquid errors in all paragraph elements
 * const elements = document.getElementsByTagName('p');
 * LiquidErrorCheck(elements, 'Liquid error');
 */
function LiquidErrorCheck(arr, string) {
  var checkingFor = string.toLowerCase().toString(),
    hasError
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
        content.innerHTML.toLowerCase().toString().indexOf(checkingFor) > 0
    hasError = check1 || check2 || check3 || check4 || check5
    if (hasError) {
      arr.length = index + 1
    }
  })
  if (hasError) {
    console.log(
      '%c\n!!!!!!!!!!!!!!!!!!! \n\nLiquid error found! \n\n!!!!!!!!!!!!!!!!!!!\n ',
      'color: red; font-size: 25px'
    )
  } else {
    console.log(
      '%c No liquid errors found. ',
      'color: white; background: green; font-size: 16px'
    )
  }
}

/**
 * Returns an array of all focusable elements within a container element.
 *
 * @param {HTMLElement} container - The container element to search within
 * @returns {Array<HTMLElement>} Array of focusable elements
 *
 * @description
 * This function finds all interactive elements that can receive keyboard focus, including:
 * - summary elements
 * - links with href attributes
 * - enabled buttons
 * - elements with non-negative tabindex
 * - draggable elements
 * - area elements
 * - enabled form inputs (excluding hidden inputs)
 * - enabled select dropdowns
 * - enabled textareas
 * - object elements
 * - iframe elements
 *
 * @example
 * // Get all focusable elements in a modal
 * const modal = document.querySelector('.modal');
 * const focusableElements = getFocusableElements(modal);
 */
function getFocusableElements(container) {
  return Array.from(
    container.querySelectorAll(
      "summary, a[href], button:enabled, [tabindex]:not([tabindex^='-']), [draggable], area, input:not([type=hidden]):enabled, select:enabled, textarea:enabled, object, iframe"
    )
  )
}

/**
 * Initializes accessibility attributes and event handlers for all summary elements within details components.
 *
 * @description
 * This code enhances the accessibility and interactivity of HTML details/summary elements by:
 * - Setting appropriate ARIA roles and states
 * - Handling expand/collapse states
 * - Managing keyboard interactions
 * - Connecting summary elements with their controlled content
 *
 * The following modifications are made to each summary element:
 * - Adds role="button" for proper semantic meaning
 * - Sets aria-expanded based on details open state
 * - Establishes aria-controls relationship with content
 * - Adds click handler to update aria-expanded state
 * - Adds escape key handler (except for header-drawer elements)
 *
 * @example
 * <!-- HTML structure this code expects -->
 * <details id="Details-1">
 *   <summary>Click me</summary>
 *   <div id="content-1">Content</div>
 * </details>
 */
document.querySelectorAll('[id^="Details-"] summary').forEach((summary) => {
  summary.setAttribute('role', 'button')
  summary.setAttribute('aria-expanded', summary.parentNode.hasAttribute('open'))

  if (summary.nextElementSibling.getAttribute('id')) {
    summary.setAttribute('aria-controls', summary.nextElementSibling.id)
  }

  summary.addEventListener('click', (event) => {
    event.currentTarget.setAttribute(
      'aria-expanded',
      !event.currentTarget.closest('details').hasAttribute('open')
    )
  })

  if (summary.closest('header-drawer')) return
  summary.parentElement.addEventListener('keyup', onKeyUpEscape)
})

/**
 * Traps keyboard focus within a specified container element for improved accessibility.
 *
 * @param {HTMLElement} container - The container element to trap focus within
 * @param {HTMLElement} [elementToFocus=container] - The element to receive initial focus, defaults to container
 *
 * @description
 * This function implements a focus trap for modal-like interfaces, ensuring keyboard navigation
 * remains within the specified container. It:
 * - Prevents focus from leaving the container when using Tab or Shift+Tab
 * - Creates a circular tab navigation within the container
 * - Sets up event handlers for focus management:
 *   - focusin: Monitors when focus enters boundary elements
 *   - focusout: Cleans up keydown listeners when focus leaves
 *   - keydown: Handles Tab key navigation
 * - Automatically selects text in text input elements when focused
 *
 * Focus trapping is essential for:
 * - Modal dialogs
 * - Dropdown menus
 * - Other temporary overlays
 *
 * @example
 * // Trap focus in a modal dialog
 * const modal = document.querySelector('.modal-dialog');
 * const firstInput = modal.querySelector('input');
 * trapFocus(modal, firstInput);
 *
 * @see {@link getFocusableElements} - Used internally to find focusable elements
 * @see {@link removeTrapFocus} - Call this to remove the focus trap
 */
const trapFocusHandlers = {}
function trapFocus(container, elementToFocus = container) {
  var elements = getFocusableElements(container)
  var first = elements[0]
  var last = elements[elements.length - 1]

  removeTrapFocus()

  trapFocusHandlers.focusin = (event) => {
    if (
      event.target !== container &&
      event.target !== last &&
      event.target !== first
    )
      return

    document.addEventListener('keydown', trapFocusHandlers.keydown)
  }

  trapFocusHandlers.focusout = function () {
    document.removeEventListener('keydown', trapFocusHandlers.keydown)
  }

  trapFocusHandlers.keydown = function (event) {
    if (event.code.toUpperCase() !== 'TAB') return // If not TAB key
    // On the last focusable element and tab forward, focus the first element.
    if (event.target === last && !event.shiftKey) {
      event.preventDefault()
      first.focus()
    }

    //  On the first focusable element and tab backward, focus the last element.
    if (
      (event.target === container || event.target === first) &&
      event.shiftKey
    ) {
      event.preventDefault()
      last.focus()
    }
  }

  document.addEventListener('focusout', trapFocusHandlers.focusout)
  document.addEventListener('focusin', trapFocusHandlers.focusin)

  elementToFocus.focus()

  if (
    elementToFocus.tagName === 'INPUT' &&
    ['search', 'text', 'email', 'url'].includes(elementToFocus.type) &&
    elementToFocus.value
  ) {
    elementToFocus.setSelectionRange(0, elementToFocus.value.length)
  }
}

// Here run the querySelector to figure out if the browser supports :focus-visible or not and run code based on it.
try {
  document.querySelector(':focus-visible')
} catch (e) {
  focusVisiblePolyfill()
}

/**
 * Polyfills the :focus-visible pseudo-class functionality for browsers that don't support it.
 *
 * @description
 * This function implements a polyfill for the :focus-visible selector by:
 * - Tracking keyboard navigation vs mouse interactions
 * - Adding/removing a 'focused' class to elements based on interaction type
 * - Only showing focus rings when navigating via keyboard
 *
 * The function monitors:
 * - Keyboard events for navigation keys (arrows, tab, etc.)
 * - Mouse events to detect click interactions
 * - Focus events to manage focus states
 *
 * Navigation keys tracked:
 * - Arrow keys (Up, Down, Left, Right)
 * - Tab, Enter, Space
 * - Escape
 * - Home, End
 * - PageUp, PageDown
 *
 * @example
 * // Usage in browser feature detection
 * try {
 *   document.querySelector(':focus-visible');
 * } catch (e) {
 *   focusVisiblePolyfill();
 * }
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/CSS/:focus-visible}
 */
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
    'PAGEDOWN'
  ]
  let currentFocusedElement = null
  let mouseClick = null

  window.addEventListener('keydown', (event) => {
    if (navKeys.includes(event.code.toUpperCase())) {
      mouseClick = false
    }
  })

  window.addEventListener('mousedown', (event) => {
    mouseClick = true
  })

  window.addEventListener(
    'focus',
    () => {
      if (currentFocusedElement)
        currentFocusedElement.classList.remove('focused')

      if (mouseClick) return

      currentFocusedElement = document.activeElement
      currentFocusedElement.classList.add('focused')
    },
    true
  )
}

/**
 * Pauses all media elements on the page including YouTube, Vimeo, HTML5 video, and 3D models.
 *
 * @description
 * This function handles pausing different types of media players by:
 * - Using postMessage API for embedded YouTube and Vimeo iframes
 * - Directly calling pause() on HTML5 video elements
 * - Pausing Shopify 3D model viewers if present
 *
 * This is typically used when:
 * - Opening modals or overlays
 * - Switching between sections
 * - Changing product variants
 * - Any time multiple media elements need to be synchronized
 *
 * @example
 * // Pause all media when opening a modal
 * modal.addEventListener('open', () => {
 *   pauseAllMedia();
 * });
 */
function pauseAllMedia() {
  // Pause YouTube videos using iframe postMessage API
  document.querySelectorAll('.js-youtube').forEach((video) => {
    // YouTube requires a specific JSON structure for player commands
    video.contentWindow.postMessage(
      '{"event":"command","func":"' + 'pauseVideo' + '","args":""}',
      '*' // Allow cross-origin communication
    )
  })

  // Pause Vimeo videos using their player API
  document.querySelectorAll('.js-vimeo').forEach((video) => {
    // Vimeo uses a simpler JSON message structure
    video.contentWindow.postMessage('{"method":"pause"}', '*')
  })

  // Pause native HTML5 video elements
  document.querySelectorAll('video').forEach((video) => video.pause())

  // Pause Shopify 3D model viewers if they exist
  document.querySelectorAll('product-model').forEach((model) => {
    // Only pause if the model viewer UI is initialized
    if (model.modelViewerUI) model.modelViewerUI.pause()
  })
}

/**
 * Removes the focus trap event listeners and optionally focuses on a specified element.
 *
 * @param {HTMLElement} [elementToFocus=null] - Optional element to receive focus after removing the trap
 *
 * @description
 * This function cleans up the focus trap by:
 * - Removing all event listeners that were set up by trapFocus
 * - Optionally shifting focus to a specified element
 *
 * This is typically called when:
 * - Closing modals or overlays
 * - Dismissing dropdown menus
 * - Any time you need to restore normal page focus behavior
 *
 * @see {@link trapFocus} - The function that sets up the focus trap initially
 */
function removeTrapFocus(elementToFocus = null) {
  // Remove all event listeners that were managing the focus trap
  document.removeEventListener('focusin', trapFocusHandlers.focusin)
  document.removeEventListener('focusout', trapFocusHandlers.focusout)
  document.removeEventListener('keydown', trapFocusHandlers.keydown)

  // If an element was specified, move focus to it
  // This is useful for maintaining a logical focus flow after closing a modal/overlay
  if (elementToFocus) elementToFocus.focus()
}

/**
 * Handles the escape key press event for details/summary elements, providing accessible collapse functionality.
 *
 * @param {KeyboardEvent} event - The keyboard event object
 *
 * @description
 * This function provides keyboard accessibility for collapsible details elements by:
 * - Detecting escape key presses
 * - Finding and closing the nearest open details element
 * - Updating ARIA states for accessibility
 * - Managing focus for keyboard navigation
 *
 * This is typically used for:
 * - Navigation menus
 * - Accordion interfaces
 * - Dropdown components
 *
 * @example
 * // Add escape key handling to a details element
 * detailsElement.addEventListener('keyup', onKeyUpEscape);
 */
function onKeyUpEscape(event) {
  // Only proceed if the Escape key was pressed
  if (event.code.toUpperCase() !== 'ESCAPE') return

  // Find the nearest parent details element that is currently open
  const openDetailsElement = event.target.closest('details[open]')
  if (!openDetailsElement) return

  // Get the summary element to manage its state and focus
  const summaryElement = openDetailsElement.querySelector('summary')

  // Close the details element by removing the open attribute
  openDetailsElement.removeAttribute('open')

  // Update ARIA state for accessibility
  summaryElement.setAttribute('aria-expanded', false)

  // Move focus to the summary element for keyboard navigation
  summaryElement.focus()
}

/**
 * Custom element that implements sticky header functionality with scroll-based behavior.
 *
 * @class
 * @extends HTMLElement
 *
 * @description
 * This class manages a sticky header that can:
 * - Always remain sticky based on data-sticky-type attribute
 * - Hide/show based on scroll direction
 * - Adjust height responsively
 * - Handle predictive search interactions
 * - Manage menu and search modal states
 *
 * Sticky Types:
 * - 'always': Header always remains sticky
 * - 'reduce-logo-size': Header remains sticky with reduced logo size
 * - default: Header shows/hides based on scroll direction
 *
 * @example
 * // HTML usage
 * <sticky-header data-sticky-type="always">
 *   <!-- Header content -->
 * </sticky-header>
 */
class StickyHeader extends HTMLElement {
  constructor() {
    super()
  }

  connectedCallback() {
    // Initialize header elements and state
    this.header = document.querySelector('.section-header')
    this.headerIsAlwaysSticky =
      this.getAttribute('data-sticky-type') === 'always' ||
      this.getAttribute('data-sticky-type') === 'reduce-logo-size'
    this.headerBounds = {}

    // Set initial header height and listen for viewport changes
    this.setHeaderHeight()
    window
      .matchMedia('(max-width: 990px)')
      .addEventListener('change', this.setHeaderHeight.bind(this))

    // If header should always be sticky, set appropriate classes
    if (this.headerIsAlwaysSticky) {
      this.header.classList.add('shopify-section-header-sticky')
      document.body.classList.add('header-sticky')
    }

    // Initialize scroll tracking variables
    this.currentScrollTop = 0
    this.preventReveal = false
    this.predictiveSearch = this.querySelector('predictive-search')

    // Bind event handlers
    this.onScrollHandler = this.onScroll.bind(this)
    this.hideHeaderOnScrollUp = () => (this.preventReveal = true)

    // Add event listeners for scroll and header reveal prevention
    this.addEventListener('preventHeaderReveal', this.hideHeaderOnScrollUp)
    window.addEventListener('scroll', this.onScrollHandler, false)

    // Set up intersection observer to track header position
    this.createObserver()
  }

  /**
   * Sets the header height CSS variable for responsive layouts
   */
  setHeaderHeight() {
    document.documentElement.style.setProperty(
      '--header-height',
      `${this.header.offsetHeight}px`
    )
  }

  /**
   * Cleanup event listeners when element is removed
   */
  disconnectedCallback() {
    this.removeEventListener('preventHeaderReveal', this.hideHeaderOnScrollUp)
    window.removeEventListener('scroll', this.onScrollHandler)
  }

  /**
   * Creates an IntersectionObserver to track header position relative to viewport
   */
  createObserver() {
    let observer = new IntersectionObserver((entries, observer) => {
      this.headerBounds = entries[0].intersectionRect
      observer.disconnect()
    })

    observer.observe(this.header)
  }

  /**
   * Handles scroll events to show/hide header based on scroll direction
   */
  onScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop

    // Don't process scroll if predictive search is open
    if (this.predictiveSearch && this.predictiveSearch.isOpen) return

    // Scrolling down past header
    if (
      scrollTop > this.currentScrollTop &&
      scrollTop > this.headerBounds.bottom
    ) {
      this.header.classList.add('scrolled-past-header')
      if (this.preventHide) return
      requestAnimationFrame(this.hide.bind(this))
    }
    // Scrolling up while past header
    else if (
      scrollTop < this.currentScrollTop &&
      scrollTop > this.headerBounds.bottom
    ) {
      this.header.classList.add('scrolled-past-header')
      if (!this.preventReveal) {
        requestAnimationFrame(this.reveal.bind(this))
      } else {
        // Reset preventReveal after a short delay
        window.clearTimeout(this.isScrolling)
        this.isScrolling = setTimeout(() => {
          this.preventReveal = false
        }, 66)

        requestAnimationFrame(this.hide.bind(this))
      }
    }
    // Scrolled to top of page
    else if (scrollTop <= this.headerBounds.top) {
      this.header.classList.remove('scrolled-past-header')
      requestAnimationFrame(this.reset.bind(this))
    }

    // Update current scroll position
    this.currentScrollTop = scrollTop
  }

  /**
   * Hides the header when scrolling down
   */
  hide() {
    if (this.headerIsAlwaysSticky) return
    document.body.classList.remove('header-sticky')
    this.header.classList.add(
      'shopify-section-header-hidden',
      'shopify-section-header-sticky'
    )
    // Close any open menus/modals when hiding header
    this.closeMenuDisclosure()
    this.closeSearchModal()
  }

  /**
   * Shows the header when scrolling up
   */
  reveal() {
    if (this.headerIsAlwaysSticky) return
    document.body.classList.add('header-sticky')
    this.header.classList.add('shopify-section-header-sticky', 'animate')
    this.header.classList.remove('shopify-section-header-hidden')
  }

  /**
   * Resets header state when at top of page
   */
  reset() {
    if (this.headerIsAlwaysSticky) return
    document.body.classList.remove('header-sticky')
    this.header.classList.remove(
      'shopify-section-header-hidden',
      'shopify-section-header-sticky',
      'animate'
    )
  }

  /**
   * Closes all menu disclosures in the header
   */
  closeMenuDisclosure() {
    // Cache disclosures for performance
    this.disclosures =
      this.disclosures || this.header.querySelectorAll('header-menu')
    this.disclosures.forEach((disclosure) => disclosure.close())
  }

  /**
   * Closes the search modal if open
   */
  closeSearchModal() {
    // Cache search modal for performance
    this.searchModal =
      this.searchModal || this.header.querySelector('details-modal')
    this.searchModal.close(false)
  }
}

customElements.define('sticky-header', StickyHeader)

/**
 * Custom element that manages quantity input functionality with special handling for paver products.
 *
 * @class
 * @extends HTMLElement
 *
 * @description
 * This class manages a quantity input component that:
 * - Handles quantity validation for paver and non-paver products
 * - Updates Add to Cart button state based on quantity rules
 * - Calculates and displays total price based on quantity
 * - Shows/hides quantity validation messages
 * - Manages increment/decrement buttons
 *
 * Special Features for Paver Products:
 * - Enforces minimum/maximum quantity limits
 * - Shows validation messages for invalid quantities
 * - Disables Add to Cart button when quantity is invalid
 *
 * @example
 * <!-- HTML usage -->
 * <quantity-input>
 *   <input type="number" data-paver min="1" max="100">
 *   <button name="plus">+</button>
 *   <button name="minus">-</button>
 * </quantity-input>
 */
class QuantityInput extends HTMLElement {
  constructor() {
    super()
    // Initialize core elements
    this.input = this.querySelector('input')
    this.changeEvent = new Event('change', { bubbles: true })
    this.atcButton = document.querySelector('.product-form__submit')

    // Check if this is a paver product and handle initial state
    const isPaver = this.input.hasAttribute('data-paver')
    if (isPaver && this.atcButton && parseInt(this.input.value) < 1) {
      this.atcButton.setAttribute('disabled', 'true')
    }

    // Set up event listeners
    this.input.addEventListener('change', this.onInputChange.bind(this))
    this.querySelectorAll('button').forEach((button) =>
      button.addEventListener('click', this.onButtonClick.bind(this))
    )
    this.isRunning = false
  }

  quantityUpdateUnsubscriber = undefined

  /**
   * Sets up initial state and subscribes to quantity update events
   */
  connectedCallback() {
    this.validateQtyRules()
    this.quantityUpdateUnsubscriber = subscribe(
      PUB_SUB_EVENTS.quantityUpdate,
      this.validateQtyRules.bind(this)
    )
  }

  /**
   * Cleans up event subscriptions when element is removed
   */
  disconnectedCallback() {
    if (this.quantityUpdateUnsubscriber) {
      this.quantityUpdateUnsubscriber()
    }
  }

  /**
   * Handles quantity input changes by validating rules and updating price display
   * @param {Event} event - The change event
   */
  onInputChange(event) {
    // Validate quantity rules first
    this.validateQtyRules()

    // Get the variant selects instance to access the current variant
    const variantSelects = document.querySelector(
      'variant-selects, variant-radios'
    )
    if (variantSelects) {
      // Calculate and update the total price based on quantity
      const value = parseInt(this.input.value) || 0
      const currentPrice = document
        .getElementById(`price-${variantSelects.dataset.section}`)
        ?.querySelector('.price__container')

      if (currentPrice) {
        // Get base price and calculate total
        const basePrice =
          parseFloat(
            currentPrice
              .querySelector('.price-item--regular')
              .getAttribute('data-price')
          ) || 0
        const totalPrice = ((basePrice * value) / 100).toFixed(2)

        // Update Add to Cart button text with total price if button is enabled
        const addButton = document.querySelector('.product-form__submit span')
        if (addButton && !this.atcButton.hasAttribute('disabled')) {
          addButton.innerHTML = `<span>${window.variantStrings.addToCart}</span> <span> - </span> <span>$${totalPrice}</span>`
        }
      }
    }

    // Toggle validation message if needed
    this.toggleMessage()
  }

  /**
   * Toggles visibility of quantity validation message for paver products
   */
  toggleMessage() {
    const value = parseInt(this.input.value)
    const min = parseInt(this.input.dataset.min)
    const max = parseInt(this.input.dataset.max)
    const isPaver = this.input.hasAttribute('data-paver')

    // Only show messages for paver products
    if (!isPaver) return

    // Show/hide message based on quantity validation
    if (value > max || value < min) {
      document
        .querySelector('[data-paver-qty-message]')
        ?.classList.remove('hidden')
    } else {
      document
        .querySelector('[data-paver-qty-message]')
        ?.classList.add('hidden')
    }
  }

  /**
   * Handles increment/decrement button clicks
   * @param {Event} event - The click event
   */
  onButtonClick(event) {
    event.preventDefault()
    const previousValue = this.input.value
    // Increment or decrement based on button name
    event.target.name === 'plus' ? this.input.stepUp() : this.input.stepDown()
    // Only dispatch change event if value actually changed
    if (previousValue !== this.input.value)
      this.input.dispatchEvent(this.changeEvent)
  }

  /**
   * Validates quantity rules and updates UI accordingly
   */
  validateQtyRules() {
    // Parse input values with fallbacks
    const value = parseInt(this.input.value) || 0
    const min = parseInt(this.input.min) ?? 1
    const max = Number.isNaN(parseInt(this.input.max))
      ? Number.MAX_VALUE
      : parseInt(this.input.max)

    // Disable minus button if at minimum
    if (this.input.min) {
      const buttonMinus = this.querySelector(".quantity__button[name='minus']")
      buttonMinus.classList.toggle('disabled', value <= min)
    }
    // Disable plus button if at maximum
    if (this.input.max) {
      const buttonPlus = this.querySelector(".quantity__button[name='plus']")
      buttonPlus.classList.toggle('disabled', value >= max)
    }

    const isPaver = this.input.hasAttribute('data-paver')

    // Handle Add to Cart button state differently for paver vs non-paver products
    if (isPaver) {
      // For pavers: disable button if quantity is invalid
      if (value >= min && value <= max) {
        this.atcButton?.removeAttribute('disabled')
      } else {
        this.atcButton?.setAttribute('disabled', 'true')
      }
    } else {
      // For non-pavers: always enable the button
      this.atcButton?.removeAttribute('disabled')
    }
  }
}

customElements.define('quantity-input', QuantityInput)

/**
 * Creates a debounced version of a function that delays its execution until after a specified wait time.
 *
 * @param {Function} fn - The function to debounce
 * @param {number} wait - The number of milliseconds to wait before executing the function
 * @returns {Function} A debounced version of the input function
 *
 * @description
 * This utility function creates a debounced version of a function that:
 * - Delays execution until after the specified wait time
 * - Cancels pending executions when called again within the wait period
 * - Useful for rate-limiting expensive operations (e.g., API calls, DOM updates)
 *
 * @example
 * // Debounce a search input handler to prevent excessive API calls
 * const debouncedSearch = debounce((searchTerm) => {
 *   // Perform search operation
 * }, 300);
 *
 * searchInput.addEventListener('input', (e) => debouncedSearch(e.target.value));
 */
function debounce(fn, wait) {
  // Store the timeout ID for clearing
  let t

  // Return a wrapped function that handles the debouncing
  return (...args) => {
    // Clear any existing timeout to cancel pending executions
    clearTimeout(t)

    // Set a new timeout that will execute the function after the wait period
    t = setTimeout(() => fn.apply(this, args), wait)
  }
}

function fetchConfig(type = 'json') {
  return {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: `application/${type}`
    }
  }
}

/**
 * Shopify Common JavaScript Library
 *
 * @description
 * This section contains core utility functions and objects provided by Shopify that are used
 * across their platform. These utilities help with:
 * - DOM manipulation
 * - Event handling
 * - Form submissions
 * - Country/Province selector functionality
 *
 * These functions are part of Shopify's standard JavaScript library and are commonly
 * used in themes and custom implementations.
 */

/* Initialize Shopify namespace if it doesn't exist */
if (typeof window.Shopify == 'undefined') {
  window.Shopify = {}
}

Shopify.bind = function (fn, scope) {
  return function () {
    return fn.apply(scope, arguments)
  }
}

Shopify.setSelectorByValue = function (selector, value) {
  for (var i = 0, count = selector.options.length; i < count; i++) {
    var option = selector.options[i]
    if (value == option.value || value == option.innerHTML) {
      selector.selectedIndex = i
      return i
    }
  }
}

Shopify.addListener = function (target, eventName, callback) {
  target.addEventListener
    ? target.addEventListener(eventName, callback, false)
    : target.attachEvent('on' + eventName, callback)
}

Shopify.postLink = function (path, options) {
  options = options || {}
  var method = options['method'] || 'post'
  var params = options['parameters'] || {}

  var form = document.createElement('form')
  form.setAttribute('method', method)
  form.setAttribute('action', path)

  for (var key in params) {
    var hiddenField = document.createElement('input')
    hiddenField.setAttribute('type', 'hidden')
    hiddenField.setAttribute('name', key)
    hiddenField.setAttribute('value', params[key])
    form.appendChild(hiddenField)
  }
  document.body.appendChild(form)
  form.submit()
  document.body.removeChild(form)
}

Shopify.CountryProvinceSelector = function (
  country_domid,
  province_domid,
  options
) {}

Shopify.CountryProvinceSelector.prototype = {
  initCountry: function () {
    var value = this.countryEl.getAttribute('data-default')
    Shopify.setSelectorByValue(this.countryEl, value)
    this.countryHandler()
  },

  initProvince: function () {
    var value = this.provinceEl.getAttribute('data-default')
    if (value && this.provinceEl.options.length > 0) {
      Shopify.setSelectorByValue(this.provinceEl, value)
    }
  },

  countryHandler: function (e) {
    var opt = this.countryEl.options[this.countryEl.selectedIndex]
    var raw = opt.getAttribute('data-provinces')
    var provinces = JSON.parse(raw)

    this.clearOptions(this.provinceEl)
    if (provinces && provinces.length == 0) {
      this.provinceContainer.style.display = 'none'
    } else {
      for (var i = 0; i < provinces.length; i++) {
        var opt = document.createElement('option')
        opt.value = provinces[i][0]
        opt.innerHTML = provinces[i][1]
        this.provinceEl.appendChild(opt)
      }

      this.provinceContainer.style.display = ''
    }
  },

  clearOptions: function (selector) {
    while (selector.firstChild) {
      selector.removeChild(selector.firstChild)
    }
  },

  setOptions: function (selector, values) {
    for (var i = 0, count = values.length; i < values.length; i++) {
      var opt = document.createElement('option')
      opt.value = values[i]
      opt.innerHTML = values[i]
      selector.appendChild(opt)
    }
  }
}

/**
 * Custom element that implements a sliding menu drawer with submenu support and accessibility features.
 *
 * @class
 * @extends HTMLElement
 *
 * @description
 * This class manages a menu drawer component that:
 * - Handles opening/closing of the main menu and submenus
 * - Implements keyboard navigation and accessibility
 * - Manages focus trapping within the menu
 * - Handles animations and transitions
 * - Supports reduced motion preferences
 *
 * Features:
 * - Keyboard support (Escape to close)
 * - Focus management
 * - ARIA attribute handling
 * - Submenu support
 * - Responsive behavior
 *
 * @example
 * <!-- HTML usage -->
 * <menu-drawer data-breakpoint="tablet">
 *   <details>
 *     <summary>Menu</summary>
 *     <div class="menu-drawer">
 *       <!-- Menu content -->
 *     </div>
 *   </details>
 * </menu-drawer>
 */
class MenuDrawer extends HTMLElement {
  constructor() {
    super()

    // Get the main details element that controls the menu drawer
    this.mainDetailsToggle = this.querySelector('details')

    // Set up event listeners for keyboard and focus management
    this.addEventListener('keyup', this.onKeyUp.bind(this))
    this.addEventListener('focusout', this.onFocusOut.bind(this))
    this.bindEvents()
  }

  bindEvents() {
    // Add click handlers to all summary elements (menu toggles)
    this.querySelectorAll('summary').forEach((summary) =>
      summary.addEventListener('click', this.onSummaryClick.bind(this))
    )
    // Add click handlers to close buttons (excluding localization selector)
    this.querySelectorAll('button:not(.localization-selector)').forEach(
      (button) =>
        button.addEventListener('click', this.onCloseButtonClick.bind(this))
    )
  }

  onKeyUp(event) {
    // Only handle Escape key presses
    if (event.code.toUpperCase() !== 'ESCAPE') return

    // Find the nearest open details element
    const openDetailsElement = event.target.closest('details[open]')
    if (!openDetailsElement) return

    // If it's the main menu, close the entire drawer
    // Otherwise, just close the submenu
    openDetailsElement === this.mainDetailsToggle
      ? this.closeMenuDrawer(
          event,
          this.mainDetailsToggle.querySelector('summary')
        )
      : this.closeSubmenu(openDetailsElement)
  }

  onSummaryClick(event) {
    const summaryElement = event.currentTarget
    const detailsElement = summaryElement.parentNode
    const parentMenuElement = detailsElement.closest('.has-submenu')
    const isOpen = detailsElement.hasAttribute('open')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

    // Helper function to set up focus trapping after transition
    function addTrapFocus() {
      trapFocus(
        summaryElement.nextElementSibling,
        detailsElement.querySelector('button')
      )
      summaryElement.nextElementSibling.removeEventListener(
        'transitionend',
        addTrapFocus
      )
    }

    // Handle main menu toggle differently from submenus
    if (detailsElement === this.mainDetailsToggle) {
      if (isOpen) event.preventDefault()
      isOpen
        ? this.closeMenuDrawer(event, summaryElement)
        : this.openMenuDrawer(summaryElement)

      // Update viewport height for mobile devices
      if (window.matchMedia('(max-width: 990px)')) {
        document.documentElement.style.setProperty(
          '--viewport-height',
          `${window.innerHeight}px`
        )
      }
    } else {
      // Handle submenu opening with animation
      setTimeout(() => {
        detailsElement.classList.add('menu-opening')
        summaryElement.setAttribute('aria-expanded', true)
        parentMenuElement && parentMenuElement.classList.add('submenu-open')

        // Respect reduced motion preferences for focus handling
        !reducedMotion || reducedMotion.matches
          ? addTrapFocus()
          : summaryElement.nextElementSibling.addEventListener(
              'transitionend',
              addTrapFocus
            )
      }, 100)
    }
  }

  openMenuDrawer(summaryElement) {
    // Add opening animation class after a brief delay
    setTimeout(() => {
      this.mainDetailsToggle.classList.add('menu-opening')
    })

    // Update ARIA state and set up focus management
    summaryElement.setAttribute('aria-expanded', true)
    trapFocus(this.mainDetailsToggle, summaryElement)

    // Prevent page scrolling while menu is open
    document.body.classList.add(`overflow-hidden-${this.dataset.breakpoint}`)
  }

  closeMenuDrawer(event, elementToFocus = false) {
    if (event === undefined) return

    // Remove opening state and reset all submenus
    this.mainDetailsToggle.classList.remove('menu-opening')
    this.mainDetailsToggle.querySelectorAll('details').forEach((details) => {
      details.removeAttribute('open')
      details.classList.remove('menu-opening')
    })

    // Close all open submenus
    this.mainDetailsToggle
      .querySelectorAll('.submenu-open')
      .forEach((submenu) => {
        submenu.classList.remove('submenu-open')
      })

    // Restore page scrolling and focus management
    document.body.classList.remove(`overflow-hidden-${this.dataset.breakpoint}`)
    removeTrapFocus(elementToFocus)
    this.closeAnimation(this.mainDetailsToggle)
  }

  onFocusOut() {
    // Close menu if focus moves outside the menu drawer
    setTimeout(() => {
      if (
        this.mainDetailsToggle.hasAttribute('open') &&
        !this.mainDetailsToggle.contains(document.activeElement)
      )
        this.closeMenuDrawer()
    })
  }

  onCloseButtonClick(event) {
    const detailsElement = event.currentTarget.closest('details')
    this.closeSubmenu(detailsElement)
  }

  closeSubmenu(detailsElement) {
    // Remove submenu open states and update ARIA attributes
    const parentMenuElement = detailsElement.closest('.submenu-open')
    parentMenuElement && parentMenuElement.classList.remove('submenu-open')
    detailsElement.classList.remove('menu-opening')
    detailsElement.querySelector('summary').setAttribute('aria-expanded', false)

    // Update focus management and trigger closing animation
    removeTrapFocus(detailsElement.querySelector('summary'))
    this.closeAnimation(detailsElement)
  }

  closeAnimation(detailsElement) {
    let animationStart

    // Handle closing animation using requestAnimationFrame
    const handleAnimation = (time) => {
      if (animationStart === undefined) {
        animationStart = time
      }

      const elapsedTime = time - animationStart

      // Continue animation for 400ms
      if (elapsedTime < 400) {
        window.requestAnimationFrame(handleAnimation)
      } else {
        // After animation, remove open state and update focus if needed
        detailsElement.removeAttribute('open')
        if (detailsElement.closest('details[open]')) {
          trapFocus(
            detailsElement.closest('details[open]'),
            detailsElement.querySelector('summary')
          )
        }
      }
    }

    window.requestAnimationFrame(handleAnimation)
  }
}

customElements.define('menu-drawer', MenuDrawer)

class HeaderDrawer extends MenuDrawer {
  constructor() {
    super()
  }

  openMenuDrawer(summaryElement) {
    this.header = this.header || document.querySelector('.section-header')
    this.borderOffset =
      this.borderOffset ||
      this.closest('.header-wrapper').classList.contains(
        'header-wrapper--border-bottom'
      )
        ? 1
        : 0
    document.documentElement.style.setProperty(
      '--header-bottom-position',
      `${parseInt(
        this.header.getBoundingClientRect().bottom - this.borderOffset
      )}px`
    )
    this.header.classList.add('menu-open')

    setTimeout(() => {
      this.mainDetailsToggle.classList.add('menu-opening')
    })

    summaryElement.setAttribute('aria-expanded', true)
    window.addEventListener('resize', this.onResize)
    trapFocus(this.mainDetailsToggle, summaryElement)
    document.body.classList.add(`overflow-hidden-${this.dataset.breakpoint}`)
  }

  closeMenuDrawer(event, elementToFocus) {
    if (!elementToFocus) return
    super.closeMenuDrawer(event, elementToFocus)
    this.header.classList.remove('menu-open')
    window.removeEventListener('resize', this.onResize)
  }

  onResize = () => {
    this.header &&
      document.documentElement.style.setProperty(
        '--header-bottom-position',
        `${parseInt(
          this.header.getBoundingClientRect().bottom - this.borderOffset
        )}px`
      )
    document.documentElement.style.setProperty(
      '--viewport-height',
      `${window.innerHeight}px`
    )
  }
}

customElements.define('header-drawer', HeaderDrawer)

class ModalDialog extends HTMLElement {
  constructor() {
    super()
    this.querySelector('[id^="ModalClose-"]').addEventListener(
      'click',
      this.hide.bind(this, false)
    )
    this.addEventListener('keyup', (event) => {
      if (event.code.toUpperCase() === 'ESCAPE') this.hide()
    })
    if (this.classList.contains('media-modal')) {
      this.addEventListener('pointerup', (event) => {
        if (
          event.pointerType === 'mouse' &&
          !event.target.closest('deferred-media, product-model')
        )
          this.hide()
      })
    } else {
      this.addEventListener('click', (event) => {
        if (event.target === this) this.hide()
      })
    }
  }

  connectedCallback() {
    if (this.moved) return
    this.moved = true
    document.body.appendChild(this)
  }

  show(opener) {
    this.openedBy = opener
    const popup = this.querySelector('.template-popup')
    document.body.classList.add('overflow-hidden')
    this.setAttribute('open', '')
    if (popup) popup.loadContent()
    trapFocus(this, this.querySelector('[role="dialog"]'))
    window.pauseAllMedia()
  }

  hide() {
    document.body.classList.remove('overflow-hidden')
    document.body.dispatchEvent(new CustomEvent('modalClosed'))
    this.removeAttribute('open')
    removeTrapFocus(this.openedBy)
    window.pauseAllMedia()
  }
}
customElements.define('modal-dialog', ModalDialog)

class ModalOpener extends HTMLElement {
  constructor() {
    super()

    const button = this.querySelector('button')

    if (!button) return
    button.addEventListener('click', () => {
      const modal = document.querySelector(this.getAttribute('data-modal'))
      if (modal) modal.show(button)
    })
  }
}
customElements.define('modal-opener', ModalOpener)

class DeferredMedia extends HTMLElement {
  constructor() {
    super()
    const poster = this.querySelector('[id^="Deferred-Poster-"]')
    if (!poster) return
    poster.addEventListener('click', this.loadContent.bind(this))
  }

  loadContent(focus = true) {
    window.pauseAllMedia()
    if (!this.getAttribute('loaded')) {
      const content = document.createElement('div')
      content.appendChild(
        this.querySelector('template').content.firstElementChild.cloneNode(true)
      )

      this.setAttribute('loaded', true)
      const deferredElement = this.appendChild(
        content.querySelector('video, model-viewer, iframe')
      )
      if (focus) deferredElement.focus()
      if (
        deferredElement.nodeName == 'VIDEO' &&
        deferredElement.getAttribute('autoplay')
      ) {
        // force autoplay for safari
        deferredElement.play()
      }
    }
  }
}

customElements.define('deferred-media', DeferredMedia)

class SliderComponent extends HTMLElement {
  constructor() {
    super()
    this.slider = this.querySelector('[id^="Slider-"]')
    this.sliderItems = this.querySelectorAll('[id^="Slide-"]')
    this.enableSliderLooping = false
    this.currentPageElement = this.querySelector('.slider-counter--current')
    this.pageTotalElement = this.querySelector('.slider-counter--total')
    this.prevButton = this.querySelector('button[name="previous"]')
    this.nextButton = this.querySelector('button[name="next"]')

    if (!this.slider || !this.nextButton) return

    this.initPages()
    const resizeObserver = new ResizeObserver((entries) => this.initPages())
    resizeObserver.observe(this.slider)

    this.slider.addEventListener('scroll', this.update.bind(this))
    this.prevButton.addEventListener('click', this.onButtonClick.bind(this))
    this.nextButton.addEventListener('click', this.onButtonClick.bind(this))
  }

  initPages() {
    this.sliderItemsToShow = Array.from(this.sliderItems).filter(
      (element) => element.clientWidth > 0
    )
    if (this.sliderItemsToShow.length < 2) return
    this.sliderItemOffset =
      this.sliderItemsToShow[1].offsetLeft -
      this.sliderItemsToShow[0].offsetLeft
    this.slidesPerPage = Math.floor(
      (this.slider.clientWidth - this.sliderItemsToShow[0].offsetLeft) /
        this.sliderItemOffset
    )
    this.totalPages = this.sliderItemsToShow.length - this.slidesPerPage + 1
    this.update()
  }

  resetPages() {
    this.sliderItems = this.querySelectorAll('[id^="Slide-"]')
    this.initPages()
  }

  update() {
    // Temporarily prevents unneeded updates resulting from variant changes
    // This should be refactored as part of https://github.com/Shopify/dawn/issues/2057
    if (!this.slider || !this.nextButton) return

    const previousPage = this.currentPage
    this.currentPage =
      Math.round(this.slider.scrollLeft / this.sliderItemOffset) + 1

    if (this.currentPageElement && this.pageTotalElement) {
      this.currentPageElement.textContent = this.currentPage
      this.pageTotalElement.textContent = this.totalPages
    }

    if (this.currentPage != previousPage) {
      this.dispatchEvent(
        new CustomEvent('slideChanged', {
          detail: {
            currentPage: this.currentPage,
            currentElement: this.sliderItemsToShow[this.currentPage - 1]
          }
        })
      )
    }

    if (this.enableSliderLooping) return

    if (
      this.isSlideVisible(this.sliderItemsToShow[0]) &&
      this.slider.scrollLeft === 0
    ) {
      this.prevButton.setAttribute('disabled', 'disabled')
    } else {
      this.prevButton.removeAttribute('disabled')
    }

    if (
      this.isSlideVisible(
        this.sliderItemsToShow[this.sliderItemsToShow.length - 1]
      )
    ) {
      this.nextButton.setAttribute('disabled', 'disabled')
    } else {
      this.nextButton.removeAttribute('disabled')
    }
  }

  isSlideVisible(element, offset = 0) {
    const lastVisibleSlide =
      this.slider.clientWidth + this.slider.scrollLeft - offset
    return (
      element.offsetLeft + element.clientWidth <= lastVisibleSlide &&
      element.offsetLeft >= this.slider.scrollLeft
    )
  }

  onButtonClick(event) {
    event.preventDefault()
    const step = event.currentTarget.dataset.step || 1
    this.slideScrollPosition =
      event.currentTarget.name === 'next'
        ? this.slider.scrollLeft + step * this.sliderItemOffset
        : this.slider.scrollLeft - step * this.sliderItemOffset
    this.slider.scrollTo({
      left: this.slideScrollPosition
    })
  }
}

customElements.define('slider-component', SliderComponent)

class SlideshowComponent extends SliderComponent {
  constructor() {
    super()
    this.sliderControlWrapper = this.querySelector('.slider-buttons')
    this.enableSliderLooping = true

    if (!this.sliderControlWrapper) return

    this.sliderFirstItemNode = this.slider.querySelector('.slideshow__slide')
    if (this.sliderItemsToShow.length > 0) this.currentPage = 1

    this.sliderControlLinksArray = Array.from(
      this.sliderControlWrapper.querySelectorAll('.slider-counter__link')
    )
    this.sliderControlLinksArray.forEach((link) =>
      link.addEventListener('click', this.linkToSlide.bind(this))
    )
    this.slider.addEventListener('scroll', this.setSlideVisibility.bind(this))
    this.setSlideVisibility()

    if (this.slider.getAttribute('data-autoplay') === 'true') this.setAutoPlay()
  }

  setAutoPlay() {
    this.sliderAutoplayButton = this.querySelector('.slideshow__autoplay')
    this.autoplaySpeed = this.slider.dataset.speed * 1000

    this.sliderAutoplayButton.addEventListener(
      'click',
      this.autoPlayToggle.bind(this)
    )
    this.addEventListener('mouseover', this.focusInHandling.bind(this))
    this.addEventListener('mouseleave', this.focusOutHandling.bind(this))
    this.addEventListener('focusin', this.focusInHandling.bind(this))
    this.addEventListener('focusout', this.focusOutHandling.bind(this))

    this.play()
    this.autoplayButtonIsSetToPlay = true
  }

  onButtonClick(event) {
    super.onButtonClick(event)
    const isFirstSlide = this.currentPage === 1
    const isLastSlide = this.currentPage === this.sliderItemsToShow.length

    if (!isFirstSlide && !isLastSlide) return

    if (isFirstSlide && event.currentTarget.name === 'previous') {
      this.slideScrollPosition =
        this.slider.scrollLeft +
        this.sliderFirstItemNode.clientWidth * this.sliderItemsToShow.length
    } else if (isLastSlide && event.currentTarget.name === 'next') {
      this.slideScrollPosition = 0
    }
    this.slider.scrollTo({
      left: this.slideScrollPosition
    })
  }

  update() {
    super.update()
    this.sliderControlButtons = this.querySelectorAll('.slider-counter__link')
    this.prevButton.removeAttribute('disabled')

    if (!this.sliderControlButtons.length) return

    this.sliderControlButtons.forEach((link) => {
      link.classList.remove('slider-counter__link--active')
      link.removeAttribute('aria-current')
    })
    this.sliderControlButtons[this.currentPage - 1].classList.add(
      'slider-counter__link--active'
    )
    this.sliderControlButtons[this.currentPage - 1].setAttribute(
      'aria-current',
      true
    )
  }

  autoPlayToggle() {
    this.togglePlayButtonState(this.autoplayButtonIsSetToPlay)
    this.autoplayButtonIsSetToPlay ? this.pause() : this.play()
    this.autoplayButtonIsSetToPlay = !this.autoplayButtonIsSetToPlay
  }

  focusOutHandling(event) {
    const focusedOnAutoplayButton =
      event.target === this.sliderAutoplayButton ||
      this.sliderAutoplayButton.contains(event.target)
    if (!this.autoplayButtonIsSetToPlay || focusedOnAutoplayButton) return
    this.play()
  }

  focusInHandling(event) {
    const focusedOnAutoplayButton =
      event.target === this.sliderAutoplayButton ||
      this.sliderAutoplayButton.contains(event.target)
    if (focusedOnAutoplayButton && this.autoplayButtonIsSetToPlay) {
      this.play()
    } else if (this.autoplayButtonIsSetToPlay) {
      this.pause()
    }
  }

  play() {
    this.slider.setAttribute('aria-live', 'off')
    clearInterval(this.autoplay)
    this.autoplay = setInterval(
      this.autoRotateSlides.bind(this),
      this.autoplaySpeed
    )
  }

  pause() {
    this.slider.setAttribute('aria-live', 'polite')
    clearInterval(this.autoplay)
  }

  togglePlayButtonState(pauseAutoplay) {
    if (pauseAutoplay) {
      this.sliderAutoplayButton.classList.add('slideshow__autoplay--paused')
      this.sliderAutoplayButton.setAttribute(
        'aria-label',
        window.accessibilityStrings.playSlideshow
      )
    } else {
      this.sliderAutoplayButton.classList.remove('slideshow__autoplay--paused')
      this.sliderAutoplayButton.setAttribute(
        'aria-label',
        window.accessibilityStrings.pauseSlideshow
      )
    }
  }

  autoRotateSlides() {
    const slideScrollPosition =
      this.currentPage === this.sliderItems.length
        ? 0
        : this.slider.scrollLeft +
          this.slider.querySelector('.slideshow__slide').clientWidth
    this.slider.scrollTo({
      left: slideScrollPosition
    })
  }

  setSlideVisibility() {
    this.sliderItemsToShow.forEach((item, index) => {
      const linkElements = item.querySelectorAll('a')
      if (index === this.currentPage - 1) {
        if (linkElements.length)
          linkElements.forEach((button) => {
            button.removeAttribute('tabindex')
          })
        item.setAttribute('aria-hidden', 'false')
        item.removeAttribute('tabindex')
      } else {
        if (linkElements.length)
          linkElements.forEach((button) => {
            button.setAttribute('tabindex', '-1')
          })
        item.setAttribute('aria-hidden', 'true')
        item.setAttribute('tabindex', '-1')
      }
    })
  }

  linkToSlide(event) {
    event.preventDefault()
    const slideScrollPosition =
      this.slider.scrollLeft +
      this.sliderFirstItemNode.clientWidth *
        (this.sliderControlLinksArray.indexOf(event.currentTarget) +
          1 -
          this.currentPage)
    this.slider.scrollTo({
      left: slideScrollPosition
    })
  }
}

customElements.define('slideshow-component', SlideshowComponent)

class VariantSelects extends HTMLElement {
  constructor() {
    super()
    this.addEventListener('change', this.onVariantChange)
  }

  onVariantChange() {
    this.updateOptions()
    this.updateMasterId()

    // Check if this is a paver product
    const quantityInput = document.querySelector('.quantity__input')
    const isPaver = quantityInput?.hasAttribute('data-paver')

    // If it's a paver, validate the quantity immediately
    if (isPaver) {
      const value = parseInt(quantityInput.value) || 0
      const min = parseInt(quantityInput.dataset.min) ?? 1
      const max = Number.isNaN(parseInt(quantityInput.dataset.max))
        ? Number.MAX_VALUE
        : parseInt(quantityInput.dataset.max)
      // Set initial disabled state based on quantity validation
      const shouldDisable = value < min || value > max
      this.toggleAddButton(shouldDisable, '', false)
    }

    this.updatePickupAvailability()
    this.updateQuickShipAvailability()
    this.removeErrorMessage()
    this.updateVariantStatuses()
    this.updateQtyUnit()

    if (!this.currentVariant) {
      this.toggleAddButton(true, '', true)
      this.setUnavailable()
      this.updateFormVisibility()
    } else {
      this.updateMedia()
      this.updateURL()
      this.updateVariantInput()
      this.renderProductInfo()
      this.updateShareUrl()
    }
  }

  updateFeaturedMedia() {
    const productImage = document.querySelector('#selected_image')
    if (productImage) {
      const previewImageSrc = this.currentVariant.featured_image?.src
      if (previewImageSrc) {
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
      document.querySelector('.out-of-stock').style.display = 'none'
      return
    }

    let check_against_inventory = true
    if (
      this.currentVariant.inventory_management != 'shopify' ||
      this.currentVariant.inventory_policy == 'continue'
    )
      check_against_inventory = false
    let quantity_rule_soldout = false

    if (
      this.currentVariant.quantity_rule?.min >
        this.currentVariant.inventory_quantity &&
      check_against_inventory
    )
      quantity_rule_soldout = true

    if (this.currentVariant.available == false || quantity_rule_soldout) {
      document.querySelector('.out-of-stock').style.display = 'block'
      document
        .querySelector('#k_id_variant_id')
        .setAttribute('value', `${this.currentVariant.name}`)
    } else {
      document.querySelector('.out-of-stock').style.display = 'none'
      return
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
    document
      .querySelector('.splide')
      .setAttribute('data-current', product_option)
    updateCarouselSlides()
  }
  updateOptions() {
    this.options = Array.from(
      this.querySelectorAll('select'),
      (select) => select.value
    )
  }

  updateMasterId() {
    this.currentVariant = this.getVariantData().find((variant) => {
      return !variant.options
        .map((option, index) => {
          return this.options[index] === option
        })
        .includes(false)
    })
  }

  updateMedia() {
    if (!this.currentVariant) return
    if (!this.currentVariant.featured_media) return

    const mediaGalleries = document.querySelectorAll(
      `[id^="MediaGallery-${this.dataset.section}"]`
    )
    mediaGalleries.forEach((mediaGallery) =>
      mediaGallery.setActiveMedia(
        `${this.dataset.section}-${this.currentVariant.featured_media.id}`,
        true
      )
    )

    const modalContent = document.querySelector(
      `#ProductModal-${this.dataset.section} .product-media-modal__content`
    )
    if (!modalContent) return
    const newMediaModal = modalContent.querySelector(
      `[data-media-id="${this.currentVariant.featured_media.id}"]`
    )
    modalContent.prepend(newMediaModal)
  }

  updateURL() {
    if (!this.currentVariant || this.dataset.updateUrl === 'false') return
    window.history.replaceState(
      {},
      '',
      `${this.dataset.url}?variant=${this.currentVariant.id}`
    )
  }

  updateShareUrl() {
    const shareButton = document.getElementById(`Share-${this.dataset.section}`)
    if (!shareButton || !shareButton.updateUrl) return
    shareButton.updateUrl(
      `${window.shopUrl}${this.dataset.url}?variant=${this.currentVariant.id}`
    )
  }

  updateVariantInput() {
    const productForms = document.querySelectorAll(
      `#product-form-${this.dataset.section}, #product-form-installment-${this.dataset.section}`
    )
    productForms.forEach((productForm) => {
      const input = productForm.querySelector('input[name="id"]')
      input.value = this.currentVariant.id
      input.dispatchEvent(new Event('change', { bubbles: true }))
    })
  }

  updateVariantStatuses() {
    const selectedOptionOneVariants = this.variantData.filter(
      (variant) => this.querySelector(':checked').value === variant.option1
    )
    const inputWrappers = [...this.querySelectorAll('.product-form__input')]
    inputWrappers.forEach((option, index) => {
      if (index === 0) return
      const optionInputs = [
        ...option.querySelectorAll('input[type="radio"], option')
      ]
      const previousOptionSelected =
        inputWrappers[index - 1].querySelector(':checked').value
      const availableOptionInputsValue = selectedOptionOneVariants
        .filter(
          (variant) =>
            variant.available &&
            variant[`option${index}`] === previousOptionSelected
        )
        .map((variantOption) => variantOption[`option${index + 1}`])
      this.setInputAvailability(optionInputs, availableOptionInputsValue)
    })
  }

  setInputAvailability(listOfOptions, listOfAvailableOptions) {
    listOfOptions.forEach((input) => {
      if (listOfAvailableOptions.includes(input.getAttribute('value'))) {
        input.innerText = input.getAttribute('value')
      } else {
        input.innerText = window.variantStrings.unavailable_with_option.replace(
          '[value]',
          input.getAttribute('value')
        )
      }
    })
  }

  updatePickupAvailability() {
    const pickUpAvailability = document.querySelector('pickup-availability')
    if (!pickUpAvailability) return

    if (this.currentVariant && this.currentVariant.available) {
      pickUpAvailability.fetchAvailability(this.currentVariant.id)
    } else {
      pickUpAvailability.removeAttribute('available')
      pickUpAvailability.innerHTML = ''
    }
  }

  updateQuickShipAvailability() {
    const quickShipAvailability = document.querySelector(
      'quickship-availability'
    )
    const quickShipText = document.querySelector('quickship-text')
    if (!quickShipAvailability) return
    if (this.currentVariant && this.currentVariant.available) {
      // Check if the current variant has quickship property
      const isQuickShip = this.currentVariant.quick_ship || false

      quickShipAvailability.setAvailability(isQuickShip)
      if (quickShipText) {
        quickShipText.setVisibility(isQuickShip)
      }
    } else {
      quickShipAvailability.removeAttribute('available')
      if (quickShipText) {
        quickShipText.setVisibility(false)
      }
    }
  }

  removeErrorMessage() {
    const section = this.closest('section')
    if (!section) return

    const productForm = section.querySelector('product-form')
    if (productForm) productForm.handleErrorMessage()
  }

  updateQtyUnit() {
    const section = this.closest('section')
    if (!section || !this.currentVariant) return

    const quantityInput = section.querySelector('.quantity__input')
    const currentQty = quantityInput.value
    // Only reset to 1 if there's no current quantity
    if (!currentQty) {
      quantityInput.value = 1
    }
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

    // section.querySelector('.quantity__input').value = 1
  }

  renderProductInfo() {
    const requestedVariantId = this.currentVariant.id
    const sectionId = this.dataset.originalSection
      ? this.dataset.originalSection
      : this.dataset.section

    // Check if this is a paver product and get initial validation state
    const quantityInput = document.querySelector('.quantity__input')
    const isPaver = quantityInput?.hasAttribute('data-paver')
    let initialShouldDisable = false

    if (isPaver) {
      const value = parseInt(quantityInput.value) || 0
      const min = parseInt(quantityInput.dataset.min) ?? 1
      const max = Number.isNaN(parseInt(quantityInput.dataset.max))
        ? Number.MAX_VALUE
        : parseInt(quantityInput.dataset.max)
      initialShouldDisable = value < min || value > max
    }

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
        if (this.currentVariant.id !== requestedVariantId) return

        const html = new DOMParser().parseFromString(responseText, 'text/html')
        const destination = document.getElementById(
          `price-${this.dataset.section}`
        )
        const source = html.getElementById(
          `price-${
            this.dataset.originalSection
              ? this.dataset.originalSection
              : this.dataset.section
          }`
        )
        const skuSource = html.getElementById(
          `Sku-${
            this.dataset.originalSection
              ? this.dataset.originalSection
              : this.dataset.section
          }`
        )
        const skuDestination = document.getElementById(
          `Sku-${this.dataset.section}`
        )
        const inventorySource = html.getElementById(
          `Inventory-${
            this.dataset.originalSection
              ? this.dataset.originalSection
              : this.dataset.section
          }`
        )
        const inventoryDestination = document.getElementById(
          `Inventory-${this.dataset.section}`
        )

        if (source && destination) destination.innerHTML = source.innerHTML
        if (inventorySource && inventoryDestination)
          inventoryDestination.innerHTML = inventorySource.innerHTML
        if (skuSource && skuDestination) {
          skuDestination.innerHTML = skuSource.innerHTML
          skuDestination.classList.toggle(
            'visibility-hidden',
            skuSource.classList.contains('visibility-hidden')
          )
        }

        const price = document.getElementById(`price-${this.dataset.section}`)

        if (price) price.classList.remove('visibility-hidden')

        if (inventoryDestination)
          inventoryDestination.classList.toggle(
            'visibility-hidden',
            inventorySource.innerText === ''
          )

        const addButtonUpdated = html.getElementById(
          `ProductSubmitButton-${sectionId}`
        )

        // For paver products, respect both the quantity validation and server response
        let shouldDisable = initialShouldDisable
        let buttonText = ''

        if (isPaver) {
          shouldDisable =
            shouldDisable ||
            (addButtonUpdated
              ? addButtonUpdated.hasAttribute('disabled')
              : true)
          // Only pass "Sold out" text if the variant itself is unavailable
          if (!this.currentVariant.available) {
            buttonText = window.variantStrings.soldOut
          }
        } else {
          buttonText = window.variantStrings.soldOut
        }

        this.toggleAddButton(shouldDisable, buttonText)

        const sampleButtonUpdated = html.getElementById(
          `SampleOrderButton-${sectionId}`
        )

        const sampleButton = document.getElementById(
          `SampleOrderButton-${sectionId}`
        )
        if (sampleButton) {
          if (!sampleButtonUpdated) {
            sampleButton.style.display = 'none'
          } else {
            sampleButton.setAttribute(
              'data-value',
              sampleButtonUpdated.getAttribute('data-value')
            )
            sampleButton.innerHTML = sampleButtonUpdated.innerHTML
            sampleButton.disabled = sampleButtonUpdated.hasAttribute('disabled')
          }
        }

        this.updateFormVisibility()
        this.updateVariantMetafields(html)
        publish(PUB_SUB_EVENTS.variantChange, {
          data: {
            sectionId,
            html,
            variant: this.currentVariant
          }
        })
      })
  }

  updateVariantMetafields(html) {
    const destination = document.getElementById(
      `Quantity-${this.dataset.section}`
    )
    const source = html.getElementById(
      `Quantity-${
        this.dataset.originalSection
          ? this.dataset.originalSection
          : this.dataset.section
      }`
    )
    var sourcePalletQty = source.getAttribute('data-pallet-qty')
    var destinationPalletQty = destination.getAttribute('data-pallet-qty')
    sourcePalletQty = parseInt(sourcePalletQty)
    destinationPalletQty = parseInt(destinationPalletQty)
    if (sourcePalletQty > 1 || destinationPalletQty > 1) {
      destination.setAttribute('data-pallet-qty', sourcePalletQty)
      // destination.setAttribute('min',sourcePalletQty);
      // destination.setAttribute('data-min',sourcePalletQty);
      // destination.setAttribute('step',sourcePalletQty);
      // destination.setAttribute('value',sourcePalletQty);
      // destination.value = sourcePalletQty;
      // console.log(sourcePalletQty);
      var event = new Event('change')
      destination.dispatchEvent(event)
    }
  }

  /**
   * Toggles the state and text of the Add to Cart button.
   *
   * @param {boolean} [disable=true] - Whether to disable the button
   * @param {string} text - Text to display on the button (if empty, preserves existing text)
   * @param {boolean} [modifyClass=true] - Whether to modify button classes
   *
   * @description
   * This method manages the Add to Cart button state by:
   * - Enabling/disabling the button
   * - Updating button text (if provided)
   * - For paver products: shows price calculation
   * - For non-paver products: shows standard text
   */
  toggleAddButton(disable = true, text, modifyClass = true) {
    const productForm = document.getElementById(
      `product-form-${this.dataset.section}`
    )
    if (!productForm) return
    const addButton = productForm.querySelector('[name="add"]')
    const addButtonText = productForm.querySelector('[name="add"] > span')
    if (!addButton) return

    // Check if this is a paver product
    const quantityInput = document.querySelector('.quantity__input')
    const isPaver = quantityInput?.hasAttribute('data-paver')

    if (disable) {
      addButton.setAttribute('disabled', 'disabled')
      // Only update text if provided and either:
      // 1. It's a non-paver product, or
      // 2. It's a specific message (like "Sold out")
      if (text && (!isPaver || text === window.variantStrings.soldOut)) {
        addButtonText.textContent = text
      }
    } else {
      addButton.removeAttribute('disabled')
      const currentPrice = document
        .getElementById(`price-${this.dataset.section}`)
        .querySelector('.price__container')
      if (currentPrice) {
        const basePrice =
          parseFloat(
            currentPrice
              .querySelector('.price-item--regular')
              .getAttribute('data-price')
          ) || 0
        const quantity = parseInt(quantityInput?.value) || 1
        const totalPrice = ((basePrice * quantity) / 100).toFixed(2)
        addButtonText.innerHTML = `<span>${window.variantStrings.addToCart}</span> <span> - </span> <span>$${totalPrice}</span>`
      }
    }

    if (!modifyClass) return
  }

  setUnavailable() {
    const button = document.getElementById(
      `product-form-${this.dataset.section}`
    )
    const addButton = button.querySelector('[name="add"]')
    const addButtonText = button.querySelector('[name="add"] > span')
    const price = document.getElementById(`price-${this.dataset.section}`)
    const inventory = document.getElementById(
      `Inventory-${this.dataset.section}`
    )
    const sku = document.getElementById(`Sku-${this.dataset.section}`)

    if (!addButton) return
    addButtonText.textContent = window.variantStrings.unavailable
    if (price) price.classList.add('visibility-hidden')
    if (inventory) inventory.classList.add('visibility-hidden')
    if (sku) sku.classList.add('visibility-hidden')
  }

  getVariantData() {
    this.variantData =
      this.variantData ||
      JSON.parse(this.querySelector('[type="application/json"]').textContent)
    return this.variantData
  }
}

customElements.define('variant-selects', VariantSelects)

class VariantRadios extends VariantSelects {
  constructor() {
    super()
    this.querySelectorAll('input[type="radio"]').forEach((radio) => {
      radio.addEventListener('change', () => {
        this.onVariantChange()
      })
    })
  }

  setInputAvailability(listOfOptions, listOfAvailableOptions) {
    listOfOptions.forEach((input) => {
      if (listOfAvailableOptions.includes(input.getAttribute('value'))) {
        input.classList.remove('disabled')
      } else {
        input.classList.add('disabled')
      }
    })
  }

  updateOptions() {
    const fieldsets = Array.from(this.querySelectorAll('fieldset'))
    this.options = fieldsets.map((fieldset) => {
      return Array.from(fieldset.querySelectorAll('input')).find(
        (radio) => radio.checked
      ).value
    })

    // // Check if current selection is a paver
    // const isPaver = this.options[0] === 'Paver';
    // const quantityInput = document.querySelector('.quantity__input');

    // if (isPaver) {
    //   quantityInput?.setAttribute('data-paver', '');
    // } else {
    //   quantityInput?.removeAttribute('data-paver');
    // }
  }
}

customElements.define('variant-radios', VariantRadios)

class ProductRecommendations extends HTMLElement {
  constructor() {
    super()
  }

  connectedCallback() {
    const handleIntersection = (entries, observer) => {
      if (!entries[0].isIntersecting) return
      observer.unobserve(this)

      fetch(this.dataset.url)
        .then((response) => response.text())
        .then((text) => {
          const html = document.createElement('div')
          html.innerHTML = text
          const recommendations = html.querySelector('product-recommendations')

          if (recommendations && recommendations.innerHTML.trim().length) {
            this.innerHTML = recommendations.innerHTML
          }

          if (
            !this.querySelector('slideshow-component') &&
            this.classList.contains('complementary-products')
          ) {
            this.remove()
          }

          if (html.querySelector('.grid__item')) {
            this.classList.add('product-recommendations--loaded')
          }
        })
        .catch((e) => {
          console.error(e)
        })
    }

    new IntersectionObserver(handleIntersection.bind(this), {
      rootMargin: '0px 0px 400px 0px'
    }).observe(this)
  }
}

customElements.define('product-recommendations', ProductRecommendations)

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

VideoRatio()

function VideoRatio() {
  var videos = [].slice.call(
    document.querySelectorAll(
      '.video-ratio:not(.for-modal) iframe, .video-ratio:not(.for-modal) video'
    )
  )
  window.addEventListener('load', initRatio)
  window.addEventListener('resize', initRatio)
  window.addEventListener('orientationChange', initRatio)
  function initRatio() {
    var winWdth = window.innerWidth,
      ratio = 0.56
    if (videos.length) {
      videos.forEach(function (video) {
        if (typeof video.getAttribute('data-video-ratio') !== 'undefined') {
          ratio = video.getAttribute('data-video-ratio')
        }
        var videoPar = video.closest('div'),
          videoParHght = videoPar.offsetHeight,
          cssHght = videoParHght,
          cssWdth = cssHght / ratio
        if (cssWdth < winWdth) {
          var cssWdth = winWdth,
            cssHght = cssWdth * ratio
        }
        video.setAttribute(
          'style',
          'width: ' +
            cssWdth +
            'px !important;height: ' +
            cssHght +
            'px !important;'
        )
      })
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
    imageLocation = document.querySelector('.hovered-item__image')

  if (titleLocation) {
    changeFeaturedFeedImage(firstItem)

    items.forEach(function (item, index) {
      item.addEventListener('mouseenter', function () {
        changeFeaturedFeedImage(this)
      })
    })
  }

  function changeFeaturedFeedImage(cardWrapper) {
    var ttl = cardWrapper.querySelector('.card > .card__content h3').innerText,
      img = cardWrapper.querySelector('.card > .card__inner').cloneNode(true)

    titleLocation.innerHTML = ''
    imageLocation.innerHTML = ''

    titleLocation.innerHTML = ttl
    imageLocation.innerHTML = img.outerHTML
    imageLocation.querySelector('.card__content').remove()
  }
}

function feedDisplay(argument) {
  const feedTriggers = document.querySelectorAll('.feed--view-type a'),
    feed = document.querySelector('.feed-view'),
    activeClass = 'current'

  feedTriggers.forEach(function (feedTrigger, index) {
    feedTrigger.addEventListener('click', function (event) {
      toggleView(this)
    })
  })

  function toggleView(element) {
    event.preventDefault()

    feedTriggers.forEach(function (feedTrigger, index) {
      var triggerType = feedTrigger.getAttribute('data-type')
      feedTrigger.classList.remove(activeClass)
      if (feed.classList.contains(triggerType)) {
        feed.classList.remove(triggerType)
      }
    })

    element.classList.add(activeClass)
    feed.classList.add(element.getAttribute('data-type'))
  }
}

function scrollTo(to, duration) {
  if (!to) return false
  window.scroll({
    behavior: 'smooth',
    left: 0,
    top: to.offsetTop
  })
}

function anchorScrolls(argument) {
  var anchorLinks = document.querySelectorAll('[href^="#"]'),
    thisHash = window.location.hash
  anchorLinks.forEach(function (anchorLink, index) {
    anchorLink.addEventListener('click', (event) => {
      event.preventDefault()
      scrollTo(
        document.getElementById(
          event.target.getAttribute('href').replace('#', '')
        ),
        500
      )
    })
  })
  if (thisHash) {
    history.pushState(thisHash, '', window.location.pathname) // removes hash from href
    scrollTo(document.getElementById(thisHash.replace('#', '')), 500)
  }
}

document.addEventListener('DOMContentLoaded', function () {
  anchorScrolls()

  featuredFeedImage()

  feedDisplay()
})

// Accordian
$('#tabs-select').on('change', function () {
  var url = $(this).val() // get selected value
  if (url) {
    // require a URL
    // window.location = url; // redirect
    console.log($('a[href="' + url + '"]'))
    // $('a[href="' + url + '"]').trigger('click');
    document.querySelector(url).scrollIntoView({
      behavior: 'smooth'
    })
  }
  return false
})

// sidebar links
$('.sidebar-link').on('click  touch', function () {
  // body...
  $('.sidebar-link').removeClass('active')
  $(this).addClass('active')
})
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
      : actTab[0].getBoundingClientRect().top + window.scrollY

  // console.log($thsPar)
  // console.log(clckdIndx)
  // console.log($cont)
  if (!!clearItem && !!actTab) {
    actTabTop = actTabTop + clearItem.outerHeight(true) + 15
  }

  if (!justClicked) {
    justClicked = true
    if (isOpen) {
      removeClasses()
      openClose()
      // console.log('close')
    } else {
      // console.log('open')
      removeClasses()
      addClasses()
      openClose(true)
      // mobScroll();
    }
    setTimeout(function () {
      justClicked = false
    }, justClickedDelay)
  }

  function mobScroll() {
    if (winWidth < 750) {
      setTimeout(function () {
        console.log(openTabDist)
        $([document.documentElement, document.body]).animate(
          {
            scrollTop: openTabDist
          },
          animTime
        )
      }, animTime * 2.5)
    }
  }

  function removeClasses() {
    $thsPar.find(btn + ' ' + ttlTxt).removeClass(active)
    $thsPar.find(btn + ' ' + imgItm).removeClass(active)
  }

  function addClasses() {
    $thsTtl.addClass(active)
    $thsImg.addClass(active)
  }

  function zeroHght() {
    $thsPar.find(cont).stop().animate({ height: 0 }, animTime)
  }

  function setHght() {
    $thsPar
      .find(cont)
      .eq(clckdIndx)
      .stop()
      .animate({ height: inrChldHght }, animTime)
  }

  function openClose(dir) {
    if (dir == 'open' || dir == true) {
      zeroHght()
      setHght()
    } else {
      setHght()
      zeroHght()
    }
  }
})

// Homepage button click handler
document.addEventListener('DOMContentLoaded', function () {
  var shopButton = document.getElementById('shop_click')

  if (shopButton) {
    shopButton.addEventListener('click', function () {
      // Ensure this only runs on mobile
      if (window.innerWidth <= 768) {
        openMenuDrawer()
      }
    })
  }
})

function openMenuDrawer() {
  const menuDrawerElement = document.querySelector('menu-drawer')

  if (menuDrawerElement) {
    const mainDetailsToggle = menuDrawerElement.querySelector('details')
    if (mainDetailsToggle) {
      const summaryElement = mainDetailsToggle.querySelector('summary')
      if (summaryElement) {
        summaryElement.click()
      }
    }
  }
}

class QuickShipAvailability extends HTMLElement {
  constructor() {
    super()
  }

  setAvailability(isQuickShip) {
    if (isQuickShip) {
      this.setAttribute('available', '')
    } else {
      this.removeAttribute('available')
    }
  }
}

customElements.define('quickship-availability', QuickShipAvailability)

class QuickShipText extends HTMLElement {
  constructor() {
    super()
  }

  setVisibility(isVisible) {
    if (isVisible) {
      this.style.display = 'block'
    } else {
      this.style.display = 'none'
    }
  }
}

customElements.define('quickship-text', QuickShipText)
