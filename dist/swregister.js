if ('serviceWorker' in navigator) {
  // Delay registration until after the page has loaded, to ensure that
  // our precaching requests don't degrade the first visit experience.
  window.addEventListener('load', () => {
    navigator.serviceWorker && navigator.serviceWorker.register('/sw.js')
  })

  // If we're in a browser that also supports the BroadcastChannel API,
  // then listen for updates to precached resources.
  if (window.BroadcastChannel) {
    const precacheChannel = new window.BroadcastChannel('precache-updates')
    precacheChannel.addEventListener('message', event => {
      console.log(`precached resource updated: ${event.data.payload.updatedUrl}`)
      // If our /app-shell has been updated, then in this example, we
      // trigger a page reload. You can read about more advanced UX
      // patterns, like displaying a "toast" message, at
      // https://developers.google.com/web/fundamentals/instant-and-offline/offline-ux#network_connection_improves_or_is_restored
      if (event.data.payload.updatedUrl.endsWith('/app-shell')) {
        window.location.reload()
      }
    })
  }
} else {
  console.warn('Your browser do NOT support serviceWorker.')
}
