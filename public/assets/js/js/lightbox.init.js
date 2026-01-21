// Fonction pour initialiser une lightbox avec vérification d'existence
function initLightbox(selector, options = {}) {
    var elements = document.querySelectorAll(selector);
    if (elements.length === 0) {
        console.warn(`Aucun élément trouvé pour le sélecteur : ${selector}`);
        return;
    }
    try {
        GLightbox(Object.assign({ selector: selector }, options));
        console.log(`Lightbox initialisée avec succès pour ${selector}.`);
    } catch (error) {
        console.error(`Erreur lors de l'initialisation de la lightbox pour ${selector} :`, error);
    }
}

// Liste des configurations de lightboxes à initialiser
const lightboxConfigs = [
    { selector: '.image-popup', options: { title: false } },
    { selector: '.image-popup-desc', options: {} },
    { selector: '.image-popup-video-map', options: { title: false } },
];

// Initialisation des lightboxes avec vérification
lightboxConfigs.forEach(config => initLightbox(config.selector, config.options));
