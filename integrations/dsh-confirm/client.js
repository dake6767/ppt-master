window.__ModuleLoader__.load({
  id: 'dsh-ppt-master-confirm',
  factory: () => {
    function resolveConfirmationLink(event) {
      if (event.defaultPrevented || (event.button !== 0 && event.button !== 1)) return
      const anchor = event.target?.closest?.('a[href]')
      if (!anchor) return
      const code = /^http:\/\/127\.0\.0\.1(?::[0-9]{1,5})?\/#ppt-master-confirm=([a-f0-9]{24})$/u.exec(anchor.href)?.[1]
      if (!code) return
      // Keep the normal link action, including keyboard and modified clicks.
      anchor.href = new URL(`ppt-master-confirm/${code}/`, document.baseURI).href
      anchor.target = '_blank'
      anchor.rel = 'noopener noreferrer'
    }

    return {
      isPlugin: true,
      apply(ctx) {
        ctx.effect(() => {
          window.addEventListener('click', resolveConfirmationLink, true)
          window.addEventListener('auxclick', resolveConfirmationLink, true)
          return () => {
            window.removeEventListener('click', resolveConfirmationLink, true)
            window.removeEventListener('auxclick', resolveConfirmationLink, true)
          }
        })
      },
    }
  },
})
