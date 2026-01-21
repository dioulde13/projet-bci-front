/*
==========================================================================
BCI-Online : Payez en masse, économisez en temps.
==========================================================================
Copyright 2024 MV1
Website: https://mv1.ecash-guinee.com
Contact: contact@mv1.ecash-guinee.com
========================================================================== */

// Fonction pour obtenir un tableau de couleurs à partir de la chaîne `data-colors`
function getChartColorsArray(chartId) {
    var element = $(chartId);

    // Vérification de l'existence de l'élément
    if (element.length === 0) {
        console.warn(`L'élément avec l'ID ${chartId} est introuvable.`);
        return [];
    }

    var colors = element.attr('data-colors');

    // Vérification de l'existence et du format de l'attribut `data-colors`
    if (!colors) {
        console.warn(`L'attribut 'data-colors' est manquant pour l'élément ${chartId}.`);
        return [];
    }

    try {
        var colorsArray = JSON.parse(colors);
        return colorsArray.map(function (value) {
            var newValue = value.replace(' ', '');
            if (newValue.indexOf('--') !== -1) {
                var color = getComputedStyle(document.documentElement).getPropertyValue(newValue);
                return color ? color.trim() : newValue;
            } else {
                return newValue;
            }
        });
    } catch (error) {
        console.error("Erreur lors du parsing de 'data-colors' :", error);
        return [];
    }
}


