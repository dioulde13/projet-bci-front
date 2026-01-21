import { Injectable } from '@angular/core';
declare var bootstrap: any;

@Injectable({
  providedIn: 'root',
})
export class ModalsService {
  private currentModal: any = null;

  constructor() {}

  // Ouvrir une modal par son ID
  openModal(modalId: string): void {
    const modalElement = document.getElementById(modalId);

    if (!modalElement) {
      console.error(`Modal avec l'ID ${modalId} non trouvée`);
      return;
    }

    // Fermer l'ancienne modal si une est déjà ouverte
    if (this.currentModal) {
      this.currentModal.hide();
    }

    // Initialisation avec protection contre fermeture par clic extérieur
    const modal = new bootstrap.Modal(modalElement, {
      backdrop: 'static', // Empêche fermeture clic extérieur
      keyboard: false, // Empêche fermeture avec ESC
    });

    // Empêcher la fermeture automatique sur clic de fond (au cas où)
    modalElement.addEventListener('click', (event: any) => {
      if (event.target === modalElement) {
        event.stopPropagation(); // bloque la fermeture
      }
    });

    modal.show();
    this.currentModal = modal;

    // Ajoute un listener pour fermer via bouton "btn-close" uniquement
    const closeButtons = modalElement.querySelectorAll(
      '.btn-close, [data-dismiss="custom"]'
    );

    closeButtons.forEach((btn: any) => {
      btn.addEventListener('click', () => this.closeModal(modalId));
    });
  }

  // Fermer un modal par son ID
  closeModal(modalId: string): void {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
        this.currentModal = null;
      }
    }
  }

  // Fermer toutes les modals
  closeAllModals(): void {
    const modals = document.querySelectorAll('.modal.show');
    modals.forEach((modalElement: any) => {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    });
    this.currentModal = null;
  }

  // Vérifier si une modal est ouverte
  isModalOpen(modalId: string): boolean {
    const modalElement = document.getElementById(modalId);
    return modalElement?.classList.contains('show') || false;
  }
}