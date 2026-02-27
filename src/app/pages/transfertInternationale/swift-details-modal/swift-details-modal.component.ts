import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common'; // Important pour *ngIf

@Component({
  selector: 'app-swift-details-modal',
  standalone: true,
  imports: [CommonModule], // Ajouté ici
  templateUrl: './swift-details-modal.component.html',
  styleUrl: './swift-details-modal.component.css',
})
export class SwiftDetailsModalComponent {
  @Input() data: any;
  @Input() title: string = 'Vérification SWIFT';
  @Input() errorMessage: string = '';
  @Input() isLoading: boolean = false;

  @Output() onClose = new EventEmitter<void>();
  @Output() onConfirm = new EventEmitter<void>();
}
