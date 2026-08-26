/* Simulateur de mensualite, assis sur le taux preferentiel du jour.

   Le taux vient de PHP (F8T.prime), qui le lit lui-meme du relevé de la Banque
   du Canada. Il n'y a AUCUNE valeur de repli codee ici : si le taux n'a pas pu
   etre lu, le gabarit n'affiche pas le simulateur du tout. Un taux invente
   donnerait une mensualite fausse, presentee avec la meme assurance qu'une
   vraie. */
(function () {
	'use strict';
	if (typeof F8T === 'undefined' || F8T.prime === null) return;

	/* wp_localize_script convertit TOUT en chaine : F8T.prime arrive en "4.45",
	   pas en 4.45. Sans cette conversion, prime + ecart concatene au lieu
	   d'additionner — la page affichait « 4.451.5 % » et la mensualite sortait
	   a NaN. Le cas ecart = 0 passait par hasard, parce que la division qui
	   suit reconvertit la chaine : un seul test l'aurait declare bon. */
	var PRIME = parseFloat(F8T.prime);
	if (isNaN(PRIME)) return;

	var T = F8T.textes, EN = F8T.lang === 'en';
	var LOC = EN ? 'en-CA' : 'fr-CA';

	var montant = document.getElementById('sim-montant');
	var duree   = document.getElementById('sim-duree');
	var ecart   = document.getElementById('sim-ecart');
	var sortie  = document.getElementById('f8-simr');
	if (!montant || !duree || !ecart || !sortie) return;

	/* La barre de répartition capital / intérêts. Elle est facultative :
	   si le gabarit ne la contient pas (une version plus ancienne du
	   modèle, par exemple), le simulateur continue de fonctionner. */
	var part = document.getElementById('f8-simpart');
	var pCap = document.getElementById('f8-simcap');
	var pInt = document.getElementById('f8-simint');
	var pLeg = document.getElementById('f8-simleg');
	var barreOk = !!(part && pCap && pInt && pLeg);

	function argent(v) {
		return v.toLocaleString(LOC, { style: 'currency', currency: 'CAD',
		                               maximumFractionDigits: 0 });
	}
	function pourcent(v) {
		return v.toLocaleString(LOC, { minimumFractionDigits: 2,
		                               maximumFractionDigits: 2 }) + ' %';
	}

	/* Mensualite a taux constant. Le cas taux nul est traite a part : la
	   formule divise par (1 - (1+i)^-n), qui vaut 0 quand i vaut 0. */
	function mensualite(capital, mois, annuel) {
		var i = annuel / 100 / 12;
		if (Math.abs(i) < 1e-9) return capital / mois;
		return capital * i / (1 - Math.pow(1 + i, -mois));
	}

	function calculer() {
		var c = parseFloat(montant.value);
		var n = parseInt(duree.value, 10);
		var e = parseFloat(ecart.value);
		if (isNaN(e)) e = 0;

		sortie.textContent = '';
		if (!(c > 0) || !(n > 0)) {
			var p = document.createElement('p');
			p.className = 'f8-siminv';
			p.textContent = T.invalide;
			sortie.appendChild(p);
			if (barreOk) part.hidden = true;
			return;
		}

		var taux = PRIME + e;
		var m    = mensualite(c, n, taux);
		var tot  = m * n;

		[[T.taux_eff, pourcent(taux)],
		 [T.mensualite, argent(m)],
		 [T.total, argent(tot)],
		 [T.interets, argent(tot - c)]].forEach(function (paire, idx) {
			var d = document.createElement('div');
			d.className = 'f8-simc' + (idx === 1 ? ' f8-simc-fort' : '');
			var k = document.createElement('span');
			k.className = 'f8-simk';
			k.textContent = paire[0];
			var v = document.createElement('strong');
			v.className = 'f8-simv';
			v.textContent = paire[1];
			d.appendChild(k);
			d.appendChild(v);
			sortie.appendChild(d);
		});

		barre(c, tot);
	}

	/* Ce que la barre montre : sur tout ce que l'emprunteur versera, la
	   part qui rembourse le capital et la part qui paie la banque. Les
	   deux largeurs viennent des mêmes nombres que les cases au-dessus —
	   pas d'un second calcul qui pourrait diverger du premier. */
	function barre(capital, total) {
		if (!barreOk) return;
		var interets = total - capital;
		/* Un écart assez négatif rend un taux si bas que le total peut
		   passer sous le capital. Une largeur négative ne se dessine pas :
		   on retire la barre plutôt que d'en montrer une fausse. */
		if (!(total > 0) || interets <= 0) { part.hidden = true; return; }

		var pc = capital / total * 100;
		pCap.style.width = pc.toFixed(2) + '%';
		pInt.style.width = (100 - pc).toFixed(2) + '%';

		pLeg.textContent = '';
		[['f8-lcap', T.part_cap, capital, pc],
		 ['f8-lint', T.part_int, interets, 100 - pc]].forEach(function (l) {
			var s = document.createElement('span');
			var i = document.createElement('i');
			i.className = l[0];
			var b = document.createElement('b');
			b.textContent = argent(l[2]);
			s.appendChild(i);
			s.appendChild(document.createTextNode(l[1] + ' '));
			s.appendChild(b);
			s.appendChild(document.createTextNode(' · ' + Math.round(l[3]) + ' %'));
			pLeg.appendChild(s);
		});
		part.hidden = false;
	}

	[montant, duree, ecart].forEach(function (e) {
		e.addEventListener('input', calculer);
		e.addEventListener('change', calculer);
	});
	calculer();
})();
