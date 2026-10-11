/* ============================================================
   Analítica (GA4) con consentimiento RGPD.
   Lo comparten la portada, privacidad y términos.

   - El script de Google solo se inyecta si el visitante acepta.
   - La elección se guarda en localStorage ('macos_consent').
   - El banner se crea solo cuando hace falta (nunca aceptado antes).
   - Con ?ga=... en la URL se activa modo de prueba: define gtag sin
     cargar nada de Google, para poder verificar los eventos en local.
   ============================================================ */
window.DSH_GA_ID = 'G-E6HG2LH68D';
(function () {
  var ID = window.DSH_GA_ID;
  var CLAVE = 'macos_consent';
  var cargado = false;

  if (!ID || ID.indexOf('XXXX') > -1) return;

  /* --- modo de prueba: no se contacta con Google --- */
  if (location.search.indexOf('ga=') > -1) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { dataLayer.push(arguments); };
    return;
  }

  function arranca() {
    if (cargado) return;
    cargado = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { dataLayer.push(arguments); };
    /* Todo denegado por defecto; se concede analítica al cargar tras el sí. */
    gtag('consent', 'default', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'granted'
    });
    gtag('js', new Date());
    gtag('config', ID);
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + ID;
    document.head.appendChild(s);
  }

  function eleccion() {
    try { return localStorage.getItem(CLAVE); } catch (e) { return null; }
  }
  function guarda(v) { try { localStorage.setItem(CLAVE, v); } catch (e) { /* modo privado */ } }

  function banner() {
    if (document.getElementById('cookiebar')) return;

    var css = document.createElement('style');
    css.textContent =
      '#cookiebar{position:fixed;left:0;right:0;bottom:0;z-index:80;' +
      'background:#0A0A0A;border-top:1px solid #2C2C2C;' +
      'padding:14px clamp(16px,4vw,28px);' +
      'display:flex;flex-wrap:wrap;gap:14px 22px;align-items:center;justify-content:center}' +
      '#cookiebar p{margin:0;color:#C9C9C9;font-size:.88rem;line-height:1.5;max-width:62ch}' +
      '#cookiebar strong{color:#fff}' +
      '#cookiebar .cbtns{display:flex;gap:10px;flex:none}' +
      '#cookiebar button{font:inherit;font-weight:600;font-size:.86rem;' +
      'padding:11px 20px;border:0;cursor:pointer;white-space:nowrap}' +
      '#cookiebar button.c-ok{background:#CE1126;color:#fff}' +
      '#cookiebar button.c-ok:hover{background:#A50D1E}' +
      '#cookiebar button.c-no{background:transparent;color:#8F8F8F;box-shadow:inset 0 0 0 1px #2C2C2C}' +
      '#cookiebar button.c-no:hover{color:#fff}' +
      '#cookiebar button:focus-visible{outline:3px solid #F20D28;outline-offset:2px}';
    document.head.appendChild(css);

    var box = document.createElement('div');
    box.id = 'cookiebar';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-live', 'polite');
    box.setAttribute('aria-label', 'Consentimiento de analítica');
    box.innerHTML =
      '<p><strong>Medimos el tráfico con Google Analytics.</strong> ' +
      'Solo se activa si lo aceptas y no se usan cookies de publicidad. ' +
      'Si cambias de opinión, borra los datos del sitio en tu navegador.</p>' +
      '<div class="cbtns">' +
      '<button type="button" class="c-ok">Aceptar analítica</button>' +
      '<button type="button" class="c-no">Ahora no</button>' +
      '</div>';
    document.body.appendChild(box);

    box.querySelector('.c-ok').addEventListener('click', function () {
      guarda('ok'); box.remove(); arranca();
    });
    box.querySelector('.c-no').addEventListener('click', function () {
      guarda('no'); box.remove();
    });
  }

  function init() {
    var e = eleccion();
    if (e === 'ok') arranca();
    else if (!e) banner();
    /* 'no': no se carga nada */
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
