window.__ModuleLoader__.load({
  id: 'dsh-ppt-master-confirm',
  factory: require => {
    const { createElement: h } = require('react')
    const panel = 'ppt-master-confirm'
    const title = 'PPT Master'

    function Icon({ size = 18 } = {}) {
      return h('svg', {
        width: size, height: size, viewBox: '0 0 24 24',
        fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, 'aria-hidden': true,
      }, h('path', { d: 'M4 4h16v12H4zM8 20l4-4 4 4M9 8h6m-6 4h4' }))
    }

    function Page() {
      return h('iframe', {
        src: new URL('ppt-master-confirm/', document.baseURI).href,
        title,
        style: { width: '100%', height: '100%', display: 'block', border: 0 },
      })
    }

    return {
      isPlugin: true,
      inject: ['slots'],
      apply(ctx) {
        ctx.slots.inject('sidebar.panellist', () =>
          ctx.slots.register({ name: 'sidebar.panellist', id: panel, label: () => title }, Icon))
        ctx.slots.inject('main', () => ctx.slots.register({ name: 'main', key: panel }, Page))
      },
    }
  },
})
