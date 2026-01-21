export interface Niveau {
  id: number;           // identifiant technique
  niveau: number;       // niveau hiérarchique (1 à 5)
  vcRoleName: string;
  vcDescription: string;
  min: number;
  max: number;
  idRole?: number;
}
