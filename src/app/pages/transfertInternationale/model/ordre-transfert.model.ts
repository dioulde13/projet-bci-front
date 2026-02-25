export type TBankTarget = 'beneficiaire' | 'intermediaire';
export interface IBeneficiaire {
  BeneficiaryID: number;
  raisonSocialeB: string;
  vcAddress: string;
  vcAccountNumber: string;
  vcName: string;
  vcBIC: string;
  vcLastName: string;
  vcFirstName: string;
  vcCurrency:string;
  bankIntermediaire?: string;
  swifibankIntermediaire?: string;
}

export interface ITransfertForm {
  // Étape 1 : Donneur d'ordre
  raisonSocialeDO: string;
  adresseDO: string;
  compteTransfert: string;
  compteCommission: string;
  devise: string;
  fraisEtranger: string;
  montant: number | null;

  // Étape 2 : Opération
  motifEconomique: string;
  refDocument: string;
  typeTransaction: string;
  autreTypeTransaction: string;

  // Étape 3 : Bénéficiaire
  raisonSocialeB: string;
  adresseB: string;
  ibanNCompte: string;
  bankBeneficiaire: string;
  swifiBankBeneficiaire: string;
  bankIntermediaire: string;
  swifibankIntermediaire: string;
  ddiFile: File | null;
  assuranceFile: File | null;
}
