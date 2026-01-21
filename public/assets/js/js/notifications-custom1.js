/*==============================================================================
Alert Modal 1
================================================================================ */

document.addEventListener('DOMContentLoaded', function () {
  // Gestion des boutons de confirmation
  document.querySelectorAll('.confirm-button').forEach(function (button) {
    button.addEventListener('click', function () {
      var confirmLink = this.getAttribute('data-href');
      var confirmMessage = this.getAttribute('data-message');

      // Vérification des attributs nécessaires
      if (!confirmLink || !confirmMessage) {
        console.error("Les attributs 'data-href' ou 'data-message' sont manquants pour ce bouton.");
        return;
      }

      // Affichage du message de confirmation
      alertify.success(confirmMessage);

      // Redirection après un délai
      setTimeout(function () {
        window.location.href = confirmLink;
      }, 2000);
    });
  });

  // Gestion des boutons d'annulation
  document.querySelectorAll('.cancel-button').forEach(function (button) {
    button.addEventListener('click', function () {
      var cancelLink = this.getAttribute('data-href');
      var cancelMessage = this.getAttribute('data-message');

      // Vérification des attributs nécessaires
      if (!cancelLink || !cancelMessage) {
        console.error("Les attributs 'data-href' ou 'data-message' sont manquants pour ce bouton.");
        return;
      }

      // Affichage du message d'annulation
      alertify.error(cancelMessage);

      // Redirection après un délai
      setTimeout(function () {
        window.location.href = cancelLink;
      }, 2000);
    });
  });
});
