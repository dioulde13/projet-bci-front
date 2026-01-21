document.addEventListener('DOMContentLoaded', function() {
    const otpForm = document.getElementById('otpForm');
    const inputs = document.querySelectorAll('.otp-input');
    const validateButton = document.getElementById('validateButton');
    const resendButton = document.getElementById('resendButton');
    const timerDisplay = document.getElementById('timer');
    const successModal = new bootstrap.Modal('#successModal');
    const errorModal = new bootstrap.Modal('#errorModal');
    let resendTimer = 30;

    // Gestion des inputs OTP
    inputs.forEach((input, index) => {
        input.addEventListener('input', function(e) {
            if (e.target.value) {
                if (index < inputs.length - 1) {
                    inputs[index + 1].focus();
                }
                validateOTPComplete();
            }
        });

        input.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace' && !e.target.value && index > 0) {
                inputs[index - 1].focus();
                validateOTPComplete();
            }
        });
    });

    // Validation du formulaire complet
    function validateOTPComplete() {
        const isComplete = Array.from(inputs).every(input => 
            input.value && /^\d$/.test(input.value)
        );
        validateButton.disabled = !isComplete;
    }

    // Timer pour le renvoi de code
    function updateTimer() {
        if (resendTimer > 0) {
            timerDisplay.textContent = `(${resendTimer}s)`;
            resendTimer--;
            setTimeout(updateTimer, 1000);
        } else {
            timerDisplay.textContent = '';
            resendButton.disabled = false;
        }
    }
    updateTimer();

    // Fonction de renvoi de code
    function resendOTP() {
        resendButton.disabled = true;
        resendTimer = 30;
        updateTimer();
        // Simuler l'envoi d'un nouveau code
        console.log('Nouveau code OTP envoyé');
    }

    // Gestion du formulaire
    otpForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const otp = Array.from(inputs).map(input => input.value).join('');
        
        // Simulation de validation (à remplacer par un appel API)
        if (otp === '123456') { // Code de test
            successModal.show();
        } else {
            errorModal.show();
        }
    });

    // Événements des boutons
    resendButton.addEventListener('click', resendOTP);
    document.getElementById('resendFromModal').addEventListener('click', function() {
        errorModal.hide();
        resendOTP();
    });

    document.getElementById('cancelButton').addEventListener('click', function() {
        window.location.href = 'souscription.html';
    });

    document.getElementById('continueButton').addEventListener('click', function() {
        window.location.href = 'configuration-personnalisation.html';
    });
});