import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SelectedBeneficiairesService {
  private selected: any[] = [];
  private selectedIds: Set<string> = new Set(); // ← NOUVEAU

  setSelected(beneficiaires: any[]): void {
    this.selected = beneficiaires;
  }

  getSelected(): any[] {
    return this.selected;
  }

  // ── Méthodes pour persister les IDs cochés ──────────────────
  setSelectedIds(ids: Set<string>): void {
    this.selectedIds = new Set(ids);
  }

  getSelectedIds(): Set<string> {
    return new Set(this.selectedIds);
  }

  clearSelectedIds(): void {
    this.selectedIds.clear();
  }
}