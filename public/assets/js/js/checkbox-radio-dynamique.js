document.addEventListener('DOMContentLoaded', function() {
    // Sélection des éléments du DOM
    var collapseElement = document.getElementById('transferer-PlusTard');
    var transferLater = document.getElementById('transferLater');
    var transferNow = document.getElementById('transferNow');

    // Vérifications d'existence des éléments
    if (!collapseElement || !transferLater || !transferNow) {
        console.warn("Certains éléments requis sont manquants dans le DOM.");
        return;
    }

    // Événement pour le choix "Transferer Plus Tard"
    transferLater.addEventListener('change', function() {
        if (transferLater.checked) {
            var collapseInstance = new bootstrap.Collapse(collapseElement, { toggle: false });
            collapseInstance.show();
        }
    });

    // Événement pour le choix "Transferer Maintenant"
    transferNow.addEventListener('change', function() {
        var collapseInstance = bootstrap.Collapse.getInstance(collapseElement);
        if (transferNow.checked && collapseInstance) {
            collapseInstance.hide();
        }
    });
});
