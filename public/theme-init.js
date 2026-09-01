// Anti-flash: resolve o tema ANTES do primeiro paint, para que a tela
// nunca apareça no modo errado enquanto o React monta.
// Precisa concordar com resolverModoInicial() em src/contexts/colorMode.js.
(function () {
  try {
    var salvo = localStorage.getItem('pondero-color-mode')
    var modo = (salvo === 'light' || salvo === 'dark')
      ? salvo
      : (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark')
    var raiz = document.documentElement
    raiz.setAttribute('data-theme', modo)
    raiz.style.colorScheme = modo
    raiz.style.backgroundColor = modo === 'light' ? '#F4EEE3' : '#09100E'
  } catch {
    document.documentElement.setAttribute('data-theme', 'dark')
  }
})()
