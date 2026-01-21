// Gestion du clic sur le bouton de téléchargement et de l'aperçu d'image
document.addEventListener('DOMContentLoaded', function () {
    var uploadButton = document.getElementById('uploadButton');
    var inputFile = document.getElementById('inputFile');
    var imagePreview = document.getElementById('imagePreview');

    // Vérification de l'existence des éléments
    if (!uploadButton || !inputFile || !imagePreview) {
        console.warn("Certains éléments requis pour le téléchargement et l'aperçu de l'image sont manquants.");
        return;
    }

    // Déclenche le clic sur l'input file masqué
    uploadButton.addEventListener('click', function () {
        inputFile.click();
    });

    // Gestion de l'événement de changement de fichier
    inputFile.addEventListener('change', function (event) {
        const file = event.target.files[0];

        // Vérifier si un fichier a été sélectionné
        if (!file) {
            console.warn("Aucun fichier sélectionné.");
            return;
        }

        // Vérification que le fichier est une image
        if (!file.type.startsWith('image/')) {
            alert("Veuillez sélectionner un fichier image.");
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            imagePreview.src = e.target.result;
        };

        // Gestion des erreurs de lecture
        reader.onerror = function () {
            console.error("Erreur lors de la lecture du fichier.");
            alert("Une erreur est survenue lors de la lecture du fichier.");
        };

        reader.readAsDataURL(file);
    });
});
