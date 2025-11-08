// assets/mega-menu-hover.js
const hoverMediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)')

document.addEventListener('DOMContentLoaded', function () {
  const megaMenus = document.querySelectorAll(
    'header-menu .mega-menu, .navigation-desktop header-menu .mega-menu'
  )

  megaMenus.forEach(function (megaMenu) {
    const summary = megaMenu.querySelector('summary')
    const content = megaMenu.querySelector('.mega-menu__content')
    const summaryUrl = summary?.dataset?.url || ''
    if (!summary) return

    let closeTimeout

    // Open mega menu on hover
    const openMegaMenu = () => {
      if (!hoverMediaQuery.matches) return
      clearTimeout(closeTimeout)
      megaMenu.setAttribute('open', '')
      summary.setAttribute('aria-expanded', 'true')
    }

    // Close mega menu after a delay
    const scheduleClose = () => {
      if (!hoverMediaQuery.matches) return
      clearTimeout(closeTimeout)
      closeTimeout = setTimeout(() => {
        megaMenu.removeAttribute('open')
        summary.setAttribute('aria-expanded', 'false')
      }, 200)
    }

    // Set aria-expanded attribute based on open state
    summary.setAttribute(
      'aria-expanded',
      megaMenu.hasAttribute('open') ? 'true' : 'false'
    )

    summary.addEventListener('mouseenter', openMegaMenu)
    // Clear timeout if mouse enters mega menu
    megaMenu.addEventListener('mouseenter', () => clearTimeout(closeTimeout))
    // Close mega menu if mouse leaves mega menu
    megaMenu.addEventListener('mouseleave', scheduleClose)

    if (content) {
      // Open mega menu if mouse enters content
      content.addEventListener('mouseenter', openMegaMenu)
      // Close mega menu if mouse leaves content
      content.addEventListener('mouseleave', scheduleClose)
    }

    // Handle click on summary
    summary.addEventListener('click', function (e) {
      const isKeyboardEvent = e.detail === 0

      if (hoverMediaQuery.matches && !isKeyboardEvent && summaryUrl) {
        window.location.href = summaryUrl
        return
      }

      e.preventDefault()

      if (megaMenu.hasAttribute('open')) {
        megaMenu.removeAttribute('open')
        summary.setAttribute('aria-expanded', 'false')
      } else {
        megaMenu.setAttribute('open', '')
        summary.setAttribute('aria-expanded', 'true')
      }
    })

    // Close mega menu if clicked outside
    document.addEventListener('click', function (e) {
      if (!megaMenu.contains(e.target) && megaMenu.hasAttribute('open')) {
        megaMenu.removeAttribute('open')
        summary.setAttribute('aria-expanded', 'false')
      }
    })
  })
})
