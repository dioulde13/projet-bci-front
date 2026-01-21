/*=========================================================================
Table Row Link JS
=========================================================================*/

document.addEventListener('DOMContentLoaded', function () {
  // Sélectionne les lignes du tableau avec la classe 'link-table'
  document.querySelectorAll('table.link-table tbody tr').forEach(function (row) {
    const link = row.getAttribute('data-link');

    // Vérification de l'existence de l'attribut 'data-link'
    if (!link) {
      console.warn("L'attribut 'data-link' est manquant pour cette ligne de tableau.");
      return;
    }

    // Transforme les cellules spécifiques en liens
    row.querySelectorAll('td').forEach((cell, index) => {
      // Ignore la première cellule et celles avec la classe 'no-link'
      if (index > 0 && index < 11 && !cell.classList.contains('no-link')) {
        try {
          const a = document.createElement('a');
          a.href = link;
          a.target = '_parent';
          a.textContent = cell.textContent;
          a.classList.add('no-link-style'); // Conserve le style du texte
          cell.textContent = '';
          cell.appendChild(a);
        } catch (error) {
          console.error("Erreur lors de la transformation de la cellule en lien :", error);
        }
      }
    });
  });
});
