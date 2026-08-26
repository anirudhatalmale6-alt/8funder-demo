/* 8funder — le strict nécessaire. Tout fonctionne sans JavaScript : les
   filtres sont un formulaire GET, le diagnostic aussi. Ce fichier ne fait
   qu'éviter des clics. */
(function () {
	'use strict';

	/* Changer un filtre soumet le formulaire : on garde le bouton pour ceux qui
	   n'ont pas JS, mais on ne les oblige pas à cliquer deux fois. */
	var form = document.querySelector('.f8-filters');
	if (form) {
		form.querySelectorAll('select').forEach(function (s) {
			s.addEventListener('change', function () { form.submit(); });
		});
	}

	/* Après un envoi, on remonte au message plutôt que de laisser l'utilisateur
	   chercher s'il s'est passé quelque chose. */
	var ok = document.querySelector('.f8-ok, .f8-ko');
	if (ok && location.search.indexOf('f8sent=') !== -1) {
		ok.scrollIntoView({ block: 'center' });
	}
})();
