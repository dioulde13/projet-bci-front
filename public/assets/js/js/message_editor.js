/*============================================================
Messages Editor
=============================================================*/

// Fonction pour initialiser ClassicEditor avec vérification d'existence
function initClassicEditor(selector) {
    var element = document.querySelector(selector);
    if (!element) {
        console.warn(`L'élément ${selector} est introuvable. L'éditeur ne peut pas être initialisé.`);
        return;
    }

    ClassicEditor
        .create(element, { language: 'fr' })
        .then(function (editor) {
            editor.ui.view.editable.element.style.height = '200px';
            console.log(`Éditeur initialisé avec succès pour ${selector}.`);
        })
        .catch(function (error) {
            console.error(`Erreur lors de l'initialisation de l'éditeur pour ${selector} :`, error);
        });
}

// Liste des sélecteurs d'éditeurs à initialiser
const editorsSelectors = ['#email-editor', '#commentaires', '#detailsCorrection'];

// Initialisation des éditeurs avec vérification
editorsSelectors.forEach(initClassicEditor);
