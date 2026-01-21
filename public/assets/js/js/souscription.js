document.addEventListener('DOMContentLoaded', function() {
    // Données de simulation
    const simulationData = {
        validAccounts: {
            "1234567890": {
                companyName: "Alpha Technologies SARL",
                email: "contact@alpha-tech.com",
                phone: "+123456789",
                status: "active"
            },
            "9876543210": {
                companyName: "Beta Industries SA",
                email: "info@beta-industries.com",
                phone: "+123456788",
                status: "active"
            },
            "1111222233": {
                companyName: "Gamma Services",
                email: "contact@gamma-services.com",
                phone: "+123456787",
                status: "active"
            }
        },
        restrictedAccounts: {
            "9999888877": {
                companyName: "Omega LLC",
                status: "blocked",
                reason: "compte_inactif"
            },
            "6666777788": {
                companyName: "Sigma Enterprise",
                status: "suspended",
                reason: "verification_requise"
            }
        },
        validateAccount: function(accountNumber) {
            if (!/^\d{10}$/.test(accountNumber)) {
                return {
                    isValid: false,
                    error: "FORMAT_INVALIDE",
                    message: "Le numéro de compte doit contenir exactement 10 chiffres."
                };
            }

            if (this.validAccounts[accountNumber]) {
                return {
                    isValid: true,
                    accountInfo: this.validAccounts[accountNumber],
                    message: "Compte validé avec succès."
                };
            }

            if (this.restrictedAccounts[accountNumber]) {
                const restrictedAccount = this.restrictedAccounts[accountNumber];
                return {
                    isValid: false,
                    error: restrictedAccount.status.toUpperCase(),
                    message: restrictedAccount.status === "blocked" 
                        ? "Ce compte est actuellement bloqué. Veuillez contacter votre agence."
                        : "Ce compte nécessite une vérification supplémentaire. Veuillez contacter votre agence."
                };
            }

            return {
                isValid: false,
                error: "COMPTE_INEXISTANT",
                message: "Ce numéro de compte n'existe pas dans notre système."
            };
        },
        validateCompanyMatch: function(accountNumber, companyName) {
            const account = this.validAccounts[accountNumber] || this.restrictedAccounts[accountNumber];
            
            if (!account) {
                return {
                    isValid: false,
                    error: "COMPTE_INEXISTANT",
                    message: "Impossible de vérifier les informations de l'entreprise."
                };
            }

            const normalizedInput = companyName.trim().toLowerCase();
            const normalizedStored = account.companyName.trim().toLowerCase();

            return {
                isValid: normalizedInput === normalizedStored,
                message: normalizedInput === normalizedStored
                    ? "Les informations de l'entreprise correspondent."
                    : "Le nom de l'entreprise ne correspond pas à nos enregistrements."
            };
        },
        generateOTP: function(accountNumber) {
            const account = this.validAccounts[accountNumber];
            
            if (!account) {
                return {
                    success: false,
                    error: "COMPTE_INVALIDE",
                    message: "Impossible d'envoyer le code OTP."
                };
            }

            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const contactMethod = Math.random() < 0.5 ? 'email' : 'SMS';
            
            return {
                success: true,
                message: `Code OTP envoyé par ${contactMethod}`,
                otpInfo: {
                    code: otp,
                    sentTo: contactMethod === 'email' ? account.email : account.phone,
                    expiresIn: "5 minutes",
                    method: contactMethod
                }
            };
        }
    };

    // Éléments du formulaire
    const form = document.getElementById('registrationForm');
    const companyName = document.getElementById('companyName');
    const bankAccount = document.getElementById('bankAccount');
    const continueButton = document.getElementById('continueButton');
    const resetButton = document.getElementById('resetButton');
    const successModal = new bootstrap.Modal('#successModal');
    const errorModal = new bootstrap.Modal('#errorModal');

    // Feedback elements
    const companyNameFeedback = document.getElementById('companyNameFeedback');
    const bankAccountFeedback = document.getElementById('bankAccountFeedback');
    const errorMessage = document.getElementById('errorMessage');
    const otpSentMessage = document.getElementById('otpSentMessage');

    // Validation en temps réel du numéro de compte
    bankAccount.addEventListener('input', function() {
        const accountValidation = simulationData.validateAccount(this.value);
        
        if (accountValidation.isValid) {
            this.classList.remove('is-invalid');
            this.classList.add('is-valid');
            bankAccountFeedback.className = 'validation-message text-success';
        } else {
            this.classList.remove('is-valid');
            this.classList.add('is-invalid');
            bankAccountFeedback.className = 'validation-message text-danger';
        }
        
        bankAccountFeedback.textContent = accountValidation.message;
        validateForm();
    });

    // Validation en temps réel du nom d'entreprise
    companyName.addEventListener('input', function() {
        if (bankAccount.value && bankAccount.classList.contains('is-valid')) {
            const companyValidation = simulationData.validateCompanyMatch(
                bankAccount.value, 
                this.value
            );

            if (companyValidation.isValid) {
                this.classList.remove('is-invalid');
                this.classList.add('is-valid');
                companyNameFeedback.className = 'validation-message text-success';
            } else {
                this.classList.remove('is-valid');
                this.classList.add('is-invalid');
                companyNameFeedback.className = 'validation-message text-danger';
            }
            
            companyNameFeedback.textContent = companyValidation.message;
        }
        validateForm();
    });

    function validateForm() {
        const accountValid = bankAccount.classList.contains('is-valid');
        const companyValid = companyName.classList.contains('is-valid');
        continueButton.disabled = !(accountValid && companyValid);
    }

    // Gestion de la soumission du formulaire
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const accountValidation = simulationData.validateAccount(bankAccount.value);
        if (!accountValidation.isValid) {
            errorMessage.textContent = accountValidation.message;
            errorModal.show();
            return;
        }

        const companyValidation = simulationData.validateCompanyMatch(
            bankAccount.value, 
            companyName.value
        );
        if (!companyValidation.isValid) {
            errorMessage.textContent = companyValidation.message;
            errorModal.show();
            return;
        }

        // Génération et envoi de l'OTP
        const otpGeneration = simulationData.generateOTP(bankAccount.value);
        if (otpGeneration.success) {
            // Stocker les informations pour la prochaine étape
            localStorage.setItem('registrationData', JSON.stringify({
                accountNumber: bankAccount.value,
                company: companyName.value,
                otpInfo: otpGeneration.otpInfo
            }));
            
            // Afficher le message de succès
            otpSentMessage.textContent = `Un code de vérification a été envoyé par ${
                otpGeneration.otpInfo.method
            } à ${maskSensitiveInfo(otpGeneration.otpInfo.sentTo)}.`;
            
            successModal.show();
        } else {
            errorMessage.textContent = otpGeneration.message;
            errorModal.show();
        }
    });

    // Fonction pour masquer les informations sensibles
    function maskSensitiveInfo(info) {
        if (info.includes('@')) {
            const [username, domain] = info.split('@');
            return `${username.charAt(0)}${'*'.repeat(username.length - 2)}${
                username.charAt(username.length - 1)
            }@${domain}`;
        } else {
            return info.slice(0, 3) + '*'.repeat(info.length - 5) + info.slice(-2);
        }
    }

    // Gestion du bouton de réinitialisation
    resetButton.addEventListener('click', function() {
        companyName.value = '';
        bankAccount.value = '';
        companyName.classList.remove('is-valid', 'is-invalid');
        bankAccount.classList.remove('is-valid', 'is-invalid');
        companyNameFeedback.textContent = '';
        bankAccountFeedback.textContent = '';
        continueButton.disabled = true;
    });

    // Navigation
    document.getElementById('proceedToOTP').addEventListener('click', function() {
        window.location.href = 'otp-validation.html';
    });

    document.getElementById('cancelRegistration').addEventListener('click', function() {
        errorModal.hide();
        resetButton.click();
    });
});