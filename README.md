# Método MAC-OS — Landing page

Landing page de una sola sección para el **Método MAC-OS** de Óscar Anguitar. Objetivo
principal: que el visitante reserve una llamada de diagnóstico en Calendly o escriba por
WhatsApp.

Sitio estático puro (HTML y CSS en línea, sin frameworks ni build). En Vercel se sirve la
carpeta `public/` tal cual.

## Estructura

```
public/                 ← esto es lo que se publica
  index.html            Landing completa (las 8 secciones)
  privacidad.html       Política de privacidad  -> /privacidad
  terminos.html         Términos y condiciones  -> /terminos
  robots.txt
  sitemap.xml
  img/
    oscar.jpg           Foto del coach
    caso-1..4.jpg       Transformaciones de clientes
    favicon.svg
  video/
    escuela-mac-os.mp4  Vídeo de presentación (19 MB, 6:06 min, 640x360)
    poster.jpg          Fotograma extraído del propio vídeo, como cartel
serve.mjs               Servidor local de previsualización (no se despliega)
vercel.json             cleanUrls + cabeceras de seguridad y caché
_original/              Borrador antiguo en un solo HTML, con las imágenes incrustadas
```

El peso total de la carpeta que se publica es de unos **20 MB**, casi todo el vídeo.
Las imágenes suman 168 KB y el HTML 35 KB.

## Ver la web en local

```powershell
npm start
```

Abre <http://127.0.0.1:4321>. El servidor reproduce el comportamiento de `cleanUrls` de
Vercel, así que `/privacidad` y `/terminos` funcionan sin la extensión `.html`.

## Lo que hay que completar antes de publicar

1. **ID de Google Analytics.** En `public/index.html`, busca `window.DSH_GA_ID` y sustituye
   `G-XXXXXXXXXX` por tu ID de medición (GA4 → Administrar → Flujos de datos → tu flujo web).
   Mientras quede el marcador `XXXX`, no se carga nada y no se instala ninguna cookie.
2. **Datos legales.** En `privacidad.html` y `terminos.html` hay campos entre corchetes
   (`[Nombre y apellidos o razón social]`, `[NIF/CIF]`, `[Dirección completa]`,
   `[correo@dominio.com]`). Hay que rellenarlos y borrar los recuadros rojos de aviso.
3. **Dominio.** Si compras un dominio propio, actualiza estas dos cosas para que no apunten
   al marcador `metodomacos.com`:
   - `public/index.html` → la etiqueta `<link rel="canonical">`
   - `public/sitemap.xml` → las tres etiquetas `<loc>`

---

# Cómo alojarla en Vercel

Hay tres caminos. El de la CLI es el más rápido para la primera publicación.

## Opción A · CLI de Vercel (recomendada)

Necesitas Node.js instalado (ya lo tienes: `node -v` → v22).

```powershell
# 1. Entra en la carpeta del proyecto
cd "C:\Users\mandu\Downloads\01 Proyectos\Webs\Metodo MAC-OS Web"

# 2. Instala la CLI de Vercel
npm i -g vercel

# 3. Inicia sesión (abre el navegador y autoriza)
vercel login

# 4. Primer despliegue: se sube a una URL de previsualización
vercel
```

Durante el asistente responde así:

| Pregunta | Respuesta |
| --- | --- |
| `Set up and deploy "…"?` | **y** |
| `Which scope…?` | tu cuenta personal |
| `Link to existing project?` | **N** |
| `What's your project's name?` | `metodo-mac-os` |
| `In which directory is your code located?` | `./` (Enter) |
| `Want to modify these settings?` | **N** |

Vercel detecta un proyecto estático y publica la carpeta `public`. Cuando termine te dará
una URL del tipo `https://metodo-mac-os-xxxx.vercel.app` y verificará que todo carga.

```powershell
# 5. Publicar en producción
vercel --prod
```

A partir de aquí, para actualizar basta con volver a ejecutar `vercel --prod` dentro de la
carpeta del proyecto. No hace falta build.

## Opción B · GitHub + panel de Vercel (despliegue automático)

Cada `git push` despliega solo. Es lo que yo elegiría para el día a día.

```powershell
cd "C:\Users\mandu\Downloads\01 Proyectos\Webs\Metodo MAC-OS Web"
git init
git add .
git commit -m "Landing Método MAC-OS"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/metodo-mac-os.git
git push -u origin main
```

Después, en <https://vercel.com/new>:

1. **Import Git Repository** → elige `metodo-mac-os` → *Import*.
2. En **Configure Project**:
   - **Framework Preset:** `Other`
   - **Root Directory:** `./` (déjalo como está)
   - **Build Command:** vacío
   - **Output Directory:** `public`
   - **Install Command:** vacío
3. **Deploy**.

## Opción C · Arrastrar y soltar (la más rápida, sin instalar nada)

En <https://vercel.com/new> baja hasta **Deploy from a template / drag and drop** y arrastra
**la carpeta `public`** (no la carpeta padre, porque dentro están `_original/`, `_shots/`,
`serve.mjs`… que no queremos publicar). Vercel la publica al instante.

---

## Después del despliegue

### 1. Dominio propio

Vercel → tu proyecto → **Settings → Domains → Add**. Escribe el dominio (por ejemplo
`metodomacos.com`) y configura en tu registrador los registros DNS que te indique:

- Dominio raíz → registro **A** a `76.76.21.21`
- `www` → registro **CNAME** a `cname.vercel-dns.com`

El certificado HTTPS se emite solo, en unos minutos.

### 2. Comprobar que las conversiones se miden

Con el ID de GA4 ya puesto, abre la web publicada y haz clic en cada botón. En
**GA4 → Informes → Tiempo real** deberías ver el evento `cta_click` con el parámetro
`cta_id` (`hero`, `llamada`, `whatsapp-mid`, `como`, `coach`, `footer`) y, al pulsar
play en el vídeo, el evento `video_play`.

Para marcar la conversión: **GA4 → Administrar → Eventos** y marca `cta_click` como
conversión. Así podrás ver qué botón convierte más.

### 3. (Opcional) Analítica de Vercel

Vercel → tu proyecto → **Analytics → Enable**. Es gratis en el plan Hobby y no necesita
código.

### 4. Revisar el vídeo

El vídeo **se aloja en el propio sitio**, no en YouTube. Se carga con un patrón de "fachada
clicable": primero se ve el cartel (`video/poster.jpg`, extraído de un fotograma del propio
vídeo) y el botón *Ver el vídeo*; al pulsar, se crea el reproductor nativo y arranca la
reproducción. Así la página no descarga ni un byte de vídeo hasta que alguien decide verlo,
y no se instalan cookies de terceros (coherente con la política de privacidad).

Comprobado en Chrome: el archivo se reproduce y avanza en tiempo real, con `readyState 4`
(listo) y sin errores, servido por rangos HTTP (necesario para poder adelantar).

Si el archivo no se pudiera reproducir (códec no soportado, red bloqueada), el script
sustituye el reproductor por el de YouTube en el mismo hueco y **sin salir de la página**,
usando el ID `JmEHu8e8bh8`. Ese es el único uso que le queda a YouTube: respaldo.

**Sobre la calidad.** El archivo que me pasaste es 640×360 y 18,8 MB. En móvil se ve bien,
pero en pantalla grande el reproductor lo escala y se nota algo blando. Si consigues
exportarlo a 1080p se verá notablemente mejor, y de paso conviene grabarlo con el índice
(`moov`) al principio del archivo —el actual lo tiene al final, así que el navegador
necesita ir descargando para poder empezar—. Con HandBrake basta:

```
HandBrake → Preset "Fast 1080p30" → pestaña Output → marca "Web Optimized"
```

Sustituye el archivo manteniendo el nombre `escuela-mac-os.mp4` y regenera el cartel
pidiendo un fotograma nuevo (o cambia `poster.jpg` por una captura tuya).

### 5. Si prefieres usar YouTube en lugar del archivo local

Es un cambio de una línea en `public/index.html`. Busca `var FILE = 'video/escuela-mac-os.mp4';`
dentro del script del vídeo y sustituye el cuerpo del `click` por:

```js
var f = document.createElement('iframe');
f.src = 'https://www.youtube.com/embed/JmEHu8e8bh8?autoplay=1&rel=0&playsinline=1&hl=es';
f.title = 'Escuela MAC-OS — presentación del método';
f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
f.referrerPolicy = 'strict-origin-when-cross-origin';
f.allowFullscreen = true;
box.replaceChildren(f);
```

Ventaja: calidad adaptativa hasta 1080p y cero ancho de banda. Inconveniente: carga unos
500 KB de scripts de YouTube, instala cookies de terceros y el vídeo puede acabar
recomendando otros canales al terminar.

---

## Notas técnicas

- **Sin build.** Todo el CSS va en línea en el `<head>`, así que la primera pintura no
  espera a ninguna hoja de estilos externa.
- **Tipografías.** Barlow y Barlow Condensed desde Google Fonts con `preconnect` y
  `display=swap`.
- **Imágenes.** Extraídas del borrador original a archivos sueltos (antes iban incrustadas
  en base64 dentro del HTML, que pesaba 236 KB). Ahora el HTML pesa 35 KB y las imágenes se
  cachean un año con `Cache-Control: immutable`.
- **Vídeo.** 19 MB servidos por rangos HTTP desde `/video/`. Sin cookies de terceros. El
  cartel va con `preload` para que sea lo primero que se ve.
  Ojo con el ancho de banda: cada visita que vea el vídeo entero consume ~19 MB. El plan
  gratuito de Vercel incluye 100 GB al mes, o sea unas 5.000 reproducciones completas.
  Si algún día el tráfico se dispara, mueve el archivo a Vercel Blob o a un CDN de vídeo
  (Cloudflare R2, Bunny) y cambia solo la constante `FILE` del script.
- **Accesibilidad.** Foco visible en todos los elementos interactivos,
  `prefers-reduced-motion` respetado y texto alternativo en las imágenes de contenido.
- **Enlaces.** Los 4 CTA de Calendly y los 2 de WhatsApp abren en pestaña nueva con
  `rel="noopener"`.

### Cambiar los enlaces de conversión

Están repartidos en `public/index.html`. Para sustituirlos todos de una vez:

```powershell
# Cambiar el enlace de Calendly
(Get-Content public\index.html -Raw) -replace 'https://calendly.com/oacoachfitness/solucion-definitiva-a-la-delgadez-sin-sacrificar-clon', 'NUEVO-ENLACE' | Set-Content public\index.html -NoNewline

# Cambiar el enlace de WhatsApp
(Get-Content public\index.html -Raw) -replace 'https://wa.link/f5p6ei', 'NUEVO-ENLACE' | Set-Content public\index.html -NoNewline
```
