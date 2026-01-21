/*===============================================================================
Form Validation
=================================================================================*/

// Pour désactiver les soumissions de formulaires s'il y a des champs invalides
(function () {
	'use strict';

	window.addEventListener('load', function () {
		// Récupère tous les formulaires auxquels nous souhaitons appliquer des styles de validation
		var forms = document.getElementsByClassName('a-besoin-d-une-validation');

		if (forms.length === 0) {
			console.warn("Aucun formulaire trouvé avec la classe 'a-besoin-d-une-validation'.");
			return;
		}

		// Boucle sur les formulaires et empêche la soumission si le formulaire n'est pas valide
		Array.prototype.forEach.call(forms, function (form) {
			form.addEventListener('submit', function (event) {
				if (form.checkValidity() === false) {
					event.preventDefault();
					event.stopPropagation();
					alert("Veuillez corriger les erreurs dans le formulaire avant de soumettre."); // Message explicite à l'utilisateur
				}
				form.classList.add('was-validated');
			}, false);
		});
	}, false);
})();



/*=============================================================================
Button
==============================================================================*/

$(".hBack").on("click", function (e) {
	e.preventDefault();
	window.history.back();
});