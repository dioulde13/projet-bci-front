// Exécution du script une fois le DOM chargé
document.addEventListener('DOMContentLoaded', function () {
    const paymentOption = document.getElementById('paymentOption');
    const factureInput = document.getElementById('factureInput');
    const abonnementInput = document.getElementById('abonnementInput');
    const factureDetails = document.getElementById('factureDetails');
    const factureList = document.getElementById('factureList');
    const alertContainer = document.getElementById('alertContainer');

    // Affiche les champs en fonction de l'option sélectionnée
    paymentOption.addEventListener('change', () => {
        clearAlert(); // Efface les alertes précédentes
        const selectedOption = paymentOption.value;
        factureInput.classList.toggle('d-none', selectedOption !== 'facture');
        abonnementInput.classList.toggle('d-none', selectedOption !== 'abonnement');
        clearFactureDetails(); // Efface les détails affichés si l'option change
    });

    // Vérifie le numéro de facture
    document.getElementById('factureNumber').addEventListener('input', () => {
        const factureNumber = document.getElementById('factureNumber').value;
        if (factureNumber.match(/^\d{13}$/)) {
            checkFacture(factureNumber);
        } else {
            clearFactureDetails();
        }
    });

    // Vérifie le numéro d'abonnement
    document.getElementById('abonnementNumber').addEventListener('input', () => {
        const abonnementNumber = document.getElementById('abonnementNumber').value;
        if (abonnementNumber.match(/^\d{9,10}$/)) {
            checkAbonnement(abonnementNumber);
        } else {
            clearFactureDetails();
        }
    });

    // Fonction pour afficher une alerte Bootstrap
    function showAlert(message, type = 'danger') {
        clearAlert();
        const alert = document.createElement('div');
        alert.className = `alert alert-${type} alert-dismissible fade show`;
        alert.role = 'alert';
        alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        alertContainer.appendChild(alert);
    }

    // Fonction pour effacer l'alerte
    function clearAlert() {
        alertContainer.innerHTML = '';
    }

    // Fonction pour vérifier les factures impayées via le numéro de facture
    function checkFacture(factureNumber) {
        const validFactures = {
            '0000123456723': { facture: '0000123456723', date: '01/09/2024', montant: '400 000 GNF' },
            '0000987654321': { facture: '0000987654321', date: '05/08/2024', montant: '300 000 GNF' },
            '0001122334455': { facture: '0001122334455', date: '15/07/2024', montant: '200 000 GNF' }
        };

        if (validFactures[factureNumber]) {
            showFactureDetails([validFactures[factureNumber]]);
        } else {
            showAlert('Aucune facture impayée trouvée pour ce numéro de facture.', 'warning');
            clearFactureDetails();
        }
    }

    // Fonction pour vérifier les factures impayées via le numéro d'abonnement
    function checkAbonnement(abonnementNumber) {
        const validAbonnements = {
            '1100456789': [
                { facture: '0100123456723', date: '01/08/2024', montant: '400 000 GNF' },
                { facture: '0200123456723', date: '01/07/2024', montant: '500 000 GNF' }
            ],
            '1200456789': [
                { facture: '0300123456723', date: '01/06/2024', montant: '1 300 000 GNF' }
            ],
            '1300456789': [
                { facture: '0400123456723', date: '01/05/2024', montant: '600 000 GNF' },
                { facture: '0500123456723', date: '01/04/2024', montant: '700 000 GNF' },
                { facture: '0600123456723', date: '01/03/2024', montant: '800 000 GNF' }
            ]
        };

        if (validAbonnements[abonnementNumber]) {
            showFactureDetails(validAbonnements[abonnementNumber]);
        } else {
            showAlert('Aucune facture impayée trouvée pour ce numéro d\'abonnement.', 'warning');
            clearFactureDetails();
        }
    }

    // Affiche les détails des factures avec des cartes Bootstrap
    function showFactureDetails(factures) {
        factureList.innerHTML = factures.map(f => `
            <div class="col-lg-12">
                <div class="card bg-light">
                    <div class="row g-0 align-items-center">
                        <div class="col-sm-6 col-md-2 text-center"><svg class="text-primary custom-icon-size" xmlns="http://www.w3.org/2000/svg" viewBox="-64 0 512 512" width="1em" height="1em" fill="currentColor">
                                <!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License) Copyright 2023 Fonticons, Inc. -->
                                <path d="M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V160H256c-17.7 0-32-14.3-32-32V0H64zM256 0V128H384L256 0zM80 64h64c8.8 0 16 7.2 16 16s-7.2 16-16 16H80c-8.8 0-16-7.2-16-16s7.2-16 16-16zm0 64h64c8.8 0 16 7.2 16 16s-7.2 16-16 16H80c-8.8 0-16-7.2-16-16s7.2-16 16-16zm16 96H288c17.7 0 32 14.3 32 32v64c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V256c0-17.7 14.3-32 32-32zm0 32v64H288V256H96zM240 416h64c8.8 0 16 7.2 16 16s-7.2 16-16 16H240c-8.8 0-16-7.2-16-16s7.2-16 16-16z"></path>
                            </svg></div>
                        <div class="col-sm-6 col-md-10">
                            <div class="bg-body-secondary card-body">
                                <div class="row">
                                    <div class="col-sm-6">
                                        <div>
                                            <div class="mb-3">
                                                <h5 class="text-muted font-size-14 mb-0">Facture</h5>
                                                <p class="fw-semibold mb-1 font-size-15">${f.facture}</p>
                                            </div>
                                            <div class="mb-3">
                                                <h5 class="text-muted font-size-14 mb-0">Date</h5>
                                                <p class="fw-semibold mb-1 font-size-15">${f.date}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-sm-6">
                                        <div>
                                            <div class="mb-3">
                                                <h5 class="text-muted font-size-14 mb-0">Montant :</h5>
                                                <h4 class="fw-semibold mb-1">${f.montant}</h4>
                                            </div>
                                            <div class="mb-3">
                                                <div class="form-check form-switch form-switch-md mb-1" dir="ltr">
                                                    <input id="selectFacture${f.facture}" class="form-check-input" type="checkbox" value="${f.facture}" />
                                                    <label class="form-check-label" for="selectFacture${f.facture}">Sélectionner</label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
        factureDetails.classList.remove('d-none');
    }

    // Fonction pour effacer les détails des factures
    function clearFactureDetails() {
        factureDetails.classList.add('d-none');
        factureList.innerHTML = '';
    }

    // Fonction pour traiter le paiement
    window.processPayment = function () {
        const selectedFactures = document.querySelectorAll('#factureList input[type="checkbox"]:checked');
        if (selectedFactures.length === 0) {
            showAlert('Veuillez sélectionner au moins une facture pour procéder au paiement.', 'danger');
            return;
        }
        const factures = Array.from(selectedFactures).map(f => f.value);
        showAlert(`Vous avez sélectionné les factures : ${factures.join(', ')} pour le paiement.`, 'success');
    }

    // Fonction pour annuler
    window.cancelPayment = function () {
        clearFactureDetails();
        clearAlert();
    }
});