function convertCurrency() {
    // Sélectionner les éléments du DOM
    const amountInput = document.getElementById('amount');
    const fromCurrencyInput = document.getElementById('fromCurrency');
    const toCurrencyInput = document.getElementById('toCurrency');
    const resultElement = document.getElementById('conversionResult');

    // Vérification de l'existence des éléments requis
    if (!amountInput || !fromCurrencyInput || !toCurrencyInput || !resultElement) {
        console.error("Certains éléments requis pour la conversion de devises sont manquants.");
        alert("Une erreur est survenue, veuillez vérifier la présence des champs requis.");
        return;
    }

    const amount = parseFloat(amountInput.value);
    const fromCurrency = fromCurrencyInput.value;
    const toCurrency = toCurrencyInput.value;

    // Taux de change prédéfinis
    const exchangeRates = {
        'USD': { 'GNF': 8620.9707, 'EUR': 0.90243718 },
        'EUR': { 'GNF': 9553.7119, 'USD': 1.1081104 },
        'GNF': { 'USD': 0.00011599269, 'EUR': 0.00010469435 }
    };

    // Vérification du montant
    if (!amount || amount <= 0) {
        alert('Veuillez entrer un montant valide supérieur à zéro.');
        amountInput.focus();
        return;
    }

    // Récupération du taux de change
    const rate = exchangeRates[fromCurrency]?.[toCurrency];

    // Vérification du taux de change
    if (!rate) {
        alert('Taux de change non disponible pour cette conversion.');
        return;
    }

    // Calcul du montant converti et affichage du résultat
    const convertedAmount = amount * rate;
    resultElement.innerText = `Taux de change : ${convertedAmount.toFixed(2)} ${toCurrency}`;
}
