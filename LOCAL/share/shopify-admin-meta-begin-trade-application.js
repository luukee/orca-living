// Step 1. Initialize the JavaScript pixel SDK (make sure to exclude HTML)
!(function (f, b, e, v, n, t, s) {
  if (f.fbq) return
  n = f.fbq = function () {
    n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments)
  }
  if (!f._fbq) f._fbq = n
  n.push = n
  n.loaded = !0
  n.version = '2.0'
  n.queue = []
  t = b.createElement(e)
  t.async = !0
  t.src = v
  s = b.getElementsByTagName(e)[0]
  s.parentNode.insertBefore(t, s)
})(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js')

// the pixel ID provided by third-party
fbq('init', '881532870028338')

// Step 2. Subscribe to customer events with analytics.subscribe(), and add tracking
// Only track the extra click event coming from the theme publish()
analytics.subscribe('begin_application_clicked', (event) => {
  fbq('trackCustom', 'BeginApplicationClicked', {
    href: event.customData?.href,
    label: event.customData?.label
  })
})
