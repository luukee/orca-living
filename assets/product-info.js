if (!customElements.get('product-info')) {
  customElements.define(
    'product-info',
    class ProductInfo extends HTMLElement {
      constructor() {
        super()
        this.input = this.querySelector('.quantity__input')
        this.currentVariant = this.querySelector('.product-variant-id')
        this.variantSelects = this.querySelector('variant-radios')
        this.submitButton = this.querySelector('[type="submit"]')
      }

      cartUpdateUnsubscriber = undefined
      variantChangeUnsubscriber = undefined

      connectedCallback() {
        if (!this.input) return
        this.quantityForm = this.querySelector('.product-form__quantity')
        if (!this.quantityForm) return
        this.setQuantityBoundries()
        if (!this.dataset.originalSection) {
          this.cartUpdateUnsubscriber = subscribe(
            PUB_SUB_EVENTS.cartUpdate,
            this.fetchQuantityRules.bind(this)
          )
        }
        this.variantChangeUnsubscriber = subscribe(
          PUB_SUB_EVENTS.variantChange,
          (event) => {
            const sectionId = this.dataset.originalSection
              ? this.dataset.originalSection
              : this.dataset.section
            if (event.data.sectionId !== sectionId) return
            this.updateQuantityRules(event.data.sectionId, event.data.html)
            this.setQuantityBoundries()
            this.syncPaverQuantityFromLiveRules(event.data.variant)
            // Re-run after other handlers so quantity doesn’t revert to 1 on 3rd+ click
            setTimeout(() => {
              this.syncPaverQuantityFromLiveRules(event.data.variant)
            }, 50)
          }
        )
      }

      disconnectedCallback() {
        if (this.cartUpdateUnsubscriber) {
          this.cartUpdateUnsubscriber()
        }
        if (this.variantChangeUnsubscriber) {
          this.variantChangeUnsubscriber()
        }
      }

      setQuantityBoundries() {
        const data = {
          cartQuantity: this.input.dataset.cartQuantity
            ? parseInt(this.input.dataset.cartQuantity)
            : 0,
          min: this.input.dataset.min ? parseInt(this.input.dataset.min) : 1,
          max: this.input.dataset.max ? parseInt(this.input.dataset.max) : null,
          step: this.input.step ? parseInt(this.input.step) : 1
        }

        let min = data.min
        const max = data.max === null ? data.max : data.max - data.cartQuantity
        if (max !== null) min = Math.min(min, max)
        if (data.cartQuantity >= data.min) min = Math.min(min, data.step)

        this.input.min = min
        this.input.max = max

        if (
          this.input.hasAttribute('data-paver') &&
          (parseInt(this.input.value, 10) || 0) < min
        ) {
          this.input.value = min
        }

        if (min == 0) {
          this.submitButton.setAttribute('disabled', 'true')
        }

        publish(PUB_SUB_EVENTS.quantityUpdate, undefined)
      }

      fetchQuantityRules() {
        if (!this.currentVariant || !this.currentVariant.value) return
        this.querySelector(
          '.quantity__rules-cart .loading-overlay'
        ).classList.remove('hidden')
        fetch(
          `${this.dataset.url}?variant=${this.currentVariant.value}&section_id=${this.dataset.section}`
        )
          .then((response) => {
            return response.text()
          })
          .then((responseText) => {
            const html = new DOMParser().parseFromString(
              responseText,
              'text/html'
            )
            this.updateQuantityRules(this.dataset.section, html)
            this.setQuantityBoundries()
          })
          .catch((e) => {
            console.error(e)
          })
          .finally(() => {
            this.querySelector(
              '.quantity__rules-cart .loading-overlay'
            ).classList.add('hidden')
          })
      }

      /**
       * For paver inputs, sync quantity value/min from the live form's
       * data-variant-quantity-rules so we don't get wrong values from fetched HTML.
       */
      syncPaverQuantityFromLiveRules(variant) {
        if (
          !this.input?.hasAttribute('data-paver') ||
          !variant?.id ||
          !this.quantityForm
        )
          return
        const rulesJson = this.quantityForm.getAttribute(
          'data-variant-quantity-rules'
        )
        if (!rulesJson) return
        let rules
        try {
          rules = JSON.parse(rulesJson) || null
        } catch {
          return
        }
        const rule = rules?.[String(variant.id)]
        if (!rule) return
        const min = rule.min
        this.input.setAttribute('data-min', String(min))
        this.input.min = min
        if (rule.max != null) {
          this.input.setAttribute('data-max', String(rule.max))
          this.input.max = rule.max
        } else {
          this.input.removeAttribute('data-max')
          this.input.removeAttribute('max')
        }
        const step = rule.step ?? min
        this.input.step = step
        const val = parseInt(this.input.value, 10) || min
        this.input.value = val < min ? min : val
        publish(PUB_SUB_EVENTS.quantityUpdate, undefined)
      }

      updateQuantityRules(sectionId, html) {
        const quantityFormUpdated = html.getElementById(
          `Quantity-Form-${sectionId}`
        )
        const selectors = [
          '.quantity__input',
          '.quantity__rules',
          '.quantity__label'
        ]
        for (let selector of selectors) {
          const current = this.quantityForm.querySelector(selector)
          const updated = quantityFormUpdated.querySelector(selector)
          if (!current || !updated) continue
          if (selector === '.quantity__input') {
            // For paver inputs, never copy data-min from fetched HTML (it can be wrong on 3rd+ click).
            // syncPaverQuantityFromLiveRules will set min/value from the live form’s rules.
            const isPaver = current.hasAttribute('data-paver')
            const attributes = isPaver
              ? ['data-cart-quantity', 'data-max', 'step', 'data-pallet-qty']
              : [
                  'data-cart-quantity',
                  'data-min',
                  'data-max',
                  'step',
                  'data-pallet-qty'
                ]
            for (let attribute of attributes) {
              const valueUpdated = updated.getAttribute(attribute)
              if (valueUpdated !== null)
                current.setAttribute(attribute, valueUpdated)
            }
            if (!isPaver) {
              const minAttr = current.getAttribute('data-min')
              if (minAttr) {
                const minVal = parseInt(minAttr, 10)
                if (Number.isFinite(minVal)) {
                  const serverValue = updated.getAttribute('value')
                  if (serverValue != null) {
                    const v = parseInt(serverValue, 10)
                    if (Number.isFinite(v) && v >= minVal) current.value = v
                  }
                  if ((parseInt(current.value, 10) || 0) < minVal)
                    current.value = minVal
                }
              }
            }
          } else {
            current.innerHTML = updated.innerHTML
          }
        }
      }
    }
  )
}
