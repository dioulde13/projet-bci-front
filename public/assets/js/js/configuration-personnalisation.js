// Données simulées plus riches
let comptes = [
    {numero: "7308054285", type: "Courant", devise: "GNF", solde: 10000000, selected: true},
    {numero: "1234567890", type: "Épargne", devise: "USD", solde: 5000, selected: false},
    {numero: "9876543210", type: "Courant", devise: "EUR", solde: 20000, selected: true},
    {numero: "5555555555", type: "Épargne", devise: "GNF", solde: 150000000, selected: false},
    {numero: "2222222222", type: "Courant", devise: "USD", solde: 3000, selected: true}
];

let multiNiveauxActive = false;
let niveaux = [
    {role: "Comptable", debut:0, fin:20000000, regle:"un"},
    {role: "Chef Comptable", debut:20000001, fin:100000000, regle:"tous"},
    {role: "DAF", debut:100000001, fin:500000000, regle:"un"}
];

let categories = [
    {nom:"Salaires", description:"Paiements des salaires mensuels", regle:"Niveau 1 et 2"},
    {nom:"Fournisseurs", description:"Paiements réguliers aux fournisseurs", regle:"Niveau 1"},
    {nom:"Achat Matériel", description:"Achats ponctuels de matériel informatique", regle:"Niveau 1 et 2"},
    {nom:"Frais de déplacement", description:"Remboursement des frais de déplacement du personnel", regle:"Aucun"}
];

let catToDeleteIndex = null;
let catToEditIndex = null;
let niveauToEditIndex = null;

let currentStep = 1;
const totalSteps = 5;

function init() {
    renderComptes();
    renderNiveaux();
    renderCategories();
    updateResumeSections();
    updateWizardUI();
}

function renderComptes() {
    const liste = document.getElementById('listeComptes');
    liste.innerHTML = '';
    comptes.forEach(c => {
        const li = document.createElement('li');
        li.className = 'list-group-item';
        li.innerHTML = `
            <input class="form-check-input me-2" type="checkbox" ${c.selected?'checked':''} data-numero="${c.numero}">
            <strong>Compte - ${c.numero}</strong><br>
            <small>Type : ${c.type} | Devise : ${c.devise} | Solde : ${c.solde} ${c.devise}</small>
        `;
        liste.appendChild(li);
    });
    updateResumeComptes();
}

function updateResumeComptes() {
    const checked = comptes.filter(c => c.selected);
    const resume = document.getElementById('resumeComptes');
    resume.innerHTML = '';
    checked.forEach(c => {
        resume.innerHTML += `- ✅ Compte ${c.numero} (${c.type}, ${c.devise})<br>`;
    });
    updateResumeSections();
}

document.getElementById('listeComptes').addEventListener('change', (e)=>{
    if(e.target && e.target.type==='checkbox') {
        const numero = e.target.getAttribute('data-numero');
        const c = comptes.find(cc=>cc.numero===numero);
        c.selected = e.target.checked;
        updateResumeComptes();
    }
});

document.getElementById('retirerCompteBtn').addEventListener('click', ()=>{
    const selected = comptes.filter(c=>c.selected);
    if(selected.length>0) {
        document.getElementById('confirmRetraitBtn').onclick = ()=>{
            selected[0].selected = false;
            new bootstrap.Modal(document.getElementById('confirmRetraitCompteModal')).hide();
            renderComptes();
        }
        new bootstrap.Modal(document.getElementById('confirmRetraitCompteModal')).show();
    } else {
        alert("Aucun compte sélectionné");
    }
});

document.getElementById('saveComptesBtn').addEventListener('click', ()=>{
    new bootstrap.Modal(document.getElementById('successSaveComptesModal')).show();
});

// Validation Multi-niveaux
document.getElementById('multiYes').addEventListener('change', function(){
    if(this.checked) {
        multiNiveauxActive = true;
        document.getElementById('validationConfig').style.display = 'block';
        updateResumeSections();
    }
});
document.getElementById('multiNo').addEventListener('change', function(){
    if(this.checked) {
        multiNiveauxActive = false;
        document.getElementById('validationConfig').style.display = 'none';
        updateResumeSections();
    }
});

function renderNiveaux() {
    const tb = document.getElementById('validationTableBody');
    tb.innerHTML = '';
    niveaux.forEach((n,idx)=>{
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>Niveau ${idx+1}</td>
            <td>${n.role}</td>
            <td>${n.debut} - ${n.fin} GNF</td>
            <td>
                <button class="btn btn-sm btn-light hover-animate" onclick="editNiveau(${idx})">
                    <i class="bi bi-pencil-square"></i>Modifier
                </button>
            </td>
        `;
        tb.appendChild(tr);
    });
}

function editNiveau(index) {
    niveauToEditIndex = index;
    const n = niveaux[index];
    document.getElementById('editNiveauIndex').value = index;
    document.getElementById('editNiveauRole').value = n.role;
    document.getElementById('editNiveauDebut').value = n.debut;
    document.getElementById('editNiveauFin').value = n.fin;
    document.getElementsByName('regleApproEdit').forEach(r=>{
        r.checked = (r.value===n.regle);
    });
    document.getElementById('editNiveauWarning').style.display='none';
    new bootstrap.Modal(document.getElementById('editNiveauModal')).show();
}

document.getElementById('saveNiveauChangesBtn').addEventListener('click', ()=>{
    const idx = parseInt(document.getElementById('editNiveauIndex').value);
    const role = document.getElementById('editNiveauRole').value;
    const debut = parseInt(document.getElementById('editNiveauDebut').value);
    const fin = parseInt(document.getElementById('editNiveauFin').value);
    const regle = [...document.getElementsByName('regleApproEdit')].find(r=>r.checked).value;

    if(isNaN(debut) || isNaN(fin) || !role) {
        document.getElementById('editNiveauWarning').style.display='block';
        return;
    }

    niveaux[idx] = {role, debut, fin, regle};
    new bootstrap.Modal(document.getElementById('editNiveauModal')).hide();
    renderNiveaux();
    updateResumeSections();
});

document.getElementById('addNiveauBtn').addEventListener('click', ()=>{
    const role = document.getElementById('addNiveauRole').value;
    const debut = parseInt(document.getElementById('addNiveauDebut').value);
    const fin = parseInt(document.getElementById('addNiveauFin').value);
    const regle = [...document.getElementsByName('regleApproAdd')].find(r=>r.checked).value;

    if(isNaN(debut) || isNaN(fin) || !role) {
        document.getElementById('addNiveauWarning').style.display='block';
        return;
    }
    document.getElementById('addNiveauWarning').style.display='none';

    niveaux.push({role, debut, fin, regle});
    new bootstrap.Modal(document.getElementById('addNiveauModal')).hide();
    renderNiveaux();
    updateResumeSections();
});

// Catégories
function renderCategories() {
    const tb = document.getElementById('categoriesTableBody');
    tb.innerHTML = '';
    categories.forEach((cat,idx)=>{
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${cat.nom}</td>
            <td>${cat.description||''}</td>
            <td>${cat.regle}</td>
            <td>
                <button class="btn btn-sm btn-light hover-animate" onclick="viewCategorie(${idx})">
                    <i class="bi bi-eye"></i>Voir
                </button>
                <button class="btn btn-sm btn-light hover-animate" onclick="editCategorie(${idx})">
                    <i class="bi bi-pencil-square"></i>Modifier
                </button>
                <button class="btn btn-sm btn-light hover-animate" onclick="deleteCategorie(${idx})">
                    <i class="bi bi-trash"></i>Supprimer
                </button>
            </td>
        `;
        tb.appendChild(tr);
    });
    updateResumeSections();
}

function viewCategorie(index) {
    const cat = categories[index];
    document.getElementById('viewCatBody').innerHTML = `
        <p><strong>Nom :</strong> ${cat.nom}</p>
        <p><strong>Description :</strong> ${cat.description||''}</p>
        <p><strong>Règles d’approbation :</strong> ${cat.regle}</p>
    `;
    new bootstrap.Modal(document.getElementById('viewCategorieModal')).show();
}

function editCategorie(index) {
    catToEditIndex = index;
    const cat = categories[index];
    document.getElementById('editCatIndex').value = index;
    document.getElementById('editCatNom').value = cat.nom;
    document.getElementById('editCatDesc').value = cat.description||'';
    document.getElementsByName('regleCatEdit').forEach(r=>{
        r.checked = (r.value===cat.regle);
    });
    document.getElementById('editCatWarning').style.display='none';
    new bootstrap.Modal(document.getElementById('editCategorieModal')).show();
}

document.getElementById('saveCatChangesBtn').addEventListener('click', ()=>{
    const idx = parseInt(document.getElementById('editCatIndex').value);
    const nom = document.getElementById('editCatNom').value.trim();
    const description = document.getElementById('editCatDesc').value.trim();
    const regle = [...document.getElementsByName('regleCatEdit')].find(r=>r.checked).value;

    if(!nom) {
        document.getElementById('editCatWarning').style.display='block';
        return;
    }

    categories[idx] = {nom, description, regle};
    new bootstrap.Modal(document.getElementById('editCategorieModal')).hide();
    renderCategories();
});

function deleteCategorie(index) {
    catToDeleteIndex = index;
    new bootstrap.Modal(document.getElementById('deleteCategorieModal')).show();
}

document.getElementById('confirmDeleteCatBtn').addEventListener('click', ()=>{
    categories.splice(catToDeleteIndex,1);
    new bootstrap.Modal(document.getElementById('deleteCategorieModal')).hide();
    renderCategories();
});

document.getElementById('addCatBtn').addEventListener('click', ()=>{
    const nom = document.getElementById('addCatNom').value.trim();
    const description = document.getElementById('addCatDesc').value.trim();
    const regle = [...document.getElementsByName('regleCatAdd')].find(r=>r.checked).value;
    if(!nom) {
        document.getElementById('addCatWarning').style.display='block';
        return;
    }
    document.getElementById('addCatWarning').style.display='none';
    categories.push({nom, description, regle});
    new bootstrap.Modal(document.getElementById('addCategorieModal')).hide();
    renderCategories();
});

// Résumé Global
function updateResumeSections() {
    const selectedComptes = comptes.filter(c=>c.selected).length;
    const resumeComptesStatus = document.getElementById('resumeComptesStatus');
    resumeComptesStatus.textContent = selectedComptes+' compte(s) sélectionné(s)';

    const resumeValidationStatus = document.getElementById('resumeValidationStatus');
    if(multiNiveauxActive) {
        resumeValidationStatus.textContent = niveaux.length+' niveau(x) configuré(s)';
    } else {
        resumeValidationStatus.textContent = 'Validation multi-niveaux désactivée';
    }

    const resumeCategoriesStatus = document.getElementById('resumeCategoriesStatus');
    resumeCategoriesStatus.textContent = categories.length+' catégorie(s) configurée(s)';
}

document.getElementById('finaliserBtn').addEventListener('click', ()=>{
    new bootstrap.Modal(document.getElementById('confirmFinalisationModal')).show();
});

document.getElementById('confirmFinaliserBtn').addEventListener('click', ()=>{
    new bootstrap.Modal(document.getElementById('confirmFinalisationModal')).hide();
    new bootstrap.Modal(document.getElementById('successFinalisationModal')).show();
});

// Navigation du wizard
function updateWizardUI() {
    // Cacher tous les contenus
    document.querySelectorAll('.wizard-step-content').forEach(el=>{
        el.classList.add('d-none');
    });

    // Afficher celui de l'étape courante
    const currentStepContent = document.querySelector(`.wizard-step-content[data-step="${currentStep}"]`);
    if(currentStepContent) currentStepContent.classList.remove('d-none');

    // Mettre à jour l'état des étapes (active, completed)
    document.querySelectorAll('.wizard-step').forEach(el=>{
        const step = parseInt(el.getAttribute('data-step'),10);
        el.classList.remove('active','completed');
        if(step<currentStep) el.classList.add('completed');
        if(step===currentStep) el.classList.add('active');
    });
}

// Aller à une étape spécifique
function goToStep(step) {
    currentStep = step;
    updateWizardUI();
}

// Boutons Suivant / Précédent
document.getElementById('nextBtn1').addEventListener('click', ()=>{ currentStep=2; updateWizardUI(); });
document.getElementById('prevBtn2').addEventListener('click', ()=>{ currentStep=1; updateWizardUI(); });
document.getElementById('nextBtn2').addEventListener('click', ()=>{ currentStep=3; updateWizardUI(); });
document.getElementById('prevBtn3').addEventListener('click', ()=>{ currentStep=2; updateWizardUI(); });
document.getElementById('nextBtn3').addEventListener('click', ()=>{ currentStep=4; updateWizardUI(); });
document.getElementById('prevBtn4').addEventListener('click', ()=>{ currentStep=3; updateWizardUI(); });
document.getElementById('nextBtn4').addEventListener('click', ()=>{ currentStep=5; updateWizardUI(); });
document.getElementById('prevBtn5').addEventListener('click', ()=>{ currentStep=4; updateWizardUI(); });

// Initialisation
init();