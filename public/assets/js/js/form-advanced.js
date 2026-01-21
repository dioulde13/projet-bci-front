// Initialisation du plugin Choices.js pour les éléments avec l'attribut data-trigger
document.addEventListener('DOMContentLoaded', function () {
    var genericExamples = document.querySelectorAll('[data-trigger]');

    // Vérification et initialisation sécurisée de chaque élément
    genericExamples.forEach(function (element) {
        try {
            new Choices(element, {
                placeholderValue: 'Veuillez choisir dans la liste ...',
                searchPlaceholderValue: 'Rechercher...',
            });
        } catch (error) {
            console.error("Erreur lors de l'initialisation de Choices pour un élément :", error);
        }
    });

    // Initialisation d'un sélecteur avec des options spécifiques et sans recherche
    var singleNoSearchElement = document.getElementById('choices-single-no-search');
    if (singleNoSearchElement) {
        try {
            new Choices(singleNoSearchElement, {
                searchEnabled: false,
                removeItemButton: true,
                choices: [
                    { value: 'One', label: 'Label One' },
                    { value: 'Two', label: 'Label Two', disabled: true },
                    { value: 'Three', label: 'Label Three' },
                ],
            }).setChoices(
                [
                    { value: 'Four', label: 'Label Four', disabled: true },
                    { value: 'Five', label: 'Label Five' },
                    { value: 'Six', label: 'Label Six', selected: true },
                ],
                'value',
                'label',
                false
            );
        } catch (error) {
            console.error("Erreur lors de l'initialisation de Choices pour le sélecteur sans recherche :", error);
        }
    } else {
        console.warn("L'élément #choices-single-no-search est introuvable.");
    }

    // Initialisation des autres éléments Choices avec vérification préalable
    var singleNoSortingElement = document.getElementById('choices-single-no-sorting');
    if (singleNoSortingElement) {
        new Choices(singleNoSortingElement, { shouldSort: false });
    }

    var multipleCancelButtonElement = document.getElementById('choices-multiple-remove-button');
    if (multipleCancelButtonElement) {
        new Choices(multipleCancelButtonElement, { removeItemButton: true });
    }

    var multipleDefaultElement = document.getElementById('choices-multiple-groups');
    if (multipleDefaultElement) {
        new Choices(multipleDefaultElement);
    }

    var textRemoveElement = document.getElementById('choices-text-remove-button');
    if (textRemoveElement) {
        new Choices(textRemoveElement, {
            delimiter: ',',
            editItems: true,
            maxItemCount: 5,
            removeItemButton: true,
        });
    }

    var textUniqueValsElement = document.getElementById('choices-text-unique-values');
    if (textUniqueValsElement) {
        new Choices(textUniqueValsElement, {
            paste: false,
            duplicateItemsAllowed: false,
            editItems: true,
        });
    }

    var textDisabledElement = document.getElementById('choices-text-disabled');
    if (textDisabledElement) {
        new Choices(textDisabledElement, {
            addItems: false,
            removeItems: false,
        }).disable();
    }
});
