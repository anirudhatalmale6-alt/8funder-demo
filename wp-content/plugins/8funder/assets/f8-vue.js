/* 8funder — couche visuelle. Ajoutée en 1.7.0.
 *
 * Ce fichier ne fabrique AUCUN contenu et ne lit aucune donnée : il ne fait
 * qu'animer ce que le serveur a déjà rendu. C'est délibéré. Si ce script ne
 * se charge pas, ou s'il lève à la première ligne, la page reste complète,
 * lisible et navigable — rien ici n'est nécessaire pour comprendre la page.
 *
 * D'où la règle appliquée partout dessous : on n'ajoute la classe qui CACHE
 * (.f8-rev-off) que depuis le script, juste avant d'installer l'observateur
 * qui la retire. Une classe cachante écrite dans le HTML laisserait une page
 * blanche à quiconque a JavaScript coupé.
 */
(function () {
	'use strict';

	var doux = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	var racine = document.querySelector('.f8');
	if (!racine) return;

	/* ---------------------------------------------------------------- */
	/* 0. le titre monte à l'ouverture                                   */
	/* ---------------------------------------------------------------- */
	/* C'est le geste d'Arolax : le titre de page n'apparaît pas, il arrive.
	   On l'anime en DEUX temps — le titre, puis le chapô — parce qu'un bloc
	   entier qui bouge d'un coup ressemble à un défaut de chargement.
	
	   La classe qui cache est posée ICI, par le script, et jamais dans le
	   HTML : si ce fichier ne se charge pas, le titre est simplement là. */
	function titre() {
		if (doux) return;
		var h = racine.querySelector('.f8-hero h1, .f8-mast h1');
		if (!h) return;
		/* Au-dessus de la ligne de flottaison au chargement : inutile de
		   guetter, on joue tout de suite. */
		var suite = [];
		suite.push(h);
		var l = racine.querySelector('.f8-hero-l, .f8-mast .f8-lede');
		if (l) suite.push(l);
		var f = racine.querySelector('.f8-hero-s, .f8-nav');
		if (f) suite.push(f);

		suite.forEach(function (el, i) {
			el.classList.add('f8-lev', 'f8-lev-off');
			/* requestAnimationFrame deux fois : une seule fois, le navigateur
			   peut regrouper l'ajout et le retrait dans le même calcul de
			   style, et la transition ne part jamais. */
			window.requestAnimationFrame(function () {
				window.requestAnimationFrame(function () {
					el.style.transitionDelay = (i * 90) + 'ms';
					el.classList.remove('f8-lev-off');
					window.setTimeout(function () {
						el.style.transitionDelay = '';
					}, 1200);
				});
			});
		});
	}

	/* ---------------------------------------------------------------- */
	/* 1. jauge de défilement                                            */
	/* ---------------------------------------------------------------- */
	function jauge() {
		if (doux) return;
		var b = document.createElement('div');
		b.className = 'f8-prog';
		/* décorative : elle double une information que la barre de
		   défilement du navigateur donne déjà, donc on la retire de
		   l'arbre d'accessibilité au lieu de la faire annoncer. */
		b.setAttribute('aria-hidden', 'true');
		document.body.appendChild(b);

		var tic = false;
		function peindre() {
			var h = document.documentElement.scrollHeight - window.innerHeight;
			var p = h > 0 ? Math.min(1, Math.max(0, window.scrollY / h)) : 0;
			b.style.transform = 'scaleX(' + p + ')';
			tic = false;
		}
		window.addEventListener('scroll', function () {
			if (!tic) { tic = true; window.requestAnimationFrame(peindre); }
		}, { passive: true });
		peindre();
	}

	/* ---------------------------------------------------------------- */
	/* 2. apparition au défilement                                       */
	/* ---------------------------------------------------------------- */
	var CIBLES = [
		'.f8-card', '.f8-cart', '.f8-porte', '.f8-duo-c', '.f8-devis-c',
		'.f8-etapes li', '.f8-tsec', '.f8-sim', '.f8-pfam', '.f8-prow',
		'.f8-psteps li', '.f8-pcap', '.f8-chiffres', '.f8-pmes-c',
		'.f8-org-row', '.f8-browse', '.f8-frais', '.f8-avis',
		/* Ajoutés en 1.13.0 : les pages construites depuis n'étaient dans
		   AUCUNE de ces listes, donc elles n'avaient aucune apparition. Une
		   liste de sélecteurs écrite à la main ne se met pas à jour toute
		   seule — c'est le prix de ce mécanisme, et il faut y penser à chaque
		   nouveau gabarit. */
		'.f8-svccard', '.f8-svccat', '.f8-sgcard', '.f8-sc-vol', '.f8-sgprod'
	].join(',');

	function apparitions() {
		if (doux || !('IntersectionObserver' in window)) return;

		var els = [].slice.call(racine.querySelectorAll(CIBLES));
		/* On ne cache QUE ce qui est déjà hors de vue. Cacher puis révéler
		   ce que le lecteur regarde déjà produit un clignotement au
		   chargement, pas un effet. */
		var seuil = window.innerHeight * 0.88;
		els = els.filter(function (el) { return el.getBoundingClientRect().top > seuil; });
		if (!els.length) return;

		els.forEach(function (el) { el.classList.add('f8-rev', 'f8-rev-off'); });

		var vu = new IntersectionObserver(function (entrees) {
			entrees.forEach(function (e) {
				if (!e.isIntersecting) return;
				var el = e.target;
				/* Le décalage est calculé au moment où le groupe entre dans
				   l'écran, pas sur l'index global : sur une liste de 60
				   cartes, un index global donnerait 3 secondes d'attente à
				   la dernière. Plafonné à 6 crans. */
				var i = Math.min(6, parseInt(el.getAttribute('data-f8-i') || '0', 10));
				el.style.transitionDelay = (i * 55) + 'ms';
				el.classList.remove('f8-rev-off');
				vu.unobserve(el);
				/* Le délai est retiré une fois l'animation finie, sinon il
				   ralentirait tous les survols suivants sur la même carte. */
				window.setTimeout(function () { el.style.transitionDelay = ''; }, 900);
			});
		}, { rootMargin: '0px 0px -8% 0px', threshold: 0.02 });

		var dernierY = -9999, rang = 0;
		els.forEach(function (el) {
			var y = Math.round(el.getBoundingClientRect().top);
			rang = (Math.abs(y - dernierY) < 40) ? rang + 1 : 0;   /* même rangée */
			dernierY = y;
			el.setAttribute('data-f8-i', rang);
			vu.observe(el);
		});
	}

	/* ---------------------------------------------------------------- */
	/* 3. compteurs                                                      */
	/* ---------------------------------------------------------------- */

	/* Le texte affiché est la référence : on le décompose au lieu de
	   relire la donnée. « 1 611 » est écrit avec une espace insécable en
	   français et une virgule en anglais — on réutilise le séparateur
	   trouvé plutôt que d'en choisir un, sinon le compteur finirait sur
	   un format différent de celui rendu par le serveur. */
	function decompose(txt) {
		/* Les séparateurs possibles sont écrits en échappement explicite :
		   l'espace insécable et l'espace fine insécable sont invisibles dans
		   le source et se perdent au premier copier-coller du fichier. */
		var SEP = '\\u00a0\\u202f ,.';
		var m = txt.match(new RegExp('^(\\D*?)((?:\\d[\\d' + SEP + ']*)?\\d|\\d)(\\D*)$'));
		if (!m) return null;
		var brut = m[2];
		if (/[.,]\d{1,2}$/.test(brut)) return null;      /* un décimal : on n'y touche pas */
		var sep = (brut.match(new RegExp('[' + SEP + ']')) || [''])[0];
		var n = parseInt(brut.replace(/[^\d]/g, ''), 10);
		if (!isFinite(n) || n < 10) return null;         /* sous 10, compter n'apporte rien */
		return { avant: m[1], apres: m[3], sep: sep, n: n };
	}

	function grouper(n, sep) {
		var s = String(n);
		if (!sep) return s;
		return s.replace(/\B(?=(\d{3})+(?!\d))/g, sep);
	}

	function compteurs() {
		if (doux || !('IntersectionObserver' in window)) return;
		var els = [].slice.call(racine.querySelectorAll('.f8-chiffres b, .f8-pmes-c b'));
		if (!els.length) return;

		var vu = new IntersectionObserver(function (entrees) {
			entrees.forEach(function (e) {
				if (!e.isIntersecting) return;
				var el = e.target;
				vu.unobserve(el);
				var d = decompose(el.textContent.trim());
				if (!d) return;

				/* La largeur est figée avant de compter : sans ça, passer de
				   « 1 » à « 1 611 » élargit la colonne pendant l'animation et
				   fait tressauter les trois voisines. */
				el.style.minWidth = el.getBoundingClientRect().width + 'px';
				el.style.display = 'inline-block';

				var t0 = null, duree = 900;
				function pas(t) {
					if (t0 === null) t0 = t;
					var p = Math.min(1, (t - t0) / duree);
					var e2 = 1 - Math.pow(1 - p, 3);            /* ralenti à la fin */
					el.textContent = d.avant + grouper(Math.round(d.n * e2), d.sep) + d.apres;
					if (p < 1) { window.requestAnimationFrame(pas); return; }
					/* On repose la chaîne d'origine, au caractère près : un
					   compteur qui finit sur SA propre mise en forme ferait
					   diverger l'affichage du rendu serveur. */
					el.textContent = d.avant + grouper(d.n, d.sep) + d.apres;
					el.style.minWidth = '';
					el.style.display = '';
				}
				window.requestAnimationFrame(pas);
			});
		}, { threshold: 0.4 });

		els.forEach(function (el) { vu.observe(el); });
	}

	/* ---------------------------------------------------------------- */
	/* 4. tracé des courbes de taux                                      */
	/* ---------------------------------------------------------------- */
	function courbes() {
		var svgs = [].slice.call(racine.querySelectorAll('.f8-sp'));
		if (!svgs.length) return;
		if (doux || !('IntersectionObserver' in window)) return;

		var vu = new IntersectionObserver(function (entrees) {
			entrees.forEach(function (e) {
				if (!e.isIntersecting) return;
				var svg = e.target;
				vu.unobserve(svg);
				var l = svg.querySelector('.f8-sp-l');
				/* getTotalLength n'existe pas sur tous les moteurs pour un
				   polyline ; sans longueur exacte on n'anime pas plutôt que
				   d'animer avec une valeur fausse, qui donnerait un trait
				   coupé net en fin de course. */
				if (!l || typeof l.getTotalLength !== 'function') return;
				var len = 0;
				try { len = l.getTotalLength(); } catch (err) { return; }
				if (!len || !isFinite(len)) return;
				svg.style.setProperty('--f8-sp-len', Math.ceil(len + 2));
				svg.classList.add('f8-sp-anim');
			});
		}, { threshold: 0.25 });

		svgs.forEach(function (s) { vu.observe(s); });
	}

	/* ---------------------------------------------------------------- */
	/* 5. mise en évidence des résultats du simulateur                   */
	/* ---------------------------------------------------------------- */
	/* taux.js réécrit tout le bloc de résultats à chaque frappe. On ne
	   touche pas à son code : on observe le conteneur et on marque ce
	   qui vient d'apparaître. Le calcul reste chez lui, l'effet reste
	   ici — les deux fichiers ne partagent aucune variable. */
	function simulateur() {
		if (doux || !('MutationObserver' in window)) return;
		var bac = document.getElementById('f8-simr');
		if (!bac) return;
		new MutationObserver(function () {
			[].slice.call(bac.querySelectorAll('.f8-simv')).forEach(function (el) {
				el.classList.remove('f8-maj');
				void el.offsetWidth;               /* redémarre l'animation CSS */
				el.classList.add('f8-maj');
			});
		}).observe(bac, { childList: true });
	}

	/* Un effet qui casse ne doit pas emporter les autres NI disparaitre en
	   silence : une erreur avalee sans un mot, c'est une animation morte que
	   personne ne remarque avant le client. */
	function rate(quoi, e) {
		if (window.console && console.warn) console.warn('8funder/vue : ' + quoi + ' — ' + e);
	}

	function demarrer() {
		try { titre(); } catch (e) { rate('titre', e); }
		try { jauge(); } catch (e) { rate('jauge', e); }
		try { apparitions(); } catch (e) { rate('apparitions', e); }
		try { compteurs(); } catch (e) { rate('compteurs', e); }
		try { courbes(); } catch (e) { rate('courbes', e); }
		try { simulateur(); } catch (e) { rate('simulateur', e); }
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', demarrer);
	} else {
		demarrer();
	}
})();
