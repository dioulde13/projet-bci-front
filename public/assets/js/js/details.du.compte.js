// Référence à l'élément select, input texte et div d'infoducomptermations
const selectElement = document.getElementById('accountSelect');
const accountName = document.getElementById('accountName');
const infoducompteCompte1 = document.getElementById('infoducompteCompte1');
const infoducompteCompte2 = document.getElementById('infoducompteCompte2');

// Fonction pour afficher les infoducomptermations et remplir l'input texte en fonction de la sélection
selectElement.addEventListener('change', function () {
    // Masquer toutes les div d'infoducomptermations
    document.querySelectorAll('.infoducompte').forEach(infoducompte => infoducompte.style.display = 'none');

    // Afficher les infoducomptermations et mettre à jour le nom du compte selon l'option sélectionnée
    if (this.value === 'compte1') {
        infoducompteCompte1.style.display = 'block';
        accountName.value = 'CPTES COURANTS - SOCIETES'; // Modifier le nom selon vos besoins
    } else if (this.value === 'compte2') {
        infoducompteCompte2.style.display = 'block';
        accountName.value = 'CPTES COURANTS INTERIMAIRE'; // Modifier le nom selon vos besoins
    }
});

// Afficher les infoducomptermations du Compte 1 et remplir l'input texte par défaut
document.addEventListener('DOMContentLoaded', function () {
    infoducompteCompte1.style.display = 'block';
    accountName.value = 'CPTES COURANTS - SOCIETES'; // Modifier le nom selon vos besoins
});