import { Component, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-file-import',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './file-import.component.html',
  styleUrls: ['./file-import.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class FileImportComponent {
  title = 'generic file import';
  openModal = false; // Example des colonnes attendues
  fields: any[] = [
    { key: 'nom', label: 'Nom', required: true },
    { key: 'prenom', label: 'Prénom', required: true },
    { key: 'email', label: 'Email' },
    { key: 'age', label: 'Âge', type: 'number' },
  ]; //Cette méthode est appelée quand l'enfant clique sur "Valider les Transactions"

  onImportedData(event: any) {
    const data = event.detail || event;
    console.log('Données finales reçues du composant enfant :', data); // Demander confirmation avant de valider

    const confirmDemande = confirm(
      'Voulez-vous vraiment valider ces données ?',
    );

    if (confirmDemande) {
      // L'utilisateur a cliqué sur "OK"
      // Ici, tu peux appeler ton API pour sauvegarder les données
      // this.myService.saveTransactions(data).subscribe(
      //   response => {
      //     alert('Les données ont été validées et sauvegardées avec succès !');
      //   },
      //   error => {
      //     alert('Une erreur est survenue lors de la sauvegarde.');
      //   }
      // );

      alert('Les données ont été validées avec succès !');
    } else {
      // L'utilisateur a cliqué sur "Annuler"
      console.log('Validation annulée par l’utilisateur.');
    }
  }
}
