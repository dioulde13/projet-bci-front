// Fonction pour afficher ou masquer le champ de sélection de date
function toggleDateInput(show) {
    const dateInput = document.querySelector('.transfer-date');
    if (dateInput) {
        dateInput.style.display = show ? 'block' : 'none';
        dateInput.required = show;
    } else {
        console.warn("L'élément '.transfer-date' est introuvable.");
    }
}

// Fonction pour naviguer vers la page de récapitulatif depuis le formulaire initial
function goToRecap(paymentType) {
    const data = {
        paymentType: paymentType,
        accountNumber: document.querySelector('.account-number')?.value || '',
        accountName: document.querySelector('.account-name')?.value || '',
        beneficiaryEmail: document.querySelector('.beneficiary-email')?.value || '',
        sourceAccount: document.querySelector('.source-account')?.value || '',
        amount: document.querySelector('.amount')?.value || '',
        currency: document.querySelector('.currency')?.value || '',
        transferTime: document.querySelector('input[name="transferTime"]:checked')?.value === 'maintenant'
            ? new Date().toLocaleString()
            : document.querySelector('.transfer-date')?.value || '',
        transferObject: document.querySelector('.transfer-object')?.value || '',
        mobileProvider: document.querySelector('.mobile-provider')?.value || '',
        mobileAccountNumber: document.querySelector('.mobile-account-number')?.value || '',
        transferMode: document.querySelector('input[name="transferMode"]:checked')?.value || '',
        bank: document.querySelector('.bank')?.value || '',
    };

    localStorage.setItem('transactionData', JSON.stringify(data));
    window.location.href = '../transfert.unique/recap.html';
}

// Fonction pour charger les données de récapitulatif et les afficher dynamiquement
function loadRecap() {
    const data = JSON.parse(localStorage.getItem('transactionData'));

    if (data) {
        setElementTextContent('.recap-payment-type', data.paymentType);
        setElementTextContent('.recap-account-number', data.accountNumber || data.mobileAccountNumber);
        setElementTextContent('.recap-account-name', data.accountName);
        setElementTextContent('.recap-beneficiary-email', data.beneficiaryEmail);
        setElementTextContent('.recap-source-account', data.sourceAccount);
        setElementTextContent('.recap-amount', data.amount);
        setElementTextContent('.recap-currency', data.currency);
        setElementTextContent('.recap-transfer-time', data.transferTime);
        setElementTextContent('.recap-transfer-object', data.transferObject);

        if (data.paymentType === 'Domestique') {
            toggleDisplay('.recap-transfer-mode-container', true);
            setElementTextContent('.recap-transfer-mode', data.transferMode);
            toggleDisplay('.recap-bank-container', true);
            setElementTextContent('.recap-bank', data.bank);
        } else if (data.paymentType === 'Mobile Money') {
            toggleDisplay('.recap-mobile-provider-container', true);
            setElementTextContent('.recap-mobile-provider', data.mobileProvider);
        }
    }
}

// Fonction utilitaire pour définir le contenu textuel d'un élément
function setElementTextContent(selector, content) {
    const element = document.querySelector(selector);
    if (element) {
        element.textContent = content;
    } else {
        console.warn(`L'élément ${selector} est introuvable.`);
    }
}

// Fonction utilitaire pour afficher ou masquer un élément
function toggleDisplay(selector, show) {
    const element = document.querySelector(selector);
    if (element) {
        element.style.display = show ? 'block' : 'none';
    }
}

// Autres fonctions pour la vérification OTP, question de sécurité, et retour à l'accueil
function goToOtpVerification() {
    window.location.href = '../transfert.unique/otpVerification.html';
}

function verifyOtp() {
    const otpInput = document.querySelector('.otp')?.value;
    if (otpInput === '123456') {
        window.location.href = '../transfert.unique/securityQuestion.html';
    } else {
        alert('Code OTP incorrect !');
    }
}

function verifyOtpMultiples() {
    const otpInput = document.querySelector('.otpMultiples')?.value;
    if (otpInput === '123456') {
        window.location.href = '../transferts.multiples/soumissionPourPaiement-securityQuestion.html';
    } else {
        alert('Code OTP incorrect !');
    }
}

function verifySecurityAnswer() {
    const securityAnswer = document.querySelector('.security-answer')?.value.toLowerCase();
    if (securityAnswer === 'paris') {
        window.location.href = '../transfert.unique/success.html';
    } else {
        alert('Réponse incorrecte !');
    }
}

function verifySecurityAnswerMultiples() {
    const securityAnswer = document.querySelector('.security-answerMultiples')?.value.toLowerCase();
    if (securityAnswer === 'guinea') {
        window.location.href = '../transferts.multiples/executionDistribution.html';
    } else {
        alert('Réponse incorrecte !');
    }
}

function goHome() {
    window.location.href = 'index.html';
}

function goBack() {
    window.history.back();
}

document.addEventListener('DOMContentLoaded', function () {
    const path = window.location.pathname;
    if (path.endsWith('recap.html') || path.endsWith('otpVerification.html') || path.endsWith('securityQuestion.html') || path.endsWith('success.html')) {
        loadRecap();
    }
});

// Modification de la Paie - payment form
document.getElementById('paymentType')?.addEventListener('change', function () {
    const paymentType = this.value;
    document.querySelectorAll('.payment-fields').forEach(field => field.style.display = 'none');

    toggleDisplay(`#${paymentType}Fields`, true);
});