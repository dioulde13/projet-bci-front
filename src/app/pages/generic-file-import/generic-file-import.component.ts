import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as XLSX from 'xlsx';
import { GenericFileService } from '../../services/genericFileImport/generic-file.service';

export interface FileField {
  key: string;
  label: string;
  required?: boolean;
  type?: 'string' | 'number' | 'date';
}

@Component({
  selector: 'bci-generic-file-import',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './generic-file-import.component.html',
})
export class GenericFileImportComponent {
  // --- CONFIGURATION DE L'INTERFACE (UI) ---
  @Input() title: string = 'Chargement de';
  @Input() instructions: string =
    'Assurez-vous de charger le fichier et de vérifier les données.';
  @Input() previewTitle: string = 'Aperçu des Transactions';
  @Input() validateButtonText: string = 'Valider les Transactions';
  @Input() isOpenModal: boolean = false;

  // --- CONFIGURATION DES DONNÉES ---
  @Input() fields: FileField[] = [];
  @Input() duplicateCheckFields: string[] = [];

  // --- CONFIGURATION VALIDATION API ---
  @Input() enableApiValidation: boolean = false;
  @Input() compteFieldKey: string = 'numeroDeCompte';
  @Input() bicFieldKey: string = 'bic';
  @Input() deviseFieldKey: string = 'devise';

  // --- ÉVÉNEMENTS ---
  @Output() modalClosed = new EventEmitter<void>();
  @Output() importDataCompleted = new EventEmitter<{
    data: any[];
    file: File | null;
  }>();

  // --- RÉFÉRENCES ET ÉTAT INTERNE ---
  @ViewChild('fileInput') fileInput!: ElementRef;
  selectedFile: File | null = null;
  importedData: any[] = [];
  isLoading = false;
  isValidating = false;

  currentPage: number = 1;
  pageSize: number = 10;

  constructor(private genericFileService: GenericFileService) {}

  // Données paginées
  get paginatedData(): any[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.importedData.slice(startIndex, startIndex + this.pageSize);
  }

  // Nombre total de pages
  get totalPages(): number {
    return Math.ceil(this.importedData.length / this.pageSize);
  }

  // Nombre de lignes invalides
  get invalidCount(): number {
    return this.importedData.filter((r) => r._valid === false).length;
  }

  // --- GESTION DE LA SÉLECTION DU FICHIER ---
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile = input.files[0];
      this.importedData = [];
      this.currentPage = 1;
    }
  }

  // --- LECTURE DU FICHIER ---
  parseSelectedFile(): void {
    if (!this.selectedFile) return;
    this.isLoading = true;
    const reader = new FileReader();

    reader.onload = (e: any) => {
      this.processFileContent(e.target.result);
    };

    reader.readAsArrayBuffer(this.selectedFile);
  }

  // --- CONVERSION EXCEL/CSV VERS JSON ---
  private processFileContent(content: ArrayBuffer): void {
    try {
      const workbook = XLSX.read(content, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawData = XLSX.utils.sheet_to_json(sheet, { defval: null });
      this.mapAndValidate(rawData as any[]);
    } catch {
      alert('Format de fichier invalide.');
      this.isLoading = false;
    }
  }

  // --- MAPPAGE ET DÉCLENCHEMENT DE LA VALIDATION ---
  private mapAndValidate(data: any[]): void {
    if (!data.length) {
      this.isLoading = false;
      return;
    }

    const mapped = data.map((row) => this.transformRow(row));

    if (this.duplicateCheckFields.length > 0) {
      this.importedData = this.detectDuplicates(mapped);
    } else {
      this.importedData = mapped;
    }

    // Lancer la validation API si activée
    if (this.enableApiValidation) {
      this.runApiValidation();
    } else {
      this.isLoading = false;
    }
  }

  // --- VALIDATION API ---
  private runApiValidation(): void {
    this.isValidating = true;

    const transactions = this.importedData.map((row, index) => ({
      compte: String(row[this.compteFieldKey] || ''),
      bic: String(row[this.bicFieldKey] || ''),
      devise: String(row[this.deviseFieldKey] || ''),
      idtableau: index + 1,
    }));

    this.genericFileService.validateTransactions(transactions).subscribe({
      next: (response) => {
        if (response?.data) {
          console.log("response?.data: ", response?.data);
          // Fusionner les résultats dans importedData via idtableau
          response.data.forEach((result) => {
            const index = result.idtableau - 1;
            if (this.importedData[index]) {
              this.importedData[index]._valid = result.valid;
              this.importedData[index]._errors = result.errors ?? [];
            }
          });
        }
        this.isValidating = false;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur validation API:', err);
        this.isValidating = false;
        this.isLoading = false;
      },
    });
  }

  // --- LOGIQUE DE DÉTECTION DES DOUBLONS ---
  private detectDuplicates(data: any[]): any[] {
    const trackers = new Map<string, number>();

    data.forEach((row) => {
      this.duplicateCheckFields.forEach((field) => {
        const val = String(row[field] || '').trim().toLowerCase();
        if (val && val !== '-') {
          const compositeKey = `${field}_${val}`;
          trackers.set(compositeKey, (trackers.get(compositeKey) || 0) + 1);
        }
      });
    });

    return data.map((row) => {
      const isDuplicate = this.duplicateCheckFields.some((field) => {
        const val = String(row[field] || '').trim().toLowerCase();
        const compositeKey = `${field}_${val}`;
        return val && val !== '-' && (trackers.get(compositeKey) || 0) > 1;
      });
      return { ...row, isDuplicate };
    });
  }

  // --- TRANSFORMATION ET FORMATAGE DES LIGNES ---
  private transformRow(row: any): any {
    const mappedRow: any = {};
    this.fields.forEach((field) => {
      mappedRow[field.key] = this.formatValue(row[field.key], field.type);
    });
    return mappedRow;
  }

  private formatValue(value: any, type?: string): any {
    if (value === null || value === undefined) return '-';
    if (type === 'number') return isNaN(Number(value)) ? 0 : Number(value);
    if (type === 'date') {
      const d = new Date(value);
      return isNaN(d.getTime()) ? value : d.toLocaleDateString();
    }
    return value;
  }

  // --- SUPPRESSION D'UNE LIGNE ---
  removeRow(index: number): void {
    const realIndex = (this.currentPage - 1) * this.pageSize + index;
    this.importedData.splice(realIndex, 1);
    if (this.paginatedData.length === 0 && this.currentPage > 1) {
      this.currentPage--;
    }
  }

  // --- EXPORTATION DES DONNÉES VERS LE PARENT ---
  validateTransactions(): void {
    if (this.importedData.length) {
      const cleanData = this.importedData.map(
        ({ isDuplicate, _valid, _errors, ...rest }) => rest
      );
      this.importDataCompleted.emit({
        data: cleanData,
        file: this.selectedFile,
      });
    }
  }

  // --- RÉINITIALISATION ET FERMETURE ---
  reset(): void {
    this.selectedFile = null;
    this.importedData = [];
    if (this.fileInput) this.fileInput.nativeElement.value = '';
  }

  closeModal(): void {
    this.reset();
    this.modalClosed.emit();
  }
}