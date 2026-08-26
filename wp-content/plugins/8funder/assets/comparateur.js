/* Comparateur 8funder — filtre les 1 611 programmes dans le navigateur et en
   met jusqu'a trois cote a cote.

   L'index est charge une fois (data/comparateur.json) puis tout se passe en
   memoire : aucun aller-retour serveur, le compteur suit la frappe.

   Les types et les secteurs sont des MASQUES DE BITS, dans le meme ordre que
   tools/index-comparateur.py. Le fichier porte les trois vocabulaires avec lui
   pour que l'ordre soit lu et jamais suppose. */
(function () {
	'use strict';
	if (typeof F8C === 'undefined') return;

	var T = F8C.textes, EN = F8C.lang === 'en';
	var D = null, choisis = [];
	var $ = function (s) { return document.querySelector(s); };

	var liste  = $('#f8-cliste');
	var compte = $('#f8-ccount');
	var bac    = $('#f8-cbac');
	if (!liste) return;

	/* Les colonnes de l'index, nommees une fois pour ne pas semer des [7] et
	   des [11] dans tout le fichier. */
	var SLUG = 0, TFR = 1, TEN = 2, OFR = 3, OEN = 4, NIV = 5, PROV = 6,
	    TYP = 7, SEC = 8, RFR = 9, REN = 10, UFR = 11, UEN = 12;

	function titre(p)  { return EN ? p[TEN] : p[TFR]; }
	function orga(p)   { return D.orgs[EN ? p[OEN] : p[OFR]]; }
	function resume(p) { return EN ? p[REN] : p[RFR]; }
	function lien(p)   { return EN ? p[UEN] : p[UFR]; }

	function txt(s) { return document.createTextNode(s); }
	function el(tag, cls, contenu) {
		var e = document.createElement(tag);
		if (cls) e.className = cls;
		if (contenu !== undefined && contenu !== null) e.appendChild(txt(String(contenu)));
		return e;
	}

	/* -------------------------------------------------------------- */
	/* Filtrage                                                        */
	/* -------------------------------------------------------------- */

	function sansAccent(s) {
		/* Chercher « quebec » doit trouver « Québec ». normalize('NFD') separe
		   la lettre de son accent, et on jette les accents. */
		return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
	}

	var critere = { prov: '', sect: '', type: '', niv: '', mot: '' };

	function retenus() {
		var iT = critere.type ? D.types.indexOf(critere.type) : -1;
		var iS = critere.sect ? D.secteurs.indexOf(critere.sect) : -1;
		var iN = critere.niv  ? D.niveaux.indexOf(critere.niv)   : -1;
		var mot = critere.mot ? sansAccent(critere.mot) : '';
		var out = [];

		for (var i = 0; i < D.progs.length; i++) {
			var p = D.progs[i];

			/* Une province vide veut dire « pancanadien » : ces programmes
			   s'appliquent PARTOUT, donc ils restent quand on choisit une
			   province. Les exclure ferait disparaitre 812 programmes sur
			   1 611 des que quelqu'un clique sur sa province. */
			if (critere.prov && p[PROV] && p[PROV] !== critere.prov) continue;
			if (iT >= 0 && !(p[TYP] & (1 << iT))) continue;
			/* Idem pour un secteur non renseigne : le programme est ouvert a
			   tous les secteurs, pas ferme a tous. */
			if (iS >= 0 && p[SEC] !== 0 && !(p[SEC] & (1 << iS))) continue;
			if (iN >= 0 && p[NIV] !== iN) continue;
			if (mot && sansAccent(titre(p) + ' ' + orga(p)).indexOf(mot) < 0) continue;
			out.push(p);
		}
		return out;
	}

	/* -------------------------------------------------------------- */
	/* Rendu de la liste                                               */
	/* -------------------------------------------------------------- */

	var MAX_AFFICHE = 60;

	function etiquettes(p) {
		var out = [];
		for (var i = 0; i < D.types.length; i++) {
			if (p[TYP] & (1 << i)) out.push(D.types[i]);
		}
		return out;
	}

	function nomType(cle) { return (F8C.libelles && F8C.libelles.types && F8C.libelles.types[cle]) || cle; }
	function nomSect(cle) { return (F8C.libelles && F8C.libelles.secteurs && F8C.libelles.secteurs[cle]) || cle; }
	function nomNiv(i)    { return (F8C.libelles && F8C.libelles.niveaux && F8C.libelles.niveaux[D.niveaux[i]]) || D.niveaux[i]; }
	function nomProv(c)   { return (F8C.libelles && F8C.libelles.provinces && F8C.libelles.provinces[c]) || c; }

	function ligne(p) {
		var art = el('article', 'f8-cart');
		art.setAttribute('data-slug', p[SLUG]);

		var h = el('h3');
		var a = el('a', null, titre(p));
		a.href = F8C.base + p[SLUG] + '/';
		h.appendChild(a);
		art.appendChild(h);

		art.appendChild(el('p', 'f8-corg', orga(p)));

		var meta = el('p', 'f8-cmeta');
		meta.appendChild(el('span', 'f8-cniv', nomNiv(p[NIV])));
		meta.appendChild(el('span', 'f8-cprov', p[PROV] ? nomProv(p[PROV]) : T.canada));
		etiquettes(p).forEach(function (t) {
			meta.appendChild(el('span', 'f8-ctyp', nomType(t)));
		});
		art.appendChild(meta);

		if (resume(p)) art.appendChild(el('p', 'f8-cres', resume(p)));

		var b = el('button', 'f8-cbtn');
		b.type = 'button';
		var dedans = choisis.indexOf(p[SLUG]) >= 0;
		b.textContent = dedans ? T.retirer : T.comparer;
		if (dedans) b.classList.add('f8-cbtn-on');
		b.addEventListener('click', function () { bascule(p[SLUG]); });
		art.appendChild(b);

		return art;
	}

	function dessiner() {
		var r = retenus();

		compte.textContent = r.length === 1
			? T.compte_un.replace('%s', '1')
			: T.compte.replace('%s', r.length.toLocaleString(EN ? 'en-CA' : 'fr-CA'));

		liste.textContent = '';
		if (!r.length) {
			liste.appendChild(el('p', 'f8-cvide', T.aucun));
			return;
		}
		var frag = document.createDocumentFragment();
		for (var i = 0; i < Math.min(r.length, MAX_AFFICHE); i++) frag.appendChild(ligne(r[i]));
		liste.appendChild(frag);

		if (r.length > MAX_AFFICHE) {
			/* On ne cache pas la troncature : afficher 60 lignes sur 1 200 sans
			   le dire laisse croire que le filtre a tout trouve. */
			var reste = r.length - MAX_AFFICHE;
			liste.appendChild(el('p', 'f8-ctronq', EN
				? 'Showing the first ' + MAX_AFFICHE + ' of ' + r.length +
				  '. Narrow the filters to see the other ' + reste + '.'
				: 'Les ' + MAX_AFFICHE + ' premiers sur ' + r.length +
				  ' sont affichés. Affinez les filtres pour voir les ' + reste + ' autres.'));
		}
	}

	/* -------------------------------------------------------------- */
	/* La comparaison                                                  */
	/* -------------------------------------------------------------- */

	function parSlug(s) {
		for (var i = 0; i < D.progs.length; i++) if (D.progs[i][SLUG] === s) return D.progs[i];
		return null;
	}

	function bascule(slug) {
		var i = choisis.indexOf(slug);
		if (i >= 0) choisis.splice(i, 1);
		else if (choisis.length >= 3) { alerte(T.plein); return; }
		else choisis.push(slug);
		dessiner();
		comparer();
	}

	var minuteur = null;
	function alerte(m) {
		var z = $('#f8-calerte');
		if (!z) {
			z = el('p', 'f8-calerte');
			z.id = 'f8-calerte';
			z.setAttribute('role', 'status');
			compte.parentNode.insertBefore(z, compte.nextSibling);
		}
		z.textContent = m;
		clearTimeout(minuteur);
		minuteur = setTimeout(function () { z.textContent = ''; }, 4000);
	}

	function comparer() {
		/* Vider avant de decider : un tableau laisse en place derriere un
		   [hidden] reste interrogeable par querySelector et par les tests, et
		   on finit par mesurer un rendu qui n'est plus a l'ecran. */
		bac.textContent = '';
		if (!choisis.length) { bac.hidden = true; return; }
		bac.hidden = false;

		var ps = choisis.map(parSlug).filter(Boolean);

		var tete = el('div', 'f8-cbtete');
		tete.appendChild(el('h2', null, T.comparer + ' (' + ps.length + '/3)'));
		var vider = el('button', 'f8-cvider', T.vider);
		vider.type = 'button';
		vider.addEventListener('click', function () { choisis = []; dessiner(); comparer(); });
		tete.appendChild(vider);
		bac.appendChild(tete);

		var wrap = el('div', 'f8-tw');
		var tb = el('table', 'f8-tt f8-ctab');

		var thead = el('thead'), tr = el('tr');
		tr.appendChild(el('th', 'f8-ccoin'));
		ps.forEach(function (p) {
			var th = el('th');
			th.scope = 'col';
			var a = el('a', null, titre(p));
			a.href = F8C.base + p[SLUG] + '/';
			th.appendChild(a);
			tr.appendChild(th);
		});
		thead.appendChild(tr);
		tb.appendChild(thead);

		var tbody = el('tbody');

		function rang(libelle, valeurs, cls) {
			var l = el('tr', cls || null);
			var th = el('th', null, libelle);
			th.scope = 'row';
			l.appendChild(th);
			valeurs.forEach(function (v) {
				var td = el('td');
				if (v && v.nodeType) td.appendChild(v); else td.appendChild(txt(v || '—'));
				l.appendChild(td);
			});
			tbody.appendChild(l);
		}

		rang(T.organisme, ps.map(orga));
		rang(T.niveau,    ps.map(function (p) { return nomNiv(p[NIV]); }));
		rang(T.portee,    ps.map(function (p) { return p[PROV] ? nomProv(p[PROV]) : T.canada; }));
		rang(T.formes,    ps.map(function (p) {
			return etiquettes(p).map(nomType).join(', ');
		}));
		rang(T.secteurs,  ps.map(function (p) {
			var out = [];
			for (var i = 0; i < D.secteurs.length; i++) if (p[SEC] & (1 << i)) out.push(nomSect(D.secteurs[i]));
			return out.length ? out.join(', ') : T.tous;
		}));
		rang(T.resume,    ps.map(resume), 'f8-cres-r');
		rang(T.officiel,  ps.map(function (p) {
			var u = lien(p);
			if (!u) return '—';
			var a = el('a', null, T.officiel);
			a.href = u; a.rel = 'nofollow noopener'; a.target = '_blank';
			return a;
		}));

		tb.appendChild(tbody);
		wrap.appendChild(tb);
		bac.appendChild(wrap);
	}

	/* -------------------------------------------------------------- */
	/* Demarrage                                                       */
	/* -------------------------------------------------------------- */

	function brancher() {
		var champs = { 'cf-prov': 'prov', 'cf-sect': 'sect', 'cf-type': 'type',
		               'cf-niv': 'niv', 'cf-mot': 'mot' };
		Object.keys(champs).forEach(function (id) {
			var e = document.getElementById(id);
			if (!e) return;
			var ev = e.tagName === 'SELECT' ? 'change' : 'input';
			e.addEventListener(ev, function () {
				critere[champs[id]] = e.value.trim();
				dessiner();
			});
		});
	}

	fetch(F8C.index, { credentials: 'same-origin' })
		.then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
		.then(function (j) {
			D = j;
			brancher();
			dessiner();
			comparer();
		})
		.catch(function () { compte.textContent = T.erreur; });
})();
