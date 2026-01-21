// scriptBeneficiaire.js

// Données des bénéficiaires intégrées dans le script
const initialBeneficiaries = [

    {
        "id": 1694256789123,
        "photo": "assets/img/avatar-01.jpg",
        "name": "Sadou Diallo",
        "type": "autre",
        "destinationBank": "BANQUE POUR LE COMMERCE ET L’INDUSTRIE DE GUINEE S.A - 6ème Avenue de la République, Sandervalia, Kaloum BP : 359 - Conakry",
        "accountNumber": "60021040011781",
        "accountName": "Sadou Diallo",
        "email": "sadou.diallo@gmail.com",
        "object": "Paiement de service",
        "nickname": "Sadou",
        "accessType": "private"
    },
    {
        "id": 1694256789122,
        "photo": "assets/img/avatar-01.jpg",
        "name": "Cheick Abdoul Gadri Dioubaté",
        "type": "autre",
        "destinationBank": "ECOBANK GUINEE - Immeuble Al Iman, Ave de la REPUBLIQUE, BP 5687, Conakry, Guinée",
        "accountNumber": "60021040011782",
        "accountName": "Cheick Abdoul Gadri Dioubaté",
        "email": "cheick.dioubaté0@gmail.com",
        "object": "Paiement de service",
        "nickname": "Cheick Dioubaté",
        "accessType": "private"
    },
    {
        "id": 1694256789121,
        "photo": "assets/img/avatar-01.jpg",
        "name": "Moussa Ndaw",
        "type": "autre",
        "destinationBank": "UNITED BANK FOR AFRICA UBA - Rue du Château d’eau Marché Niger, Kaloum - BP : 2193 Conakry, Guinée",
        "accountNumber": "60021040011780",
        "accountName": "Moussa Ndaw",
        "email": "ndawm2000@gmail.com",
        "object": "Paiement de service",
        "nickname": "Moussa",
        "accessType": "private"
    },
    {
        "id": 1694256789124,
        "photo": "assets/img/avatar-01.jpg",
        "name": "Fatoumata Binta Diallo",
        "type": "autre",
        "destinationBank": "ORABANK GUINEE - Immeuble Le Niger, Kaloum, Conakry",
        "accountNumber": "60021040011783",
        "accountName": "Fatoumata Binta Diallo",
        "email": "fatoumata.diallo@example.com",
        "object": "Paiement de service",
        "nickname": "Binta",
        "accessType": "private"
    },
    {
        "id": 1694256789125,
        "photo": "assets/img/avatar-01.jpg",
        "name": "Aboubacar Sylla",
        "type": "autre",
        "destinationBank": "SOCIETE GENERALE DE BANQUES EN GUINEE - Immeuble SGBCI, Kaloum, Conakry",
        "accountNumber": "60021040011784",
        "accountName": "Aboubacar Sylla",
        "email": "aboubacar.sylla@example.com",
        "object": "Paiement de service",
        "nickname": "Abou",
        "accessType": "private"
    },
    {
        "id": 1694256789126,
        "photo": "assets/img/avatar-01.jpg",
        "name": "Aissatou Camara",
        "type": "autre",
        "destinationBank": "BANQUE ISLAMIQUE DE GUINEE - Quartier Almamya, Kaloum, Conakry",
        "accountNumber": "60021040011785",
        "accountName": "Aissatou Camara",
        "email": "aissatou.camara@example.com",
        "object": "Paiement de service",
        "nickname": "Aissatou",
        "accessType": "private"
    },
    {
        "id": 1694256789127,
        "photo": "assets/img/avatar-01.jpg",
        "name": "Sekou Kaba",
        "type": "autre",
        "destinationBank": "BANQUE CENTRALE DE LA REPUBLIQUE DE GUINEE - Conakry",
        "accountNumber": "60021040011786",
        "accountName": "Sekou Kaba",
        "email": "sekou.kaba@example.com",
        "object": "Paiement de service",
        "nickname": "Sekou",
        "accessType": "private"
    },
    {
        "id": 1694256789128,
        "photo": "assets/img/avatar-01.jpg",
        "name": "Mamadi Camara",
        "type": "autre",
        "destinationBank": "BANQUE INTERNATIONALE POUR LE COMMERCE ET L’INDUSTRIE DE GUINEE - Conakry",
        "accountNumber": "60021040011787",
        "accountName": "Mamadi Camara",
        "email": "mamadi.camara@example.com",
        "object": "Paiement de service",
        "nickname": "Mamadi",
        "accessType": "private"
    },
    {
        "id": 1694256789129,
        "photo": "assets/img/avatar-01.jpg",
        "name": "Mariam Kouyate",
        "type": "autre",
        "destinationBank": "UBA GUINEE - Immeuble UBA, Conakry",
        "accountNumber": "60021040011788",
        "accountName": "Mariam Kouyate",
        "email": "mariam.kouyate@example.com",
        "object": "Paiement de service",
        "nickname": "Mariam",
        "accessType": "private"
    },
    {
        "id": 1694256789130,
        "photo": "assets/img/avatar-01.jpg",
        "name": "Amadou Bah",
        "type": "autre",
        "destinationBank": "BANK OF AFRICA GUINEE - Rue KA 006, Kaloum, Conakry",
        "accountNumber": "60021040011789",
        "accountName": "Amadou Bah",
        "email": "amadou.bah@example.com",
        "object": "Paiement de service",
        "nickname": "Amadou",
        "accessType": "private"
    },
    {
        "id": 1694256790124,
        "photo": "assets/img/avatar-01.jpg",
        "name": "Marie Dupont",
        "type": "fournisseur",
        "destinationBank": "BANQUE POUR LE COMMERCE ET L’INDUSTRIE DE GUINEE S.A - 6ème Avenue de la République, Sandervalia, Kaloum BP : 359 - Conakry",
        "accountNumber": "12345678901234",
        "accountName": "Marie Dupont",
        "email": "marie.dupont@example.com",
        "object": "Fourniture de bureau",
        "nickname": "Marie",
        "accessType": "public"
    },
    {
        "id": 1694256790125,
        "photo": "assets/img/avatar-01.jpg",
        "name": "Alpha Condé",
        "type": "fournisseur",
        "destinationBank": "ECOBANK GUINEE - Immeuble Al Iman, Ave de la REPUBLIQUE, BP 5687, Conakry, Guinée",
        "accountNumber": "12345678901235",
        "accountName": "Alpha Condé",
        "email": "alpha.conde@example.com",
        "object": "Fourniture de matériel informatique",
        "nickname": "Alpha",
        "accessType": "public"
    },
    {
        "id": 1694256790126,
        "photo": "assets/img/avatar-01.jpg",
        "name": "Kadiatou Sy",
        "type": "fournisseur",
        "destinationBank": "UNITED BANK FOR AFRICA UBA - Rue du Château d’eau Marché Niger, Kaloum - BP : 2193 Conakry, Guinée",
        "accountNumber": "12345678901236",
        "accountName": "Kadiatou Sy",
        "email": "kadiatou.sy@example.com",
        "object": "Fourniture de mobilier de bureau",
        "nickname": "Kadiatou",
        "accessType": "public"
    },
    {
        "id": 1694256790127,
        "photo": "assets/img/avatar-01.jpg",
        "name": "Mohamed Camara",
        "type": "fournisseur",
        "destinationBank": "ORABANK GUINEE - Immeuble Le Niger, Kaloum, Conakry",
        "accountNumber": "12345678901237",
        "accountName": "Mohamed Camara",
        "email": "mohamed.camara@example.com",
        "object": "Livraison de matériaux",
        "nickname": "Mohamed",
        "accessType": "public"
    },
    {
        "id": 1694256790128,
        "photo": "assets/img/avatar-01.jpg",
        "name": "Fatoumata Koulibaly",
        "type": "fournisseur",
        "destinationBank": "SOCIETE GENERALE DE BANQUES EN GUINEE - Immeuble SGBCI, Kaloum, Conakry",
        "accountNumber": "12345678901238",
        "accountName": "Fatoumata Koulibaly",
        "email": "fatoumata.koulibaly@example.com",
        "object": "Fourniture de services de nettoyage",
        "nickname": "Fatoumata",
        "accessType": "public"
    },
    {
        "id": 1694256790129,
        "photo": "assets/img/avatar-01.jpg",
        "name": "Sekouba Doumbouya",
        "type": "fournisseur",
        "destinationBank": "BANQUE ISLAMIQUE DE GUINEE - Quartier Almamya, Kaloum, Conakry",
        "accountNumber": "12345678901239",
        "accountName": "Sekouba Doumbouya",
        "email": "sekouba.doumbouya@example.com",
        "object": "Construction et BTP",
        "nickname": "Sekouba",
        "accessType": "public"
    },
    {
        "id": 1694256790130,
        "photo": "assets/img/avatar-01.jpg",
        "name": "Ibrahima Bah",
        "type": "fournisseur",
        "destinationBank": "BANQUE CENTRALE DE LA REPUBLIQUE DE GUINEE - Conakry",
        "accountNumber": "12345678901240",
        "accountName": "Ibrahima Bah",
        "email": "ibrahima.bah@example.com",
        "object": "Fourniture de produits alimentaires",
        "nickname": "Ibrahima",
        "accessType": "public"
    },
    {
        "id": 1694256790131,
        "photo": "assets/img/avatar-01.jpg",
        "name": "Mamoudou Keita",
        "type": "fournisseur",
        "destinationBank": "BANQUE INTERNATIONALE POUR LE COMMERCE ET L’INDUSTRIE DE GUINEE - Conakry",
        "accountNumber": "12345678901241",
        "accountName": "Mamoudou Keita",
        "email": "mamoudou.keita@example.com",
        "object": "Consulting",
        "nickname": "Mamoudou",
        "accessType": "public"
    },
    {
        "id": 1694256790132,
        "photo": "assets/img/avatar-01.jpg",
        "name": "Amadou Sow",
        "type": "fournisseur",
        "destinationBank": "UBA GUINEE - Immeuble UBA, Conakry",
        "accountNumber": "12345678901242",
        "accountName": "Amadou Sow",
        "email": "amadou.sow@example.com",
        "object": "Livraison de pièces détachées",
        "nickname": "Amadou",
        "accessType": "public"
    },
    {
        "id": 1694256791125,
        "photo": "assets/img/avatar-01.jpg",
        "name": "Alassane Traoré",
        "type": "employe",
        "destinationBank": "BANQUE POUR LE COMMERCE ET L’INDUSTRIE DE GUINEE S.A - 6ème Avenue de la République, Sandervalia, Kaloum BP : 359 - Conakry",
        "accountNumber": "98765432109876",
        "accountName": "Alassane Traoré",
        "email": "alassane.traore@example.com",
        "object": "Salaire",
        "nickname": "Alassane",
        "accessType": "private",
        "employeId": "E001",
        "departement": "Ressources Humaines",
        "heuresTravaillees": 160,
        "tauxHoraire": 20,
        "salaireBrut": 3200,
        "heuresSup": 10,
        "primes": 300,
        "deductions": 100,
        "netAPayer": 3400
    },
    {
        "id": 1694256791126,
        "photo": "assets/img/avatar-01.jpg",
        "name": "Mariama Sylla",
        "type": "employe",
        "destinationBank": "ECOBANK GUINEE - Immeuble Al Iman, Ave de la REPUBLIQUE, BP 5687, Conakry, Guinée",
        "accountNumber": "98765432109877",
        "accountName": "Mariama Sylla",
        "email": "mariama.sylla@example.com",
        "object": "Salaire",
        "nickname": "Mariama",
        "accessType": "private",
        "employeId": "E002",
        "departement": "Finance",
        "heuresTravaillees": 170,
        "tauxHoraire": 22,
        "salaireBrut": 3740,
        "heuresSup": 5,
        "primes": 200,
        "deductions": 150,
        "netAPayer": 3790
    },
    {
        "id": 1694256791127,
        "photo": "assets/img/avatar-01.jpg",
        "name": "Ousmane Camara",
        "type": "employe",
        "destinationBank": "UNITED BANK FOR AFRICA UBA - Rue du Château d’eau Marché Niger, Kaloum - BP : 2193 Conakry, Guinée",
        "accountNumber": "98765432109878",
        "accountName": "Ousmane Camara",
        "email": "ousmane.camara@example.com",
        "object": "Salaire",
        "nickname": "Ousmane",
        "accessType": "private",
        "employeId": "E003",
        "departement": "Informatique",
        "heuresTravaillees": 160,
        "tauxHoraire": 25,
        "salaireBrut": 4000,
        "heuresSup": 8,
        "primes": 400,
        "deductions": 200,
        "netAPayer": 4200
    },
    {
        "id": 1694256791128,
        "photo": "assets/img/avatar-01.jpg",
        "name": "Fatou Diallo",
        "type": "employe",
        "destinationBank": "ORABANK GUINEE - Immeuble Le Niger, Kaloum, Conakry",
        "accountNumber": "98765432109879",
        "accountName": "Fatou Diallo",
        "email": "fatou.diallo@example.com",
        "object": "Salaire",
        "nickname": "Fatou",
        "accessType": "private",
        "employeId": "E004",
        "departement": "Marketing",
        "heuresTravaillees": 165,
        "tauxHoraire": 18,
        "salaireBrut": 2970,
        "heuresSup": 6,
        "primes": 250,
        "deductions": 100,
        "netAPayer": 3120
    },
    {
        "id": 1694256791129,
        "photo": "assets/img/avatar-01.jpg",
        "name": "Amadou Keita",
        "type": "employe",
        "destinationBank": "SOCIETE GENERALE DE BANQUES EN GUINEE - Immeuble SGBCI, Kaloum, Conakry",
        "accountNumber": "98765432109880",
        "accountName": "Amadou Keita",
        "email": "amadou.keita@example.com",
        "object": "Salaire",
        "nickname": "Amadou",
        "accessType": "private",
        "employeId": "E005",
        "departement": "Administration",
        "heuresTravaillees": 155,
        "tauxHoraire": 24,
        "salaireBrut": 3720,
        "heuresSup": 7,
        "primes": 350,
        "deductions": 150,
        "netAPayer": 3920
    },
    {
        "id": 1694256791130,
        "photo": "assets/img/avatar-01.jpg",
        "name": "Nafissatou Bah",
        "type": "employe",
        "destinationBank": "BANQUE ISLAMIQUE DE GUINEE - Quartier Almamya, Kaloum, Conakry",
        "accountNumber": "98765432109881",
        "accountName": "Nafissatou Bah",
        "email": "nafissatou.bah@example.com",
        "object": "Salaire",
        "nickname": "Nafissatou",
        "accessType": "private",
        "employeId": "E006",
        "departement": "Support Technique",
        "heuresTravaillees": 150,
        "tauxHoraire": 19,
        "salaireBrut": 2850,
        "heuresSup": 9,
        "primes": 220,
        "deductions": 130,
        "netAPayer": 2940
    },
    {
        "id": 1694256791131,
        "photo": "assets/img/avatar-01.jpg",
        "name": "Ibrahima Diallo",
        "type": "employe",
        "destinationBank": "BANQUE CENTRALE DE LA REPUBLIQUE DE GUINEE - Conakry",
        "accountNumber": "98765432109882",
        "accountName": "Ibrahima Diallo",
        "email": "ibrahima.diallo@example.com",
        "object": "Salaire",
        "nickname": "Ibrahima",
        "accessType": "private",
        "employeId": "E007",
        "departement": "Ventes",
        "heuresTravaillees": 160,
        "tauxHoraire": 20,
        "salaireBrut": 3200,
        "heuresSup": 12,
        "primes": 270,
        "deductions": 180,
        "netAPayer": 3290
    },
    {
        "id": 1694256791132,
        "photo": "assets/img/avatar-01.jpg",
        "name": "Mamadou Diallo",
        "type": "employe",
        "destinationBank": "BANQUE INTERNATIONALE POUR LE COMMERCE ET L’INDUSTRIE DE GUINEE - Conakry",
        "accountNumber": "98765432109883",
        "accountName": "Mamadou Diallo",
        "email": "mamadou.diallo@example.com",
        "object": "Salaire",
        "nickname": "Mamadou",
        "accessType": "private",
        "employeId": "E008",
        "departement": "Logistique",
        "heuresTravaillees": 162,
        "tauxHoraire": 23,
        "salaireBrut": 3726,
        "heuresSup": 10,
        "primes": 310,
        "deductions": 120,
        "netAPayer": 3916
    },
    {
        "id": 1694256791133,
        "photo": "assets/img/avatar-01.jpg",
        "name": "Khadija Sow",
        "type": "employe",
        "destinationBank": "UBA GUINEE - Immeuble UBA, Conakry",
        "accountNumber": "98765432109884",
        "accountName": "Khadija Sow",
        "email": "khadija.sow@example.com",
        "object": "Salaire",
        "nickname": "Khadija",
        "accessType": "private",
        "employeId": "E009",
        "departement": "Achats",
        "heuresTravaillees": 158,
        "tauxHoraire": 21,
        "salaireBrut": 3318,
        "heuresSup": 11,
        "primes": 320,
        "deductions": 140,
        "netAPayer": 3498
    }
];

// Fonction pour afficher une notification
function showNotification(message, type = 'success') {
  const alertBox = document.createElement('div');
  alertBox.className = `alert alert-${type}`;
  alertBox.textContent = message;
  document.body.prepend(alertBox);

  setTimeout(() => {
    alertBox.remove();
  }, 3000);
}

// Fonction pour valider les formulaires
function validateForm(formId) {
  const form = document.getElementById(formId);
  if (form) {
    return form.checkValidity();
  } else {
    console.error(`Formulaire avec l'ID ${formId} non trouvé.`);
    return false;
  }
}

// Fonction pour charger les bénéficiaires et les afficher dans les différents onglets
function loadBeneficiaries() {
  let beneficiaries = JSON.parse(localStorage.getItem('beneficiaries')) || initialBeneficiaries;

  // Initialiser localStorage si vide
  if (!localStorage.getItem('beneficiaries')) {
    localStorage.setItem('beneficiaries', JSON.stringify(beneficiaries));
  }

  displayBeneficiaries(beneficiaries);
}

// Fonction pour afficher les bénéficiaires dans les onglets appropriés
function displayBeneficiaries(beneficiaries) {
  const autresList = document.getElementById('autres-list');
  const fournisseursList = document.getElementById('fournisseurs-list');
  const employesList = document.getElementById('employes-list');

  if (!autresList || !fournisseursList || !employesList) {
    console.error("Les éléments des listes ne sont pas trouvés dans le DOM.");
    return;
  }

  // Réinitialisation des listes avant l'affichage
  autresList.innerHTML = '';
  fournisseursList.innerHTML = '';
  employesList.innerHTML = '';

  beneficiaries.forEach(b => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><div class="form-check font-size-16"><input class="form-check-input" type="checkbox" /><label class="form-check-label"></label></div></td>
      <td><img src="${b.photo}" alt="${b.name}" class="img-thumbnail" width="50"></td>
      <td>${b.name}</td>
      <td>${b.type}</td>
      <td class="column300px">${b.destinationBank}</td>
      <td>${b.accountNumber}</td>
      <td>${b.email}</td>
      <td>
        <a href="../transferts.multiples/detailsBeneficiaire.html?id=${b.id}" class="btn btn-info btn-sm">Détails</a>
        <a href="../transferts.multiples/modificationDetailsBeneficiaire.html?id=${b.id}" class="btn btn-warning btn-sm">Modifier</a>
        <button class="btn btn-danger btn-sm" onclick="confirmDeletion(${b.id})">Supprimer</button>
        <a href="transfertBeneficiaire.html?id=${b.id}" class="btn btn-success btn-sm">Transférer</a>
      </td>
    `;

    // Ajouter le bénéficiaire dans le bon onglet en fonction de son type
    switch (b.type) {
      case 'autre':
        autresList.appendChild(row);
        break;
      case 'fournisseur':
        fournisseursList.appendChild(row);
        break;
      case 'employe':
        employesList.appendChild(row);
        break;
      default:
        console.warn(`Type de bénéficiaire inconnu : ${b.type}`);
    }
  });
}

// Fonction pour confirmer la suppression d'un bénéficiaire
function confirmDeletion(id) {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce bénéficiaire ?')) {
    const beneficiaries = JSON.parse(localStorage.getItem('beneficiaries')) || [];
    const updatedList = beneficiaries.filter(b => b.id !== id);
    localStorage.setItem('beneficiaries', JSON.stringify(updatedList));
    showNotification('Bénéficiaire supprimé avec succès.', 'success');
    loadBeneficiaries(); // Recharger la liste après suppression
  }
}

// Fonction pour gérer le formulaire d'ajout de bénéficiaire
function handleAddBeneficiaryForm(event) {
  event.preventDefault();

  if (validateForm('add-beneficiary-form')) {
    const formData = {
      id: Date.now(),
      photo: document.getElementById('photo').files[0] ? URL.createObjectURL(document.getElementById('photo').files[0]) : 'default.jpg',
      name: document.getElementById('beneficiary-name').value,
      type: document.getElementById('beneficiary-type').value,
      destinationBank: document.getElementById('destination-bank').value,
      accountNumber: document.getElementById('account-number').value,
      accountName: document.getElementById('account-name').value,
      email: document.getElementById('email').value,
      object: document.getElementById('object').value,
      nickname: document.getElementById('nickname').value,
      accessType: document.querySelector('input[name="access-type"]:checked').value
    };

    const beneficiaries = JSON.parse(localStorage.getItem('beneficiaries')) || [];
    beneficiaries.push(formData);
    localStorage.setItem('beneficiaries', JSON.stringify(beneficiaries));

    showNotification('Bénéficiaire ajouté avec succès.', 'success');
    window.location.href = 'recapitulatif.html';
  } else {
    showNotification('Veuillez remplir tous les champs requis.', 'danger');
  }
}

// Fonction pour charger les détails du bénéficiaire à modifier
function loadBeneficiaryDetails() {
  const beneficiaryId = new URLSearchParams(window.location.search).get('id');
  const beneficiaries = JSON.parse(localStorage.getItem('beneficiaries')) || [];
  const beneficiary = beneficiaries.find(b => b.id === parseInt(beneficiaryId));

  if (beneficiary) {
    document.getElementById('photo').dataset.currentPhoto = beneficiary.photo || 'default.jpg';
    document.getElementById('beneficiary-name').value = beneficiary.name || '';
    document.getElementById('beneficiary-type').value = beneficiary.type || 'autre';
    document.getElementById('destination-bank').value = beneficiary.destinationBank || 'bank1';
    document.getElementById('account-number').value = beneficiary.accountNumber || '';
    document.getElementById('account-name').value = beneficiary.accountName || '';
    document.getElementById('email').value = beneficiary.email || '';
    document.getElementById('object').value = beneficiary.object || '';
    document.getElementById('nickname').value = beneficiary.nickname || '';
    document.querySelector(`input[name="access-type"][value="${beneficiary.accessType}"]`).checked = true;
  } else {
    showNotification('Bénéficiaire introuvable.', 'danger');
    window.location.href = 'index.html';
  }
}

// Fonction pour gérer la soumission du formulaire de modification
function handleModifyBeneficiaryForm(event) {
  event.preventDefault();

  if (validateForm('modify-beneficiary-form')) {
    const beneficiaryId = new URLSearchParams(window.location.search).get('id');
    const beneficiaries = JSON.parse(localStorage.getItem('beneficiaries')) || [];
    const beneficiaryIndex = beneficiaries.findIndex(b => b.id === parseInt(beneficiaryId));

    if (beneficiaryIndex !== -1) {
      const updatedBeneficiary = {
        ...beneficiaries[beneficiaryIndex],
        photo: document.getElementById('photo').files[0]
          ? URL.createObjectURL(document.getElementById('photo').files[0])
          : document.getElementById('photo').dataset.currentPhoto,
        name: document.getElementById('beneficiary-name').value,
        type: document.getElementById('beneficiary-type').value,
        destinationBank: document.getElementById('destination-bank').value,
        accountNumber: document.getElementById('account-number').value,
        accountName: document.getElementById('account-name').value,
        email: document.getElementById('email').value,
        object: document.getElementById('object').value,
        nickname: document.getElementById('nickname').value,
        accessType: document.querySelector('input[name="access-type"]:checked').value
      };

      beneficiaries[beneficiaryIndex] = updatedBeneficiary;
      localStorage.setItem('beneficiaries', JSON.stringify(beneficiaries));

      showNotification('Les modifications ont été enregistrées avec succès.', 'success');
      window.location.href = 'index.html';
    } else {
      showNotification('Erreur lors de la mise à jour des informations.', 'danger');
    }
  } else {
    showNotification('Veuillez remplir tous les champs requis.', 'danger');
  }
}

// Fonction pour charger les bénéficiaires pour le transfert
function loadBeneficiariesForTransfer() {
  const beneficiaries = JSON.parse(localStorage.getItem('beneficiaries')) || [];
  const beneficiarySelect = document.getElementById('beneficiary');
  const categorySelect = document.getElementById('beneficiary-category');

  function updateBeneficiaries() {
    const selectedCategory = categorySelect.value;
    beneficiarySelect.innerHTML = '';

    beneficiaries
      .filter(b => b.type === selectedCategory)
      .forEach(b => {
        const option = document.createElement('option');
        option.value = b.id;
        option.textContent = b.name;
        beneficiarySelect.appendChild(option);
      });

    if (beneficiaries.length > 0 && beneficiarySelect.firstChild) {
      showBeneficiaryDetails(parseInt(beneficiarySelect.value));
    }
  }

  beneficiarySelect.addEventListener('change', () => {
    showBeneficiaryDetails(parseInt(beneficiarySelect.value));
  });

  categorySelect.addEventListener('change', updateBeneficiaries);

  updateBeneficiaries();
}

// Fonction pour afficher les détails du bénéficiaire sélectionné pour le transfert
function showBeneficiaryDetails(beneficiaryId) {
  const beneficiaries = JSON.parse(localStorage.getItem('beneficiaries')) || [];
  const beneficiary = beneficiaries.find(b => b.id === beneficiaryId);

  if (beneficiary) {
    document.getElementById('account-number').textContent = beneficiary.accountNumber || 'Non fourni';
    document.getElementById('beneficiary-type').textContent = beneficiary.type || 'Non fourni';
    document.getElementById('account-name').textContent = beneficiary.accountName || 'Non fourni';
    document.getElementById('email').textContent = beneficiary.email || 'Non fourni';
    document.getElementById('bank-details').textContent = beneficiary.destinationBank || 'Non fourni';
    document.getElementById('network-type').textContent = 'RTGS';
  } else {
    showNotification('Bénéficiaire introuvable.', 'danger');
  }
}

// Fonction pour gérer la soumission du formulaire de transfert
function handleTransferForm(event) {
  event.preventDefault();

  if (validateForm('transfer-form')) {
    const transferData = {
      amount: document.getElementById('amount').value,
      sourceAccount: document.getElementById('source-account').value,
      beneficiaryId: document.getElementById('beneficiary').value,
      remark: document.getElementById('remark').value
    };

    showNotification('Transfert effectué avec succès.', 'success');
    window.location.href = 'confirmationSucces.html?action=transfer';
  } else {
    showNotification('Veuillez remplir tous les champs requis.', 'danger');
  }
}

// Fonction pour afficher le récapitulatif des informations saisies
function showRecap() {
  const formData = JSON.parse(sessionStorage.getItem('formData'));

  if (formData) {
    document.getElementById('recap-photo').src = formData.photo || 'default.jpg';
    document.getElementById('recap-name').textContent = formData.name || 'Nom non fourni';
    document.getElementById('recap-type').textContent = formData.type || 'Type non fourni';
    document.getElementById('recap-destinationBank').textContent = formData.destinationBank || 'Banque non fournie';
    document.getElementById('recap-accountNumber').textContent = formData.accountNumber || 'Numéro de compte non fourni';
    document.getElementById('recap-accountName').textContent = formData.accountName || 'Nom de compte non fourni';
    document.getElementById('recap-email').textContent = formData.email || 'Email non fourni';
    document.getElementById('recap-object').textContent = formData.object || 'Objet non fourni';
    document.getElementById('recap-nickname').textContent = formData.nickname || 'Surnom non fourni';
    document.getElementById('recap-accessType').textContent = formData.accessType === 'public' ? 'Public' : 'Privé';
  } else {
    showNotification('Aucune donnée disponible pour le récapitulatif.', 'danger');
    window.location.href = 'index.html';
  }
}

// Fonction pour afficher le récapitulatif sur la page OTP
function showRecapForOtp() {
  const formData = JSON.parse(sessionStorage.getItem('formData'));

  if (formData) {
    document.getElementById('recap-name').textContent = formData.name || 'Nom non fourni';
    document.getElementById('recap-type').textContent = formData.type || 'Type non fourni';
    document.getElementById('recap-destinationBank').textContent = formData.destinationBank || 'Banque non fournie';
    document.getElementById('recap-accountNumber').textContent = formData.accountNumber || 'Numéro de compte non fourni';
    document.getElementById('recap-email').textContent = formData.email || 'Email non fourni';
  } else {
    showNotification('Aucune donnée disponible pour le récapitulatif.', 'danger');
    window.location.href = 'index.html';
  }
}

// Fonction pour gérer la validation du code OTP
function handleOtpVerification(event) {
  event.preventDefault();

  const otpCode = document.getElementById('otp-code').value.trim();

  if (otpCode.length === 6) {
    showNotification('OTP vérifié avec succès.', 'success');
    window.location.href = 'confirmationSucces.html?action=otp';
  } else {
    showNotification('Le code OTP est invalide. Veuillez réessayer.', 'danger');
  }
}

// Fonction pour afficher le récapitulatif sur la page de question de sécurité
function showRecapForSecurity() {
  const formData = JSON.parse(sessionStorage.getItem('formData'));

  if (formData) {
    document.getElementById('recap-name').textContent = formData.name || 'Nom non fourni';
    document.getElementById('recap-type').textContent = formData.type || 'Type non fourni';
    document.getElementById('recap-destinationBank').textContent = formData.destinationBank || 'Banque non fournie';
    document.getElementById('recap-accountNumber').textContent = formData.accountNumber || 'Numéro de compte non fourni';
    document.getElementById('recap-email').textContent = formData.email || 'Email non fourni';
  } else {
    showNotification('Aucune donnée disponible pour le récapitulatif.', 'danger');
    window.location.href = 'index.html';
  }
}

// Fonction pour gérer la validation de la réponse à la question de sécurité
function handleSecurityQuestion(event) {
  event.preventDefault();

  const securityAnswer = document.getElementById('security-answer').value.trim();

  if (securityAnswer.toLowerCase() === 'nomanimal') {
    showNotification('Réponse à la question de sécurité acceptée.', 'success');
    window.location.href = 'confirmationSucces.html?action=security';
  } else {
    showNotification('La réponse est incorrecte. Veuillez réessayer.', 'danger');
  }
}

// Fonction pour afficher le message de succès avec le récapitulatif
function showSuccessMessage() {
  const formData = JSON.parse(sessionStorage.getItem('formData'));

  if (formData) {
    document.getElementById('recap-name').textContent = formData.name || 'Nom non fourni';
    document.getElementById('recap-type').textContent = formData.type || 'Type non fourni';
    document.getElementById('recap-destinationBank').textContent = formData.destinationBank || 'Banque non fournie';
    document.getElementById('recap-accountNumber').textContent = formData.accountNumber || 'Numéro de compte non fourni';
    document.getElementById('recap-email').textContent = formData.email || 'Email non fourni';
    document.getElementById('recap-amount').textContent = formData.amount ? formData.amount + ' GNF' : 'Montant non fourni';
    document.getElementById('recap-remark').textContent = formData.remark || 'Aucune remarque';
  } else {
    showNotification('Aucune donnée disponible pour le récapitulatif.', 'danger');
    window.location.href = 'index.html';
  }
}

// Charger les détails du bénéficiaire lors du chargement de la page
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('modify-beneficiary-form')) {
    loadBeneficiaryDetails();
  }
  if (document.getElementById('otp-form')) {
    showRecapForOtp();
  }
  if (document.getElementById('security-question-form')) {
    showRecapForSecurity();
  }
  if (document.getElementById('add-beneficiary-form')) {
    document.getElementById('add-beneficiary-form').addEventListener('submit', handleAddBeneficiaryForm);
  }
  if (document.getElementById('modify-beneficiary-form')) {
    document.getElementById('modify-beneficiary-form').addEventListener('submit', handleModifyBeneficiaryForm);
  }
  if (document.getElementById('transfer-form')) {
    loadBeneficiariesForTransfer();
    document.getElementById('transfer-form').addEventListener('submit', handleTransferForm);
  }
  if (document.getElementById('success-message')) {
    showSuccessMessage();
  }
  if (document.getElementById('recap-form')) {
    showRecap();
  }
  loadBeneficiaries(); // Charger les bénéficiaires au chargement de la page
});
