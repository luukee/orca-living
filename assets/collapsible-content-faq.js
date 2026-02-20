;(function () {
  var DURATION_MS = 300
  var FAQ_WRAPPER = '.collapsible-content-faq'
  var CONTENT = '.accordion__content'

  function animateClose(details, onDone) {
    var content = details.querySelector(CONTENT)
    if (!content) {
      if (onDone) onDone()
      return
    }
    content.classList.add('is-closing')
    function finish() {
      content.removeEventListener('transitionend', finish)
      details.removeAttribute('open')
      var sum = details.querySelector('summary')
      if (sum) sum.setAttribute('aria-expanded', 'false')
      if (onDone) onDone()
      requestAnimationFrame(function () {
        content.classList.remove('is-closing')
      })
    }
    content.addEventListener('transitionend', finish)
    // Fallback if transitionend doesn’t fire (e.g. disabled animations)
    setTimeout(finish, DURATION_MS + 50)
  }

  function initFaqSingleOpen() {
    if (document.body.dataset.faqSingleOpenInit) return
    document.body.dataset.faqSingleOpenInit = '1'

    // Single open: when one details opens, close others with animation (in tandem with new one opening)
    document.addEventListener(
      'toggle',
      function (e) {
        var details = e.target
        if (details.tagName !== 'DETAILS') return
        var wrapper = details.closest(FAQ_WRAPPER)
        if (!wrapper) return
        if (!details.hasAttribute('open')) return

        // Close previously open (animates 1fr → 0fr)
        wrapper.querySelectorAll('details[open]').forEach(function (other) {
          if (other !== details) animateClose(other)
        })

        // Force this one to animate open (0fr → 1fr): start at 0fr for one frame, then remove class
        var content = details.querySelector(CONTENT)
        if (content) {
          content.classList.add('is-opening')
          requestAnimationFrame(function () {
            requestAnimationFrame(function () {
              content.classList.remove('is-opening')
            })
          })
        }
      },
      true
    )

    // User closed current: prevent instant close, animate then remove open
    document.addEventListener(
      'click',
      function (e) {
        var summary = e.target.closest(FAQ_WRAPPER + ' details[open] summary')
        if (!summary) return
        var details = summary.parentElement
        e.preventDefault()
        animateClose(details)
      },
      true
    )
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFaqSingleOpen)
  } else {
    initFaqSingleOpen()
  }
})()
