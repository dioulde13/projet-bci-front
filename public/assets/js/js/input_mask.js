$(document).ready(function () {
  // Fonction pour appliquer un masque avec vérification d'existence
  function applyMask(selector, mask, options = {}) {
    var elements = $(selector);
    if (elements.length === 0) {
      console.warn(`Aucun élément trouvé pour le sélecteur : ${selector}`);
      return;
    }
    try {
      elements.mask(mask, options);
    } catch (error) {
      console.error(`Erreur lors de l'application du masque pour ${selector} :`, error);
    }
  }

  // Application des masques avec vérification préalable
  applyMask('.date', '00/00/0000');
  applyMask('.heures', '0000 heures', { reverse: true });
  applyMask('.time', '00:00:00');
  applyMask('.date_time', '00/00/0000 00:00:00');
  applyMask('.cep', '00000-000');
  applyMask('.numero_compte', '0000000000');
  applyMask('.phone', '+224 600 00 00 00');
  applyMask('.phone_with_ddd', '(00) 0000-0000');
  applyMask('.phone_us', '(000) 000-0000');
  applyMask('.mixed', 'AAA 000-S0S');
  applyMask('.cpf', '000.000.000-00', { reverse: true });
  applyMask('.cnpj', '00.000.000/0000-00', { reverse: true });
  applyMask('.money', '0 000 000 000 GNF', { reverse: true });
  applyMask('.money2', '#.##0,00', { reverse: true });
  applyMask('.money3', '0 000 000 000', { reverse: true });
  applyMask('.percent', '##0,00%', { reverse: true });
  applyMask('.clear-if-not-match', '00/00/0000', { clearIfNotMatch: true });
  applyMask('.placeholder', '00/00/0000', { placeholder: '__/__/____' });
  applyMask('.fallback', '00r00r0000', {
    translation: {
      'r': { pattern: /[\\/]/, fallback: '/' }
    },
  });
});
