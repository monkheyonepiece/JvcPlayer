// ==UserScript==
// @name         JvcPlayer
// @namespace    https://github.com/monkheyonepiece/JvcPlayer
// @version      2.0.0
// @description  Intégration de vidéos YouTube, Streamable, WebmShare, Twitter/X, Tiktok, Vocaroo, IssouTV sur jeuxvideo.com
// @author       monkheyonepiece
// @match        https://www.jeuxvideo.com/forums/*
// @match        https://www.jeuxvideo.com/messages-prives/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // =========================================================
    //  CONFIG — passer à false pour désactiver un site
    // =========================================================
    const CONFIG = {
        youtube:    true,
        streamable: true,
        webmshare:  true,
        twitter:    true,
        tiktok:     true,
        vocaroo:    true,
        issoutv:    true,
    };

    // =========================================================
    //  HELPERS
    // =========================================================

    /** Crée un iframe avec les attributs communs */
    function makeIframe(src, w, h, extraStyles = {}) {
        const f = document.createElement('iframe');
        f.src = src;
        f.width  = w;
        f.height = h;
        f.setAttribute('frameborder', '0');
        f.setAttribute('allowfullscreen', 'true');
        f.setAttribute('loading', 'lazy');   // chargement différé natif
        Object.assign(f.style, extraStyles);
        return f;
    }

    /** Remplace link par el dans le DOM */
    const swap = (link, el) => link.parentNode?.replaceChild(el, link);

    /** Extrait le premier groupe capturant d'une regex sur une chaîne */
    const match1 = (str, re) => (str.match(re) || [])[1] ?? '';

    /** Vérifie si le lien est dans une signature (à exclure) */
    const inSignature = (el) => el.closest('.signature-msg') !== null;

    // =========================================================
    //  HANDLERS PAR SITE
    // =========================================================

    const HANDLERS = {

        // ----- YouTube & Shorts ------------------------------------------
        youtube: {
            selector: 'a[href*="youtube.com/watch"], a[href*="youtu.be/"], a[href*="youtube.com/shorts/"]',
            process(link) {
                if (inSignature(link)) return;
                const href = link.href;
                let videoId = '', timestamp = '', isShort = false;

                if (href.includes('youtube.com/shorts/')) {
                    videoId = href.split('youtube.com/shorts/')[1].split('?')[0];
                    isShort = true;
                } else if (href.includes('youtu.be/')) {
                    videoId   = href.split('youtu.be/')[1].split('?')[0];
                    timestamp = match1(href, /[?&t=]t=([^&#]+)/);
                } else {
                    videoId  = match1(href, /[?&]v=([^&]+)/);
                    timestamp = match1(href, /[?&]t=([^&]+)/);
                }
                if (!videoId) return;

                const src = `https://www.youtube.com/embed/${videoId}?start=${timestamp.replace('s', '')}`;
                const iframe = isShort
                    ? makeIframe(src, '330', '590')
                    : makeIframe(src, '560', '315');
                swap(link, iframe);
            },
        },

        // ----- Streamable ------------------------------------------------
        // L'API oEmbed retourne width/height sans auth → on choisit
        // portrait (330×590) ou paysage (560×315) selon les dimensions réelles.
        streamable: {
            selector: 'a[href*="streamable.com/"]',
            process(link) {
                if (inSignature(link)) return;
                const videoId = link.href.split('/').pop();
                if (!videoId) return;

                // Placeholder pendant le fetch
                const placeholder = document.createElement('div');
                Object.assign(placeholder.style, { width: '560px', height: '315px', background: '#111' });
                swap(link, placeholder);

                fetch(`https://api.streamable.com/oembed.json?url=https://streamable.com/${videoId}`)
                    .then(r => r.json())
                    .then(({ width: vw, height: vh }) => {
                        const portrait = vh > vw;
                        const w = portrait ? '330' : '560';
                        const h = portrait ? '590' : '315';
                        const iframe = makeIframe(`https://streamable.com/e/${videoId}`, w, h);
                        placeholder.replaceWith(iframe);
                    })
                    .catch(() => {
                        // Fallback paysage si l'API est inaccessible
                        placeholder.replaceWith(
                            makeIframe(`https://streamable.com/e/${videoId}`, '560', '315')
                        );
                    });
            },
        },

        // ----- Webmshare -------------------------------------------------
        // webmshare.com bloque les iframes (X-Frame-Options), on utilise
        // donc <video> natif avec l'URL directe s1.webmshare.com/{id}.webm
        webmshare: {
            selector: 'a[href*="webmshare.com/"]',
            process(link) {
                if (inSignature(link)) return;
                const videoId = link.href.split('/').pop();
                if (!videoId) return;

                const video = document.createElement('video');
                video.src = `https://s1.webmshare.com/${videoId}.webm`;
                video.controls = true;
                video.preload = 'metadata'; // charge uniquement les métadonnées, pas la vidéo entière
                Object.assign(video.style, { maxWidth: '560px', display: 'block' });

                video.addEventListener('loadedmetadata', () => {
                    const { videoWidth: vw, videoHeight: vh } = video;
                    if (!vw || !vh) return;
                    const portrait = vh > vw;
                    video.style.width  = portrait ? '330px' : '560px';
                    video.style.height = portrait ? '590px' : '315px';
                }, { once: true });

                swap(link, video);
            },
        },

        // ----- Twitter / X -----------------------------------------------
        twitter: {
            selector: 'a[href*="twitter.com/"][href*="/status/"], a[href*="x.com/"][href*="/status/"]',
            _scriptInjected: false,
            process(link) {
                if (inSignature(link) || link.closest('.twitter-tweet')) return;

                // Normalise x.com → twitter.com
                const href = link.href.replace('x.com', 'twitter.com');

                const blockquote = document.createElement('blockquote');
                blockquote.className = 'twitter-tweet';
                const tweetAnchor = document.createElement('a');
                tweetAnchor.setAttribute('href', href);
                blockquote.appendChild(tweetAnchor);
                swap(link, blockquote);

                if (!this._scriptInjected) {
                    this._scriptInjected = true;
                    // Retire l'ancien script s'il existe (évite les doublons)
                    document.querySelector('script[src*="platform.twitter.com/widgets.js"]')?.remove();
                    const s = document.createElement('script');
                    s.src = 'https://platform.twitter.com/widgets.js';
                    s.async = true;
                    document.body.appendChild(s);
                }
            },
        },

        // ----- TikTok ----------------------------------------------------
        tiktok: {
            selector: 'a[href*="tiktok.com/"]',
            process(link) {
                if (inSignature(link)) return;
                // Liens courts vm.tiktok.com non gérés
                if (link.href.includes('vm.tiktok.com/')) return;

                const tiktokMatch = link.href.match(/\/video\/(\d+)/);
                const videoId = tiktokMatch ? tiktokMatch[1] : link.href.split('/').pop().split('?')[0];
                if (!videoId) return;

                const container = document.createElement('div');
                Object.assign(container.style, { width: '100%', display: 'flex' });
                container.appendChild(
                    makeIframe(`https://www.tiktok.com/embed/v2/${videoId}?lang=fr-FR`, '100%', 'auto', {
                        maxWidth:  '330px',
                        minHeight: '785px',
                        border:    'none',
                    })
                );
                swap(link, container);
            },
        },

        // ----- Vocaroo ---------------------------------------------------
        vocaroo: {
            selector: 'a[href*="vocaroo.com/"], a[href*="voca.ro/"]',
            process(link) {
                const audioId = link.href.split('/').pop();
                if (!audioId) return;
                const wrapper = document.createElement('div');
                wrapper.appendChild(makeIframe(`https://vocaroo.com/embed/${audioId}`, '300', '60'));
                swap(link, wrapper);
            },
        },

        // ----- IssouTV ---------------------------------------------------
        // Utilise <video> natif au lieu d'un iframe : le navigateur connaît
        // les dimensions réelles une fois les métadonnées chargées, ce qui
        // permet de redimensionner le conteneur automatiquement.
        issoutv: {
            selector: 'a[href*="issoutv.com/videos/"]',
            process(link) {
                if (inSignature(link)) return;
                const videoId = link.href.split('/').pop();
                if (!videoId) return;

                const video = document.createElement('video');
                video.src = `https://issoutv.com/storage/videos/${videoId}.webm`;
                video.controls = true;
                video.preload = 'metadata'; // charge uniquement les métadonnées, pas la vidéo entière
                Object.assign(video.style, { maxWidth: '560px', display: 'block' });

                // Redimensionnement dès que le navigateur connaît w/h de la vidéo
                video.addEventListener('loadedmetadata', () => {
                    const { videoWidth: vw, videoHeight: vh } = video;
                    if (!vw || !vh) return;
                    const portrait = vh > vw;
                    video.style.width  = portrait ? '330px' : '560px';
                    video.style.height = portrait ? '590px' : '315px';
                }, { once: true });

                swap(link, video);
            },
        },
    };

    // =========================================================
    //  MOTEUR PRINCIPAL
    // =========================================================

    /** Traite uniquement les liens pas encore convertis (attribut data-jvcp-done) */
    function processLinks(handler) {
        document.querySelectorAll(handler.selector).forEach(link => {
            if (link.dataset.jvcpDone) return;
            link.dataset.jvcpDone = '1';   // marque avant swap pour éviter le double traitement
            handler.process(link);
        });
    }

    function start() {
        for (const [key, handler] of Object.entries(HANDLERS)) {
            if (CONFIG[key]) processLinks(handler);
        }
    }

    // Premier passage au chargement
    start();

    // =========================================================
    //  OBSERVER (TopicLive / pagination dynamique)
    //  Debounce de 2 s pour éviter les appels en cascade
    // =========================================================
    let debounceTimer = null;
    const observer = new MutationObserver(() => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(start, 2000);
    });
    observer.observe(document.body, { childList: true, subtree: true });

})();
