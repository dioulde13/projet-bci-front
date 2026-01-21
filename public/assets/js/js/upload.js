// Fonction pour gérer l'importation du fichier CSV
function handleCSVUpload() {
    const fileInput = document.getElementById('csvFile');
    const file = fileInput.files[0];

    if (!file) {
        alert("Veuillez sélectionner un fichier CSV.");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        processCSV(text);
    };
    reader.readAsText(file);
}

// Fonction pour traiter le contenu du fichier CSV
function processCSV(data) {
    const lines = data.split('\n');
    const transactions = [];

    lines.forEach(line => {
        const values = line.split(',');
        if (values.length === 6) {
            const transaction = {
                beneficiary_name: values[0].trim(),
                account_number: values[1].trim(),
                account_type: values[2].trim(),
                amount: parseFloat(values[3].trim()),
                currency: values[4].trim(),
                description: values[5].trim()
            };
            transactions.push(transaction);
        }
    });

    displayTransactions(transactions);
}

// Fonction pour afficher les transactions dans un tableau
function displayTransactions(transactions) {
    const tableBody = document.getElementById('transactionsBody');
    tableBody.innerHTML = '';

    transactions.forEach(transaction => {
        const row = `<tr>
            <td><div class="form-check font-size-16"><input class="form-check-input" type="checkbox" checked /><label class="form-check-label"></label></div></td>
            <td>${transaction.beneficiary_name}</td>
            <td>${transaction.account_number}</td>
            <td>${transaction.account_type}</td>
            <td>${transaction.amount.toFixed(2)}</td>
            <td>${transaction.currency}</td>
            <td>${transaction.description}</td>
        </tr>`;
        tableBody.innerHTML += row;
    });

    document.getElementById('resultsSection').style.display = 'block';
}

// Fonction pour passer à la validation
function proceedToValidation() {
    alert("Validation des transactions réussie. Prêt pour l'exécution.");
}