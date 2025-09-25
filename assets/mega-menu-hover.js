// Consolidated mega menu functionality
document.addEventListener('DOMContentLoaded', function() {
  // Target both header and secondary navigation mega menus
  const megaMenus = document.querySelectorAll('header-menu .mega-menu, .navigation-desktop header-menu .mega-menu');
  
  megaMenus.forEach(function(megaMenu) {
    const summary = megaMenu.querySelector('summary');
    const content = megaMenu.querySelector('.mega-menu__content');
    
    if (!summary || !content) return;
    
    let closeTimeout;
    
    // Open on hover (summary element)
    summary.addEventListener('mouseenter', function() {
      // Clear any pending close timeout
      if (closeTimeout) {
        clearTimeout(closeTimeout);
        closeTimeout = null;
      }
      
      megaMenu.setAttribute('open', '');
      summary.setAttribute('aria-expanded', 'true');
    });
    
    // Close when mouse leaves the entire mega menu area (with small delay)
    megaMenu.addEventListener('mouseleave', function() {
      closeTimeout = setTimeout(function() {
        megaMenu.removeAttribute('open');
        summary.setAttribute('aria-expanded', 'false');
      }, 150);
    });
    
    // Cancel close if mouse re-enters the mega menu
    megaMenu.addEventListener('mouseenter', function() {
      if (closeTimeout) {
        clearTimeout(closeTimeout);
        closeTimeout = null;
      }
    });
    
    // Handle click for accessibility (mobile/touch devices)
    summary.addEventListener('click', function(e) {
      e.preventDefault();
      
      if (megaMenu.hasAttribute('open')) {
        megaMenu.removeAttribute('open');
        summary.setAttribute('aria-expanded', 'false');
      } else {
        megaMenu.setAttribute('open', '');
        summary.setAttribute('aria-expanded', 'true');
      }
    });
    
    // Close mega menu when clicking outside
    document.addEventListener('click', function(e) {
      if (!megaMenu.contains(e.target) && megaMenu.hasAttribute('open')) {
        megaMenu.removeAttribute('open');
        summary.setAttribute('aria-expanded', 'false');
      }
    });
  });
});
