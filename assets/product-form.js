/**
 * ProductForm Custom Element
 * 
 * A custom element that handles product form functionality including:
 * - Regular "Add to Cart" form submissions
 * - Sample product ordering
 * - Cart integration
 * - Loading states and error handling
 * 
 * Key Features:
 * - Handles both regular product variants and sample variants
 * - Manages loading states with spinners
 * - Integrates with cart drawer/notification
 * - Updates cart quantities in header
 * - Handles error states and messages
 * - Supports quick add modal functionality
 * 
 * Usage:
 * <product-form class="product-form">
 *   <form>
 *     <!-- Regular add to cart button -->
 *     <button type="submit" class="product-form__submit">Add to Cart</button>
 *     
 *     <!-- Optional sample button -->
 *     <button id="SampleOrderButton-{section_id}" 
 *             class="product-form__submit" 
 *             data-value="{variant_id}">
 *       Order Sample
 *     </button>
 *   </form>
 * </product-form>
 */

if (!customElements.get('product-form')) {
  customElements.define(
    'product-form',
    class ProductForm extends HTMLElement {
      /**
       * Initializes the product form component.
       * Sets up event listeners for form submission and sample button clicks.
       * Configures cart integration and button accessibility attributes.
       */
      constructor() {
        super();

        this.form = this.querySelector('form');
        this.sampleButton = this.querySelector('[id^=SampleOrderButton]');
        this.sampleButton?.addEventListener(
          'click',
          this.onSampleSubmitHandler.bind(this)
        );
        this.form.querySelector('[name=id]').disabled = false;
        this.querySelector('[type="submit"]')?.addEventListener('click', this.onSubmitHandler.bind(this));
        this.cart =
          document.querySelector('cart-notification') ||
          document.querySelector('cart-drawer');
        this.submitButtons = this.querySelectorAll('.product-form__submit');
        if (document.querySelector('cart-drawer'))
          this.submitButtons.forEach((btn) =>
            btn.setAttribute('aria-haspopup', 'dialog')
          );

        this.hideErrors = this.dataset.hideErrors === 'true';
      }

      /**
       * Sets all submit buttons to a loading state.
       * - Disables buttons to prevent multiple submissions
       * - Adds loading class for visual feedback
       * - Shows loading spinner if present
       */
      setToLoading() {
        this.submitButtons.forEach((btn) => {
          btn.setAttribute('aria-disabled', true);
          btn.classList.add('loading');
          const spinner = btn.querySelector('.loading-overlay__spinner');
          if (spinner) {
            spinner.classList.remove('hidden');
          }
        });
      }

      /**
       * Handles the AJAX request to add items to cart.
       * @param {Event} evt - The event that triggered the request
       * @param {FormData} formData - The form data to be sent
       * @param {Object} config - The fetch configuration object
       * @param {String} variantId - Optional variant ID for sample button case
       * 
       * Flow:
       * 1. Sends request to cart/add endpoint
       * 2. Handles success/error responses
       * 3. Updates cart UI and button states
       * 4. Shows error messages if needed
       * 5. Updates cart icon with new quantity
       */
      sendRequest(evt,formData,config,variantId = null) {
        // Get variant ID from formData or parameter
        const productVariantId = variantId || formData.get('id');
        
        fetch(`${routes.cart_add_url}`, config)
          .then((response) => response.json())
          .then((response) => {
            if (response.status) {
              publish(PUB_SUB_EVENTS.cartError, {
                source: 'product-form',
                productVariantId: productVariantId,
                errors: response.description,
                message: response.message,
              });
              this.handleErrorMessage(response.description);

              const soldOutMessage =
                evt.target.querySelector('.sold-out-message');
              if (!soldOutMessage) return;
              this.submitButtons.forEach((btn) => {
                btn.setAttribute('aria-disabled', true);
                const span = btn.querySelector('span');
                if (span) span.classList.add('hidden');
              });
              soldOutMessage.classList.remove('hidden');
              this.error = true;
              return;
            } else if (!this.cart) {
              window.location = window.routes.cart_url;
              return;
            }

            if (!this.error)
              publish(PUB_SUB_EVENTS.cartUpdate, {
                source: 'product-form',
                productVariantId: productVariantId,
              });
            this.error = false;
            const quickAddModal = this.closest('quick-add-modal');

            if(response.items && response.items.length > 0){
              response.items[0].sections = response.sections
              response = response.items[0]
              
              if (evt.target == this.sampleButton) {
                // Update button text if span structure exists, otherwise update button textContent
                const spanNested = evt.target.querySelector('span > span');
                if (spanNested) {
                  spanNested.textContent = 'Added to Cart';
                } else {
                  evt.target.textContent = 'Added to Cart';
                }
                evt.target.setAttribute('disabled',true)
              }
            }
            
            if (quickAddModal) {
              document.body.addEventListener(
                'modalClosed',
                () => {
                  setTimeout(() => {
                    this.cart.renderContents(response);
                  });
                },
                { once: true }
              );
              quickAddModal.hide(true);
            } else {
              this.cart.renderContents(response);
            }
          })
          .catch((e) => {
            console.error(e);
          })
          .finally(() => {
            this.submitButtons.forEach((btn) => {
              btn.classList.remove('loading');
              if (!this.error) btn.removeAttribute('aria-disabled');
              const spinner = btn.querySelector('.loading-overlay__spinner');
              if (spinner) {
                spinner.classList.add('hidden');
              }
            });
            if (this.cart && this.cart.classList.contains('is-empty'))
              this.cart.classList.remove('is-empty');
            this.updateCartIcon();
          });
      }

      /**
       * Handles sample button click events.
       * @param {Event} evt - The click event
       * 
       * Flow:
       * 1. Validates the sample variant ID exists
       * 2. Sets up loading state
       * 3. Creates request to add sample to cart
       * 4. Includes cart section updates if cart component exists
       */
      onSampleSubmitHandler(evt) {
        evt.preventDefault();
        const variantId = evt.target.getAttribute('data-value');
        if (variantId == null) return;
        if (evt.target.getAttribute('aria-disabled') === 'true') return;

        const config = fetchConfig('javascript');
        config.headers['X-Requested-With'] = 'XMLHttpRequest';

        this.handleErrorMessage();
        this.setToLoading();

        const formData = new FormData();
        const body = {items:[{ id: variantId, quantity:1 }]}
        if (this.cart) {
          body.sections = this.cart.getSectionsToRender().map((section) => section.id)
          body.sections_url = window.location.pathname
          this.cart.setActiveElement(document.activeElement);
        }
        // Note: formData.append line removed as it's not used with JSON body
        config.body = JSON.stringify(body);
        this.sendRequest(evt,formData,config,variantId)
      }

      /**
       * Handles regular form submission events.
       * @param {Event} evt - The submit event
       * 
       * Flow:
       * 1. Validates form is not disabled
       * 2. Sets up loading state
       * 3. Creates request with form data
       * 4. Includes cart section updates if cart component exists
       */
      onSubmitHandler(evt) {
        evt.preventDefault();
        if (evt.target.getAttribute('aria-disabled') === 'true') return;

        this.handleErrorMessage();
        this.setToLoading();

        const config = fetchConfig('javascript');
        config.headers['X-Requested-With'] = 'XMLHttpRequest';
        delete config.headers['Content-Type'];

        const formData = new FormData(this.form);
        if (this.cart) {
          formData.append(
            'sections',
            this.cart.getSectionsToRender().map((section) => section.id)
          );
          formData.append('sections_url', window.location.pathname);
          this.cart.setActiveElement(document.activeElement);
        }
        config.body = formData;
        this.sendRequest(evt,formData,config);
      }

      /**
       * Manages error message display for the form.
       * @param {string} errorMessage - The error message to display
       * 
       * Flow:
       * 1. Checks if errors should be hidden
       * 2. Finds or creates error message elements
       * 3. Toggles visibility based on error state
       * 4. Updates error message text if provided
       */
      handleErrorMessage(errorMessage = false) {
        if (this.hideErrors) return;

        this.errorMessageWrapper =
          this.errorMessageWrapper ||
          this.querySelector('.product-form__error-message-wrapper');
        if (!this.errorMessageWrapper) return;
        this.errorMessage =
          this.errorMessage ||
          this.errorMessageWrapper.querySelector(
            '.product-form__error-message'
          );

        this.errorMessageWrapper.toggleAttribute('hidden', !errorMessage);

        if (errorMessage) {
          this.errorMessage.textContent = errorMessage;
        }
      }

      /**
       * Updates the cart icon quantity in the header.
       * Fetches latest cart data and updates all cart quantity indicators.
       */
      updateCartIcon() {
        fetch(`${routes.cart_url}?section_id=custom-cart-counter`)
          .then((response) => response.text())
          .then((responseText) => {
            const header = document.querySelector('header');
            const html = new DOMParser().parseFromString(
              responseText,
              'text/html'
            );
            const sourceQty = html.querySelector('#itemCount').textContent;
            const cartItems = header.querySelectorAll('.menu-item__name-cart');

            cartItems.forEach(function (cartItem, index) {
              cartItem.querySelector('#itemCount').textContent = sourceQty;
            });
          })
          .catch((e) => {
            console.error(e);
          });
      }
    }
  );
}
