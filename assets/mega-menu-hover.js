// Enhanced mega menu hover functionality
document.addEventListener('DOMContentLoaded', function() {
  const megaMenus = document.querySelectorAll('.mega-menu');
  
  megaMenus.forEach(function(megaMenu) {
    const summary = megaMenu.querySelector('summary');
    const content = megaMenu.querySelector('.mega-menu__content');
    
    if (!summary || !content) return;
    
    // Open on hover
    megaMenu.addEventListener('mouseenter', function() {
      megaMenu.setAttribute('open', '');
      summary.setAttribute('aria-expanded', 'true');
    });
    
    // Close when mouse leaves
    megaMenu.addEventListener('mouseleave', function() {
      megaMenu.removeAttribute('open');
      summary.setAttribute('aria-expanded', 'false');
    });
    
    // Also handle click for accessibility
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
  });
});
