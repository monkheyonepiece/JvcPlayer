// ==UserScript==
// @name         JvcPlayer
// @namespace    https://github.com/monkheyonepiece/JvcPlayer
// @version      1.1.1
// @description  Intégration de vidéos YouTube et Youtube Short, Streamable, WebmShare, Twitter, Tiktok, Vocaroo, IssouTV ou 4chan sur jeuxvideo.com
// @author       monkheyonepiece
// @match        https://www.jeuxvideo.com/forums/*
// @match        https://www.jeuxvideo.com/messages-prives/*
// @grant        none
// ==/UserScript==
/*
TODO :
-Lien 4chan qui affiche FORBIDDEN 403
-Faire en sorte que l'utilisateur puisse choisir quels liens il veut intégrer ou non (faire mieux qu'actuellement avec une interface)
/PEUT-ETRE\ Laisser afficher le lien de base (problème avec TopicLive) iframeContainer.appendChild(iframe);
*/

(function() {
    'use strict';

    /*
POUR CHOISIR QUELS LIENS VOUS VOULEZ INTEGRER OU NON.
SI LE SITE QUI VOUS INTERESSE EST GRISÉ, C'EST QU'IL N'EST PAS ENCORE PRÊT.
UNE FOIS LA MODIFICATION FINIE, FAITES JUSTE CTRL+S POUR SAUVEGARDER ET VOUS POUVEZ ENSUITE FERMER LA PAGE.
*/
    //Remplacer true par false pour ne plus intégrer les lien Youtube et Youtube Short
    var doYoutube = true;

    //Remplacer true par false pour ne plus intégrer les lien Streamable
    var doStreamable = true;

    //Remplacer true par false pour ne plus intégrer les lien Webmshare
    var doWebmshare = true;

    //Remplacer true par false pour ne plus intégrer les lien Twitter
    var doTwitter = true;

    //Remplacer true par false pour ne plus intégrer les lien Tiktok
    var doTiktok = true;

    //Remplacer true par false pour ne plus intégrer les lien Vocaroo
    var doVocaroo = true;

    //Remplacer true par false pour ne plus intégrer les lien IssouTV
    var doIssoutv = true;

    //Remplacer true par false pour ne plus intégrer les lien 4chan
    //var do4chan = PAS ENCORE PRÊT;


    // Fonction pour remplacer les liens YouTube et Youtube Short par des vidéos intégrées
    function replaceYoutubeLinks() {
        var links = document.querySelectorAll('a[href*="youtube.com/watch"], a[href*="youtu.be/"], a[href*="youtube.com/shorts/"]');
        for (var i = 0; i < links.length; i++) {
            var link = links[i];
            if (link.closest('.signature-msg') !== null) {
                continue; // Exclure les liens de la classe "signature-msg"
            }
            var videoId = '';
            var timestamp = '';
            var isShort = false;
            if (link.href.indexOf('youtube.com/watch') !== -1) {
                if(link.href.indexOf('v=') !== -1) {
                    videoId = link.href.match(/v=([^&]+)/)[1];
                }
                if(link.href.indexOf('t=') !== -1) {
                    timestamp = link.href.match(/t=([^&]+)/)[1];
                }
            } else if (link.href.indexOf('youtu.be/') !== -1) {
                videoId = link.href.split('youtu.be/')[1];
                if(videoId.indexOf('?') !== -1) {
                    videoId = videoId.split('?')[0];
                }
                if(link.href.indexOf('t=') !== -1) {
                    timestamp = link.href.split('t=')[1];
                }
            } else if (link.href.indexOf('youtube.com/shorts/') !== -1) {
                videoId = link.href.split('youtube.com/shorts/')[1];
                isShort = true;
            }
            var iframe = document.createElement('iframe');
            if(isShort === true) {
                iframe.width = '330';
                iframe.height = '590';
            } else {
                iframe.width = '560';
                iframe.height = '315';
            }
            iframe.src = 'https://www.youtube.com/embed/' + videoId + '?start=' + timestamp.replace('s', '');
            iframe.setAttribute('frameborder', '0');
            iframe.setAttribute('allowfullscreen', 'true');
            link.parentNode.replaceChild(iframe, link);
        }
    }

    // Fonction pour remplacer les liens Streamable par des vidéos intégrées
    function replaceStreamableLinks() {
        var links = document.querySelectorAll('a[href*="streamable.com/"]');
        for (var i = 0; i < links.length; i++) {
            var link = links[i];
            if (link.closest('.signature-msg') !== null) {
                continue; // Exclure les liens de la classe "signature-msg"
            }
            var videoId = link.href.split('/').pop();
            var iframeContainer = document.createElement('div');
            iframeContainer.style.width = '560px';
            iframeContainer.style.height = '315px';
            iframeContainer.style.position = 'relative';
            var iframe = document.createElement('iframe');
            iframe.src = 'https://streamable.com/e/' + videoId;
            iframe.width = '100%';
            iframe.height = '100%';
            iframe.setAttribute('frameborder', '0');
            iframe.setAttribute('allowfullscreen', 'true');
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.position = 'absolute';
            iframeContainer.appendChild(iframe);
            link.parentNode.replaceChild(iframeContainer, link);
        }
    }

    // Fonction pour remplacer les liens Webmshare par des vidéos intégrées
    function replaceWebmshareLinks() {
        var links = document.querySelectorAll('a[href*="webmshare.com/"]');
        for (var i = 0; i < links.length; i++) {
            var link = links[i];
            if (link.closest('.signature-msg') !== null) {
                continue; // Exclure les liens de la classe "signature-msg"
            }
            var videoId = link.href.split('/').pop();
            var iframeContainer = document.createElement('div');
            iframeContainer.style.width = '560px';
            iframeContainer.style.height = '315px';
            iframeContainer.style.position = 'relative';
            var iframe = document.createElement('iframe');
            iframe.src = 'https://webmshare.com/play/' + videoId;
            iframe.width = '100%';
            iframe.height = '100%';
            iframe.setAttribute('frameborder', '0');
            iframe.setAttribute('allowfullscreen', 'true');
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.position = 'absolute';
            iframeContainer.appendChild(iframe);
            link.parentNode.replaceChild(iframeContainer, link);
        }
    }

    // Fonction pour remplacer les liens Twitter par des vidéos intégrées
    function replaceTwitterLinks() {
        var script = document.querySelector('script[src="https://platform.twitter.com/widgets.js"]');
        if (script) {
            script.remove();
        }
        var links = document.querySelectorAll('a[href*="twitter.com/"][href*="/status/"], a[href*="x.com/"][href*="/status/"]');
        for (var i = 0; i < links.length; i++) {
            var link = links[i];
            if (link.href.includes("x.com")) {
            link.href = link.href.replace("x.com", "twitter.com");
            }
            if ((link.closest('.signature-msg') !== null) || (link.closest('.twitter-tweet') !== null)) {
                continue; // Exclure les liens de la classe "signature-msg" et "twitter-tweet"
            }
            /*
            isTweetExist(link.href).then(result => {
                if(result){
                    var tweetHtml = `<blockquote class="twitter-tweet"><a href="${link}"></a></blockquote>`;
                    var tweetElement = document.createElement('blockquote');
                    tweetElement.setAttribute('class', 'twitter-tweet');
                    tweetElement.innerHTML = tweetHtml;
                    link.parentNode.replaceChild(tweetElement, link);
                }else {
                    // Le tweet n'existe pas
                    console.log("222Tweet not found");
                }
            })*/

            var tweetHtml = `<blockquote class="twitter-tweet"><a href="${link}"></a></blockquote>`;
            var tweetElement = document.createElement('blockquote');
            tweetElement.setAttribute('class', 'twitter-tweet');
            tweetElement.innerHTML = tweetHtml;
            link.parentNode.replaceChild(tweetElement, link);

            if (!script) {
                const twitterScript = document.createElement('script');
                twitterScript.setAttribute('src', 'https://platform.twitter.com/widgets.js');
                document.body.appendChild(twitterScript);
            }
        }
    }

    // Fonction pour remplacer les liens Tiktok par des vidéos intégrées
    function replaceTikTokLinks() {
        var links = document.querySelectorAll('a[href*="tiktok.com/"]');
        for (var i = 0; i < links.length; i++) {
            var link = links[i];
            if (link.closest('.signature-msg') !== null) {
                continue; // Exclure les liens de la classe "signature-msg"
            }
            var videoId = '';
            if (link.href.indexOf('vm.tiktok.com/') !== -1) { continue; }
            /*videoId = link.href.split('/')[3];
                var iframeContainer = document.createElement('div');
                iframeContainer.style.width = '560px';
                iframeContainer.style.height = '315px';
                iframeContainer.style.position = 'relative';
                var iframe = document.createElement('iframe');
                iframe.src = 'https://vm.tiktok.com/' + videoId;
                iframe.width = '100%';
                iframe.height = '100%';
                iframe.setAttribute('frameborder', '0');
                iframe.setAttribute('allowfullscreen', 'true');
                iframe.style.width = '100%';
                iframe.style.height = '100%';
                iframe.style.position = 'absolute';
                iframeContainer.appendChild(iframe);
                link.parentNode.replaceChild(iframeContainer, link);
            } else {*/
            videoId = link.href.split('/').pop();
            var videoContainer = document.createElement('div');
            videoContainer.style.width = '100%';
            videoContainer.style.display = 'flex';
            var video = document.createElement('iframe');
            video.src = 'https://www.tiktok.com/embed/v2/' + videoId + '?lang=en-US';
            video.style.width = '100%';
            video.style.maxWidth = '330px';
            video.style.height = 'auto';
            video.style.minHeight = '785px';
            video.style.border = 'none';
            videoContainer.appendChild(video);
            link.parentNode.replaceChild(videoContainer, link);
            //}
        }
    }
    // Fonction pour remplacer les liens Vocaroo par des audio intégrés
    function replaceVocarooLinks() {
        var links = document.querySelectorAll('a[href*="vocaroo.com/"], a[href*="voca.ro/"]');
        for (var i = 0; i < links.length; i++) {
            var link = links[i];
            var audioId = link.href.split('/').pop();
            var iframe = document.createElement('iframe');
            iframe.width = '300';
            iframe.height = '60';
            iframe.src = 'https://vocaroo.com/embed/' + audioId;
            var div = document.createElement('div');
            div.appendChild(iframe);
            link.parentNode.replaceChild(div, link);
        }
    }

    // Fonction pour remplacer les liens IssouTV par des vidéos intégrées
    function replaceIssoutvLinks() {
        // Sélectionner tous les liens issouTV
        var links = document.querySelectorAll('a[href*="issoutv.com/videos/"]');
        for (var i = 0; i < links.length; i++) {
            var link = links[i];

            // Exclure les liens de la classe "signature-msg"
            if (link.closest('.signature-msg') !== null) {
                continue;
            }
            var videoId = link.href.split('/').pop();
            var iframeContainer = document.createElement('div');
            iframeContainer.style.width = '560px';
            iframeContainer.style.height = '315px';
            iframeContainer.style.position = 'relative';
            var iframe = document.createElement('iframe');
            iframe.src = 'https://issoutv.com/storage/videos/' + videoId + '.webm';
            iframe.width = '100%';
            iframe.height = '100%';
            iframe.setAttribute('frameborder', '0');
            iframe.setAttribute('allowfullscreen', 'true');
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.position = 'absolute';
            iframeContainer.appendChild(iframe);
            link.parentNode.replaceChild(iframeContainer, link);
        }
    }

    /*FORBIDDEN 403
    function replace4chanLinks() {
        // Sélectionner tous les liens issouTV
        var links = document.querySelectorAll('a[href*="4cdn.org/"]');
        for (var i = 0; i < links.length; i++) {
            var link = links[i];

            // Exclure les liens de la classe "signature-msg"
            if (link.closest('.signature-msg') !== null) {
                continue;
            }
            var board = link.href.split('/')[1];
            var videoId = link.href.split('/')[2];
            var iframeContainer = document.createElement('div');
            iframeContainer.style.width = '560px';
            iframeContainer.style.height = '315px';
            iframeContainer.style.position = 'relative';
            var iframe = document.createElement('iframe');
            iframe.src = 'https://i.4cdn.org/' + board + videoId;
            iframe.width = '100%';
            iframe.height = '100%';
            iframe.setAttribute('frameborder', '0');
            iframe.setAttribute('allowfullscreen', 'true');
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.position = 'absolute';
            iframeContainer.appendChild(iframe);
            link.parentNode.replaceChild(iframeContainer, link);
        }
    }
*/
    function Start() {
        // Vérifier s'il y a des liens sur la page avant d'appeler les fonctions correspondantes
        if(doYoutube === true) {
            if (document.querySelectorAll('a[href*="youtube.com/watch"], a[href*="youtu.be/"], a[href*="youtube.com/shorts/"]').length > 0) {
                replaceYoutubeLinks();
            }
        }

        if(doStreamable === true) {
            if (document.querySelectorAll('a[href*="streamable.com/"]').length > 0) {
                replaceStreamableLinks();
            }
        }

        if(doWebmshare === true) {
            if (document.querySelectorAll('a[href*="webmshare.com/"]').length > 0) {
                replaceWebmshareLinks();
            }
        }

        if(doTwitter === true) {
            if (document.querySelectorAll('a[href*="twitter.com/"][href*="/status/"], a[href*="x.com/"][href*="/status/"]').length > 0) {
                replaceTwitterLinks();
            }
        }
        
        if(doTiktok === true) {
            if (document.querySelectorAll('a[href*="tiktok.com/"]').length > 0) {
                replaceTikTokLinks();
            }
        }

        if(doVocaroo === true) {
            if (document.querySelectorAll('a[href*="vocaroo.com/"], a[href*="voca.ro/"]').length > 0) {
                replaceVocarooLinks();
            }
        }

        if(doIssoutv === true) {
            if (document.querySelectorAll('a[href*="issoutv.com/videos/"]').length > 0) {
                replaceIssoutvLinks();
            }
        }
        /*FORBIDDEN 403
        if(do4chan === true) {
        if (document.querySelectorAll('a[href*="4cdn.org/"]').length > 0) {
            replace4chanLinks();
        }
        }
*/
    }

    Start();

    // Écouter les modifications dans le DOM et remplacer les liens après un certain délai d'inactivité
    //Pour la compatibilité avec TopicLive
    var timeout = null;
    var observer = new MutationObserver(function(mutations) {
        clearTimeout(timeout);
        timeout = setTimeout(function() {
            // Ajouter la vérification de la présence de liens Youtube avant d'appeler la fonction correspondante
            Start();
        }, 3000);
    });
    observer.observe(document, { childList: true, subtree: true });
})();
