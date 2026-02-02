if (!customElements.get('media-gallery')) {
  customElements.define(
    'media-gallery',
    class MediaGallery extends HTMLElement {
      constructor() {
        super()
        this.elements = {
          liveRegion: this.querySelector('[id^="GalleryStatus"]'),
          viewer: this.querySelector('[id^="GalleryViewer"]'),
          thumbnails: this.querySelector('[id^="GalleryThumbnails"]')
        }
        this.mql = window.matchMedia('(min-width: 750px)')
        if (!this.elements.thumbnails) return

        this.elements.viewer.addEventListener(
          'slideChanged',
          debounce(this.onSlideChanged.bind(this), 500)
        )
        this.elements.thumbnails
          .querySelectorAll('[data-target]')
          .forEach((mediaToSwitch) => {
            mediaToSwitch
              .querySelector('button')
              .addEventListener(
                'click',
                this.setActiveMedia.bind(
                  this,
                  mediaToSwitch.dataset.target,
                  false
                )
              )
          })
        if (
          this.dataset.desktopLayout.includes('thumbnail') &&
          this.mql.matches
        )
          this.removeListSemantic()
      }

      onSlideChanged(event) {
        const thumbnail = this.elements.thumbnails.querySelector(
          `[data-target="${event.detail.currentElement.dataset.mediaId}"]`
        )
        this.setActiveThumbnail(thumbnail)
      }

      /**
       * Sets the active media in the gallery and optionally scrolls it into view.
       * @param {string} mediaId - data-media-id of the media element
       * @param {boolean} prepend - whether to prepend active media in DOM (e.g. variant change)
       * @param {{ skipScrollIntoView?: boolean }} [opts] - skipScrollIntoView: true when called from variant change to prevent page scroll
       */
      setActiveMedia(mediaId, prepend, opts = {}) {
        if (!this.elements || !this.elements.viewer) return
        const activeMedia = this.elements.viewer.querySelector(
          `[data-media-id="${mediaId}"]`
        )
        if (!activeMedia) return

        const skipScrollIntoView = !!opts.skipScrollIntoView

        // In stacked layout, keep all items visible; only ensure target is active and optionally scroll
        if (this.dataset.desktopLayout === 'stacked') {
          if (activeMedia.classList) activeMedia.classList.add('is-active')
          if (prepend && activeMedia.parentElement) {
            activeMedia.parentElement.prepend(activeMedia)
            if (this.elements.thumbnails) {
              const activeThumbnail = this.elements.thumbnails.querySelector(
                `[data-target="${mediaId}"]`
              )
              if (activeThumbnail && activeThumbnail.parentElement) {
                activeThumbnail.parentElement.prepend(activeThumbnail)
              }
            }
            if (this.elements.viewer.slider) this.elements.viewer.resetPages()
          }
          this.preventStickyHeader()
          window.setTimeout(() => {
            if (
              !skipScrollIntoView &&
              (!this.elements.thumbnails ||
                this.dataset.desktopLayout === 'stacked')
            ) {
              if (activeMedia.scrollIntoView)
                activeMedia.scrollIntoView({ behavior: 'smooth' })
            }
          })
          this.playActiveMedia(activeMedia)
          if (!this.elements.thumbnails) return
          const activeThumbnail = this.elements.thumbnails.querySelector(
            `[data-target="${mediaId}"]`
          )
          this.setActiveThumbnail(activeThumbnail)
          if (activeThumbnail && activeThumbnail.dataset) {
            this.announceLiveRegion(
              activeMedia,
              activeThumbnail.dataset.mediaPosition
            )
          }
          return
        }

        // Non-stacked: toggle visibility to a single active media
        this.elements.viewer
          .querySelectorAll('[data-media-id]')
          .forEach((element) => {
            if (element && element.classList)
              element.classList.remove('is-active')
          })
        if (activeMedia && activeMedia.classList)
          activeMedia.classList.add('is-active')

        if (prepend) {
          activeMedia.parentElement.prepend(activeMedia)
          if (this.elements.thumbnails) {
            const activeThumbnail = this.elements.thumbnails.querySelector(
              `[data-target="${mediaId}"]`
            )
            if (activeThumbnail && activeThumbnail.parentElement) {
              activeThumbnail.parentElement.prepend(activeThumbnail)
            }
          }
          if (this.elements.viewer.slider) this.elements.viewer.resetPages()
        }

        this.preventStickyHeader()
        window.setTimeout(() => {
          if (
            this.elements.thumbnails &&
            activeMedia &&
            activeMedia.parentElement
          ) {
            activeMedia.parentElement.scrollTo({ left: activeMedia.offsetLeft })
          }
          if (
            !skipScrollIntoView &&
            (!this.elements.thumbnails ||
              this.dataset.desktopLayout === 'stacked')
          ) {
            if (activeMedia && activeMedia.scrollIntoView) {
              activeMedia.scrollIntoView({ behavior: 'smooth' })
            }
          }
        })
        if (activeMedia) this.playActiveMedia(activeMedia)

        if (!this.elements.thumbnails) return
        const activeThumbnail = this.elements.thumbnails.querySelector(
          `[data-target="${mediaId}"]`
        )
        this.setActiveThumbnail(activeThumbnail)
        if (activeThumbnail && activeThumbnail.dataset) {
          this.announceLiveRegion(
            activeMedia,
            activeThumbnail.dataset.mediaPosition
          )
        }
      }

      setActiveThumbnail(thumbnail) {
        if (!this.elements.thumbnails || !thumbnail) return

        this.elements.thumbnails
          .querySelectorAll('button')
          .forEach((element) => element.removeAttribute('aria-current'))
        thumbnail.querySelector('button').setAttribute('aria-current', true)
        if (this.elements.thumbnails.isSlideVisible(thumbnail, 10)) return

        this.elements.thumbnails.slider.scrollTo({ left: thumbnail.offsetLeft })
      }

      announceLiveRegion(activeItem, position) {
        const image = activeItem.querySelector(
          '.product__modal-opener--image img'
        )
        if (!image) return
        image.onload = () => {
          this.elements.liveRegion.setAttribute('aria-hidden', false)
          this.elements.liveRegion.innerHTML =
            window.accessibilityStrings.imageAvailable.replace(
              '[index]',
              position
            )
          setTimeout(() => {
            this.elements.liveRegion.setAttribute('aria-hidden', true)
          }, 2000)
        }
        image.src = image.src
      }

      playActiveMedia(activeItem) {
        window.pauseAllMedia()
        const deferredMedia = activeItem.querySelector('.deferred-media')
        if (deferredMedia) deferredMedia.loadContent(false)
      }

      preventStickyHeader() {
        this.stickyHeader =
          this.stickyHeader || document.querySelector('sticky-header')
        if (!this.stickyHeader) return
        this.stickyHeader.dispatchEvent(new Event('preventHeaderReveal'))
      }

      removeListSemantic() {
        if (!this.elements.viewer.slider) return
        this.elements.viewer.slider.setAttribute('role', 'presentation')
        this.elements.viewer.sliderItems.forEach((slide) =>
          slide.setAttribute('role', 'presentation')
        )
      }
    }
  )
}
