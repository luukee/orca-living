if (!customElements.get('product-form')) {
  customElements.define(
    'product-form',
    class ProductForm extends HTMLElement {
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

      sendRequest(evt,formData,config) {
        fetch(`${routes.cart_add_url}`, config)
          .then((response) => response.json())
          .then((response) => {
            if (response.status) {
              publish(PUB_SUB_EVENTS.cartError, {
                source: 'product-form',
                productVariantId: formData.get('id'),
                errors: response.description,
                message: response.message,
              });
              this.handleErrorMessage(response.description);

              const soldOutMessage =
                evt.target.querySelector('.sold-out-message');
              if (!soldOutMessage) return;
              this.submitButtons.forEach((btn) => {
                btn.setAttribute('aria-disabled', true);
                btn.querySelector('span').classList.add('hidden');
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
                productVariantId: formData.get('id'),
              });
            this.error = false;
            const quickAddModal = this.closest('quick-add-modal');

            if(response.items){
              response.items[0].sections = response.sections
              response = response.items[0]
              
              if (evt.target == this.sampleButton) {
                evt.target.querySelector('span > span').textContent = 'Added to Cart'
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

      onSampleSubmitHandler(evt) {
        evt.preventDefault();
        if (evt.target.getAttribute('data-value') == null) return;
        if (evt.target.getAttribute('aria-disabled') === 'true') return;

        const config = fetchConfig('javascript');
        config.headers['X-Requested-With'] = 'XMLHttpRequest';

        this.handleErrorMessage();
        this.setToLoading();

        const formData = new FormData();
        const body = {items:[{ id: evt.target.getAttribute('data-value'),quantity:1 }]}
        if (this.cart) {
          body.sections = this.cart.getSectionsToRender().map((section) => section.id)
          body.sections_url = window.location.pathname
          this.cart.setActiveElement(document.activeElement);
        }
        formData.append('items', [{ id: evt.target.getAttribute('data-value'),quantity:1 }]);
        config.body = JSON.stringify(body);
        this.sendRequest(evt,formData,config)
      }

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
