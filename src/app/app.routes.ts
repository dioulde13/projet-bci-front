import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './components/layout/layout.component';
import { AuthGuard } from './services/guard/auth-guard.service';

export const routes: Routes = [
  // Routes publiques
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'notFound',
    loadComponent: () =>
      import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent),
  },
  {
    path: 'configPersonalisation',
    loadComponent: () =>
      import('./pages/config-personnalisation/config-personnalisation.component')
        .then(m => m.ConfigPersonnalisationComponent),
  },
  {
    path: 'otpValidation',
    loadComponent: () =>
      import('./pages/otp-validation/otp-validation.component')
        .then(m => m.OtpValidationComponent),
  },
  {
    path: 'sousCription',
    loadComponent: () =>
      import('./pages/souscription/souscription.component')
        .then(m => m.SouscriptionComponent),
  },
  {
    path: 'reunitialiserMotPasse',
    loadComponent: () =>
      import('./pages/login/reunitialiser-passe-word/reunitialiser-passe-word.component')
        .then(m => m.ReunitialiserPasseWordComponent),
  },
  {
    path: 'reset',
    loadComponent: () =>
      import('./pages/login/loading-page/loading-page.component')
        .then(m => m.LoadingPageComponent),
  },
  {
    path: 'verifieTokenAftersouscription',
    loadComponent: () =>
      import('./pages/validerTokenAfterSouscription/loading-page-after-souscription/loading-page-after-souscription.component')
        .then(m => m.LoadingPageAfterSouscriptionComponent),
  },
  {
    path: 'pageOtpAfterVerifierTokenSouscription',
    loadComponent: () =>
      import('./pages/validerTokenAfterSouscription/verifie-otp-after-verifi-token/verifie-otp-after-verifi-token.component')
        .then(m => m.VerifieOtpAfterVerifiTokenComponent),
  },
  {
    path: 'formNouveauMotPasse',
    loadComponent: () =>
      import('./pages/login/form-nouveau-mot-passe/form-nouveau-mot-passe.component')
        .then(m => m.FormNouveauMotPasseComponent),
  },
  {
    path: 'formulaireMotDePasse',
    loadComponent: () =>
      import('./pages/validerTokenAfterSouscription/formMotDePasse/form-mot-de-passe.component')
        .then(m => m.FormMotDePasseComponent),
  },
  {
    path: 'validerOtpLogin',
    loadComponent: () =>
      import('./pages/login/valider-otp-after-login/valider-otp-after-login.component')
        .then(m => m.ValiderOtpAfterLoginComponent),
  },
  {
    path: 'valider-otp',
    loadComponent: () =>
      import('./pages/otp-after-change-info/otp-after-change-info.component')
        .then(m => m.OtpAfterChangeInfoComponent),
  },
  {
    path: 'validate-email2',
    loadComponent: () =>
      import('./pages/verifyemail-afterchange-page/verifyemail-afterchange-page.component')
        .then(m => m.VerifyemailAfterchangePageComponent),
  },
  // Partie valider utilisateur après création
  {
    path: 'verifierValiditerEmail',
    loadComponent: () =>
      import('./pages/login/validerUtilisateurCreer/verifier-validiter-email/verifier-validiter-email.component')
        .then(m => m.VerifierValiditerEmailComponent),
  },
  {
    path: 'verifierOtpSiValide',
    loadComponent: () =>
      import('./pages/login/validerUtilisateurCreer/verifier-opt/verifier-opt.component')
        .then(m => m.VerifierOptComponent),
  },
  {
    path: 'creerMotDePasse',
    loadComponent: () =>
      import('./pages/login/validerUtilisateurCreer/creer-mot-de-passe/creer-mot-de-passe.component')
        .then(m => m.CreerMotDePasseComponent),
  },

  // Routes protégées via LayoutComponent
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
        canActivate: [AuthGuard],
      },
      {
        path: 'compteCourantEpargne',
        loadComponent: () =>
          import('./pages/compte/compte-courant-epargne/compte-courant-epargne.component')
            .then(m => m.CompteCourantEpargneComponent),
        canActivate: [AuthGuard],
      },
      {
        path: 'visualiserReleveCompteCourant',
        loadComponent: () =>
          import('./pages/compte/visualiser-un-releve-compte-courant-epargne/visualiser-un-releve-compte-courant-epargne.component')
            .then(m => m.VisualiserUnReleveCompteCourantEpargneComponent),
        canActivate: [AuthGuard],
      },
      {
        path: 'preparationPaie',
        loadComponent: () =>
          import('./pages/transaction/transfertMultiple/preparation-paie/preparation-paie.component')
            .then(m => m.PreparationPaieComponent),
        canActivate: [AuthGuard],
      },
      {
        path: 'transfertUnique',
        loadComponent: () =>
          import('./pages/transaction/transfertUnique/transfert-unique/transfert-unique.component')
            .then(m => m.TransfertUniqueComponent),
        canActivate: [AuthGuard],
      },
      {
        path: 'calculPaie',
        loadComponent: () =>
          import('./pages/transaction/transfertMultiple/calcul-paie/calcul-paie.component')
            .then(m => m.CalculPaieComponent),
        canActivate: [AuthGuard],
      },
      {
        path: 'validationApprobation',
        loadComponent: () =>
          import('./pages/transaction/transfertMultiple/validation-approbation/validation-approbation.component')
            .then(m => m.ValidationApprobationComponent),
        canActivate: [AuthGuard],
      },
      {
        path: 'detailsValidationApprobation',
        loadComponent: () =>
          import('./pages/transaction/transfertMultiple/details-validation-approbation/details-validation-approbation.component')
            .then(m => m.DetailsValidationApprobationComponent),
        canActivate: [AuthGuard],
      },
      {
        path: 'executeDistribution',
        loadComponent: () =>
          import('./pages/transaction/transfertMultiple/execution-distribution/execution-distribution.component')
            .then(m => m.ExecutionDistributionComponent),
        canActivate: [AuthGuard],
      },
      {
        path: 'soumissionPaiement',
        loadComponent: () =>
          import('./pages/transaction/transfertMultiple/soumission-pour-paiement/soumission-pour-paiement.component')
            .then(m => m.SoumissionPourPaiementComponent),
        canActivate: [AuthGuard],
      },
      {
        path: 'soumissionOtpValidation',
        loadComponent: () =>
          import('./pages/transaction/transfertMultiple/soumission-otp-validation/soumission-otp-validation.component')
            .then(m => m.SoumissionOtpValidationComponent),
        canActivate: [AuthGuard],
      },
      {
        path: 'detailDuCompte',
        loadComponent: () =>
          import('./pages/details-du-compte/details-du-compte.component')
            .then(m => m.DetailsDuCompteComponent),
        canActivate: [AuthGuard],
      },
      {
        path: 'transactions',
        loadComponent: () =>
          import('./pages/transaction/transactions/transactions.component')
            .then(m => m.TransactionsComponent),
        canActivate: [AuthGuard],
      },
      {
        path: 'chargementDeFichier',
        loadComponent: () =>
          import('./pages/transaction/transfertMultiple/chargement-de-fichier/chargement-de-fichier.component')
            .then(m => m.ChargementDeFichierComponent),
        canActivate: [AuthGuard],
      },
      {
        path: 'utilisateurs',
        loadComponent: () =>
          import('./pages/parametre/utilisateurs/utilisateurs.component')
            .then(m => m.UtilisateursComponent),
        canActivate: [AuthGuard],
      },
      {
        path: 'modifierMesInfos',
        loadComponent: () =>
          import('./pages/parametre/modifier-mes-infos/modifier-mes-infos.component')
            .then(m => m.ModifierMesInfosComponent),
        canActivate: [AuthGuard],
      },
      {
        path: 'mesNotifications',
        loadComponent: () =>
          import('./pages/mes-notifications-component/mes-notifications-component.component')
            .then(m => m.MesNotificationsComponentComponent),
        canActivate: [AuthGuard],
      },
      {
        path: 'typePaiement',
        loadComponent: () =>
          import('./pages/modePaiement/type-paiement/type-paiement.component')
            .then(m => m.TypePaiementComponent),
        canActivate: [AuthGuard],
      },
      {
        path: 'modePaiment',
        loadComponent: () =>
          import('./pages/modePaiement/formulaire-mode-paiement/formulaire-mode-paiement.component')
            .then(m => m.FormulaireModePaiementComponent),
        canActivate: [AuthGuard],
      },
      {
        path: 'recapModePaiement',
        loadComponent: () =>
          import('./pages/modePaiement/recapModePaiement/recap-mode-paiement.component')
            .then(m => m.RecapModePaiementComponent),
        canActivate: [AuthGuard],
      }, 
       {
        path: 'successTranfertUnique',
        loadComponent: () =>
          import('./pages/transaction/transfertUnique/success/success.component')
            .then(m => m.SuccessComponent),
        canActivate: [AuthGuard],
      },
      {
        path: 'otpVerificationTransfertUnique',
        loadComponent: () =>
          import('./pages/transaction/transfertUnique/otp-verification/otp-verification.component')
            .then(m => m.OtpVerificationComponent),
        canActivate: [AuthGuard],
      },
      {
        path: 'otpVerificationPaiement',
        loadComponent: () =>
          import('./pages/modePaiement/otpVerificationPaiement/verification-otp.component')
            .then(m => m.VerificationOtpComponent),
        canActivate: [AuthGuard],
      },
      {
        path: 'successPaiement',
        loadComponent: () =>
          import('./pages/modePaiement/successPaiement/success-paiement.component')
            .then(m => m.SuccessPaiementComponent),
        canActivate: [AuthGuard],
      },
      {
        path: 'paiementFacture',
        loadComponent: () =>
          import('./pages/factures/paiements-de-factures/paiements-de-factures.component')
            .then(m => m.PaiementsDeFacturesComponent),
        canActivate: [AuthGuard],
      },
      {
        path: 'paiementFactureEDG',
        loadComponent: () =>
          import('./pages/factures/paiements-de-factures-edg/paiements-de-factures-edg.component')
            .then(m => m.PaiementsDeFacturesEDGComponent),
        canActivate: [AuthGuard],
      },
      {
        path: 'listeBeneficiaire',
        loadComponent: () =>
          import('./pages/liste-des-beneficiaire/liste-des-beneficiaire.component')
            .then(m => m.ListeDesBeneficiaireComponent),
        canActivate: [AuthGuard],
      },
      {
        path: 'beneficiaireEnAttente',
        loadComponent: () =>
          import('./pages/beneficiaireEnAttente/beneficiaire-en-attente.component')
            .then(m => m.BeneficiaireEnAttenteComponent),
        canActivate: [AuthGuard],
      },
      {
        path: 'beneficiairesEnAttente/detail/:id',
        loadComponent: () =>
          import('./pages/beneficiaireEnAttente/detail-beneficiaire/detail-beneficiaire.component')
            .then(m => m.DetailBeneficiaireComponent),
        canActivate: [AuthGuard],
      },
      {
        path: 'beneficiaires/modifier/:id',
        loadComponent: () =>
          import('./pages/liste-des-beneficiaire/modifier-beneficiaire/modifier-beneficiaire.component')
            .then(m => m.ModifierBeneficiaireComponent),
        canActivate: [AuthGuard],
      },
      {
        path: 'detailBeneficiaire',
        loadComponent: () =>
          import('./pages/transaction/transfertMultiple/details-beneficiaire/details-beneficiaire.component')
            .then(m => m.DetailsBeneficiaireComponent),
        canActivate: [AuthGuard],
      },
      {
        path: 'modificationDetailBeneficiaire',
        loadComponent: () =>
          import('./pages/transaction/transfertMultiple/modification-details-beneficiaire/modification-details-beneficiaire.component')
            .then(m => m.ModificationDetailsBeneficiaireComponent),
        canActivate: [AuthGuard],
      },
      {
        path: 'formulaireValidationApprobation',
        loadComponent: () =>
          import('./pages/transaction/transfertMultiple/formulaire-validation-approbation/formulaire-validation-approbation.component')
            .then(m => m.FormulaireValidationApprobationComponent),
        canActivate: [AuthGuard],
      },
      {
        path: 'chargementDeFichier',
        loadComponent: () =>
          import('./pages/transaction/transfertMultiple/chargement-de-fichier/chargement-de-fichier.component')
            .then(m => m.ChargementDeFichierComponent),
        canActivate: [AuthGuard],
      },
      {
        path: 'securityQuestion',
        loadComponent: () =>
          import('./pages/transaction/transfertUnique/security-question/security-question.component')
            .then(m => m.SecurityQuestionComponent),
        canActivate: [AuthGuard],
      },
      {
        path: 'recap',
        loadComponent: () =>
          import('./pages/transaction/transfertUnique/recap/recap.component')
            .then(m => m.RecapComponent),
        canActivate: [AuthGuard],
      },
      {
        path: 'success',
        loadComponent: () =>
          import('./pages/transaction/transfertUnique/success/success.component')
            .then(m => m.SuccessComponent),
        canActivate: [AuthGuard],
      },
    ],
  },

  // Route catch-all
  {
    path: '**',
    redirectTo: 'notFound',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
