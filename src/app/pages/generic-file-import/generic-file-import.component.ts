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
import { NotificationService } from '../../services/notification/notification.service';

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

  // --- ÉTAT ERREURS ---
  hasColumnErrors: boolean = false;
  columnErrorMessages: string[] = [];
  fileErrorMessage: string = '';

  currentPage: number = 1;
  pageSize: number = 10;

  constructor(
    private genericFileService: GenericFileService,
    private notification: NotificationService,
  ) {}

  get paginatedData(): any[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.importedData.slice(startIndex, startIndex + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.importedData.length / this.pageSize);
  }

  get invalidCount(): number {
    return this.importedData.filter((r) => r._valid === false).length;
  }

  // --- GESTION DE LA SÉLECTION DU FICHIER ---
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    // Réinitialiser l'état à chaque nouvelle sélection
    this.importedData = [];
    this.hasColumnErrors = false;
    this.columnErrorMessages = [];
    this.fileErrorMessage = '';
    this.currentPage = 1;

    if (!input.files?.length) return;

    const file = input.files[0];
    const ext = file.name.split('.').pop()?.toLowerCase().trim();

    // ✅ Vérification 1 : extension autorisée (.xlsx ou .xls uniquement)
    if (!ext || !['xlsx', 'xls'].includes(ext)) {
      this.fileErrorMessage =
        `❌ Format non supporté : ".${ext}". Seuls les fichiers Excel (.xlsx, .xls) sont acceptés.`;
      this.notification.error(this.fileErrorMessage);
      if (this.fileInput) this.fileInput.nativeElement.value = '';
      return;
    }

    // ✅ Vérification 2 : taille maximale (10 Mo)
    const maxSizeMb = 10;
    if (file.size > maxSizeMb * 1024 * 1024) {
      this.fileErrorMessage =
        `❌ Fichier trop volumineux (${(file.size / 1024 / 1024).toFixed(1)} Mo). Taille maximale : ${maxSizeMb} Mo.`;
      this.notification.error(this.fileErrorMessage);
      if (this.fileInput) this.fileInput.nativeElement.value = '';
      return;
    }

    this.selectedFile = file;
  }

  // --- LECTURE DU FICHIER ---
  parseSelectedFile(): void {
    if (!this.selectedFile) return;
    this.isLoading = true;
    this.fileErrorMessage = '';

    const reader = new FileReader();

    reader.onload = (e: any) => {
      this.processExcelContent(e.target.result as ArrayBuffer);
    };

    reader.onerror = () => {
      this.fileErrorMessage = '❌ Impossible de lire le fichier.';
      this.notification.error(this.fileErrorMessage);
      this.isLoading = false;
    };

    reader.readAsArrayBuffer(this.selectedFile);
  }

  // --- TRAITEMENT EXCEL ---
  private processExcelContent(content: ArrayBuffer): void {
    try {
      const workbook = XLSX.read(content, { type: 'array', cellDates: true });

      // ✅ Vérification 3 : classeur non vide
      if (!workbook.SheetNames.length) {
        this.fileErrorMessage = '❌ Le fichier Excel ne contient aucune feuille.';
        this.notification.error(this.fileErrorMessage);
        this.isLoading = false;
        return;
      }

      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawData = XLSX.utils.sheet_to_json(sheet, {
        defval: null,
      }) as Record<string, unknown>[];

      // ✅ Vérification 4 : données mono-colonne avec virgules dans la clé
      // → conversion en CSV pour re-parsing correct
      if (rawData.length > 0) {
        const firstRow = rawData[0];
        const keys = Object.keys(firstRow);
        const firstKey = keys[0] ?? '';
        const keyCount = keys.length;

        // Si on n'a qu'une seule colonne et que son titre contient un séparateur,
        // c'est probablement un fichier Excel dont les données n'ont pas été réparties par colonnes.
        if (keyCount === 1 && (firstKey.includes(',') || firstKey.includes(';'))) {
          console.warn('⚠️ Données mono-colonne détectées — éclatement manuel par séparateur.');
          const separator = this.detectCsvSeparator(firstKey);
          
          // On reconstruit un tableau d'objets avec les colonnes éclatées
          const splittedKeys = firstKey.split(separator).map(k => k.trim());
          const splittedData = rawData.map(row => {
            const val = String(row[firstKey] || '');
            const splittedValues = val.split(separator);
            const newRow: any = {};
            splittedKeys.forEach((k, idx) => {
              newRow[k] = splittedValues[idx] || null;
            });
            return newRow;
          });

          this.mapAndValidate(this.normalizeKeys(splittedData));
          return;
        }
      }

      // ✅ Normaliser les clés
      const normalizedData = this.normalizeKeys(rawData as any[]);
      this.mapAndValidate(normalizedData);

    } catch (err) {
      console.error('Erreur lecture Excel:', err);
      this.fileErrorMessage =
        '❌ Impossible de lire ce fichier Excel. Vérifiez qu\'il n\'est pas corrompu ou protégé.';
      this.notification.error(this.fileErrorMessage);
      this.isLoading = false;
    }
  }

  // --- RE-PARSING CSV STRING ---
  private reparseAsCsv(content: ArrayBuffer): void {
    try {
      const decoder = new TextDecoder('utf-8');
      const text = decoder.decode(content).replace(/^﻿/, '');
      this.parseAndProcessCsvString(text);
    } catch (err) {
      console.error('Erreur re-parsing CSV:', err);
      this.fileErrorMessage = '❌ Impossible de lire les données texte.';
      this.notification.error(this.fileErrorMessage);
      this.isLoading = false;
    }
  }

  private parseAndProcessCsvString(csvText: string): void {
    try {
      const separator = this.detectCsvSeparator(csvText);
      // On force le séparateur lors de la lecture
      const workbook = XLSX.read(csvText, { type: 'string', FS: separator });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawData = XLSX.utils.sheet_to_json(sheet, {
        defval: null,
        raw: false,
      }) as Record<string, unknown>[];

      const normalizedData = this.normalizeKeys(rawData as any[]);
      this.mapAndValidate(normalizedData);
    } catch (err) {
      console.error('Erreur parsing CSV string:', err);
      this.fileErrorMessage =
        '❌ Impossible de découper les données. Vérifiez le format (virgules ou point-virgules).';
      this.notification.error(this.fileErrorMessage);
      this.isLoading = false;
    }
  }

  // --- DÉTECTION DU SÉPARATEUR CSV ---
  private detectCsvSeparator(text: string): string {
    const firstLine = text.split('\n')[0] || '';
    const counts: Record<string, number> = {
      ';': (firstLine.match(/;/g) || []).length,
      ',': (firstLine.match(/,/g) || []).length,
      '	': (firstLine.match(/	/g) || []).length,
    };
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  }

  // --- NORMALISATION DES CLÉS ---
  // Supprime BOM, espaces et caractères invisibles dans les noms de colonnes
  private normalizeKeys(data: any[]): any[] {
    return data.map((row) => {
      const normalized: any = {};
      Object.entries(row).forEach(([key, value]) => {
        const cleanKey = key
          .replace(/^\uFEFF/, '')                        // BOM en début
          .replace(/[\u200B\u200C\u200D\uFEFF]/g, '')   // Caractères invisibles
          .trim();                                        // Espaces
        normalized[cleanKey] = value;
      });
      return normalized;
    });
  }

  colonneValides: any[] = [
    { key: 'prenom' },
    { key: 'nom' },
    { key: 'typeBeneficiaire' },
    { key: 'numeroCompte' },
    { key: 'bic' },
    { key: 'montant' },
    { key: 'devise' },
    { key: 'modePaiement' },
    { key: 'nomBanque' },
    { key: 'adresseBanque' },
    { key: 'objetPaiement' },
  ];

  tableauFichier!: any[];

  // --- MAPPAGE ET DÉCLENCHEMENT DE LA VALIDATION ---
  private mapAndValidate(data: any[]): void {
    console.log('data normalisée:', data);
    this.tableauFichier = data;
    this.hasColumnErrors = false;
    this.columnErrorMessages = [];

    // ✅ Vérification 5 : fichier vide (aucune ligne de données)
    if (!data.length) {
      this.fileErrorMessage =
        '❌ Le fichier est vide ou ne contient aucune ligne de données.';
      this.notification.error(this.fileErrorMessage);
      this.isLoading = false;
      return;
    }

    const validKeys = this.colonneValides.map((f: any) => f.key);
    const fileKeys = Object.keys(data[0]);

    console.log('colonnes attendues :', validKeys);
    console.log('colonnes du fichier :', fileKeys);

    // ✅ Vérification 6 : colonnes inconnues ou mal nommées
    fileKeys.forEach((fileKey: string) => {
      if (!validKeys.includes(fileKey)) {
        const suggestion = validKeys.find(
          (validKey: string) =>
            validKey.toLowerCase() === fileKey.toLowerCase() ||
            validKey.toLowerCase().includes(fileKey.toLowerCase()) ||
            fileKey.toLowerCase().includes(validKey.toLowerCase()),
        );

        const msg = suggestion
          ? `❌ Colonne incorrecte : "${fileKey}" → Utilisez "${suggestion}"`
          : `❌ Colonne inconnue : "${fileKey}" → Colonnes attendues : ${validKeys.join(', ')}`;

        this.columnErrorMessages.push(msg);
      }
    });

    // ✅ Vérification 7 : colonnes obligatoires manquantes
    this.colonneValides.forEach((colDef: any) => {
      if (colDef.required && !fileKeys.includes(colDef.key)) {
        this.columnErrorMessages.push(
          `❌ Colonne obligatoire manquante : "${colDef.key}"`,
        );
      }
    });

    // 🚫 Stopper si des erreurs de colonnes existent
    if (this.columnErrorMessages.length > 0) {
      this.hasColumnErrors = true;
      this.isLoading = false;
      this.notification.error(
        `${this.columnErrorMessages.length} erreur(s) de colonnes détectée(s).`,
      );
      return;
    }

    // ✅ Colonnes OK → mapping + API
    const mapped = data.map((row) => this.transformRow(row));

    this.importedData =
      this.duplicateCheckFields.length > 0
        ? this.detectDuplicates(mapped)
        : mapped;

    console.log('✅ Données chargées :', this.importedData.length, 'ligne(s)');

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
          console.log('résultats validation API:', response?.data);
          response.data.forEach((result) => {
            const index = result.idtableau - 1;
            if (this.importedData[index]) {
              this.importedData[index]._valid = result.valid;
              this.importedData[index]._errors = result.errors ?? [];
            }
          });
          localStorage.setItem(
            'validationResults',
            JSON.stringify(response.data),
          );
        }
        this.isValidating = false;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur validation API:', err);
        this.notification.error('❌ Erreur lors de la validation des données.');
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
    if (value === null || value === undefined || value === '') return '-';

    if (type === 'number') {
      const normalized = String(value).replace(',', '.');
      return isNaN(Number(normalized)) ? 0 : Number(normalized);
    }

    if (type === 'date') {
      if (value instanceof Date) {
        return isNaN(value.getTime()) ? '-' : value.toLocaleDateString('fr-FR');
      }
      if (typeof value === 'number') {
        const parsed = XLSX.SSF.parse_date_code(value);
        if (parsed) {
          return new Date(parsed.y, parsed.m - 1, parsed.d).toLocaleDateString('fr-FR');
        }
      }
      const d = new Date(value);
      return isNaN(d.getTime()) ? String(value).trim() : d.toLocaleDateString('fr-FR');
    }

    return String(value).trim();
  }

  // --- SUPPRESSION D'UNE LIGNE ---
  removeRow(index: number): void {
    const realIndex = (this.currentPage - 1) * this.pageSize + index;
    this.importedData.splice(realIndex, 1);

    const updatedResults = this.importedData.map((row, i) => ({
      compte: String(row[this.compteFieldKey] || ''),
      bic: String(row[this.bicFieldKey] || ''),
      devise: String(row[this.deviseFieldKey] || ''),
      idtableau: i + 1,
      valid: row._valid,
      errors: row._errors ?? [],
    }));
    localStorage.setItem('validationResults', JSON.stringify(updatedResults));

    if (this.paginatedData.length === 0 && this.currentPage > 1) {
      this.currentPage--;
    }
  }

  // --- EXPORTATION DES DONNÉES VERS LE PARENT ---
  validateTransactions(): void {
    if (this.importedData.length) {
      const cleanData = this.importedData.map(
        ({ isDuplicate, _valid, _errors, ...rest }) => rest,
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
    this.hasColumnErrors = false;
    this.columnErrorMessages = [];
    this.fileErrorMessage = '';
    if (this.fileInput) this.fileInput.nativeElement.value = '';
  }

  closeModal(): void {
    this.reset();
    this.modalClosed.emit();
  }
}