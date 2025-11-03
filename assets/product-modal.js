if (!customElements.get('product-modal')) {
  customElements.define('product-modal', class ProductModal extends ModalDialog {
    constructor() {
      super();
      this.initialZoom = null;
    }

    hide() {
      this.resetZoom();
      super.hide();
    }

    show(opener) {
      this.storeZoomState();
      super.show(opener);
      this.showActiveMedia();
    }

    storeZoomState() {
      // Store the current viewport zoom level
      if (window.visualViewport) {
        this.initialZoom = window.visualViewport.scale;
      }
    }
    
    resetZoom() {
      // Reset zoom using Visual Viewport API if available
      if (window.visualViewport && this.initialZoom !== null) {
        // Force a reflow to reset zoom
        document.body.style.transform = 'scale(1)';
        document.documentElement.style.transform = 'scale(1)';
        
        // Use a small delay to ensure zoom resets
        setTimeout(() => {
          document.body.style.transform = '';
          document.documentElement.style.transform = '';
        }, 100);
      }
    }
    
    showActiveMedia() {
      this.querySelectorAll(`[data-media-id]:not([data-media-id="${this.openedBy.getAttribute("data-media-id")}"])`).forEach((element) => {
          element.classList.remove('active');
        }
      )
      const activeMedia = this.querySelector(`[data-media-id="${this.openedBy.getAttribute("data-media-id")}"]`);
      const activeMediaTemplate = activeMedia.querySelector('template');
      const activeMediaContent = activeMediaTemplate ? activeMediaTemplate.content : null;
      activeMedia.classList.add('active');
      activeMedia.scrollIntoView();

      const container = this.querySelector('[role="document"]');
      container.scrollLeft = (activeMedia.width - container.clientWidth) / 2;

      if (activeMedia.nodeName == 'DEFERRED-MEDIA' && activeMediaContent && activeMediaContent.querySelector('.js-youtube'))
        activeMedia.loadContent();
    }
  });
}
