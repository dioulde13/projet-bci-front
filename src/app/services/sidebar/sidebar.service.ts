import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SidebarService {
  private _isSidebarCollapsed = true;
  private _openSubMenus: Set<string> = new Set<string>();

  constructor() {
    this.loadState();
  }

  get isSidebarCollapsed(): boolean {
    return this._isSidebarCollapsed;
  }

  set isSidebarCollapsed(value: boolean) {
    this._isSidebarCollapsed = value;
    localStorage.setItem('sidebarCollapsed', String(value));
  }

  get openSubMenus(): Set<string> {
    return this._openSubMenus;
  }

  toggleSubMenu(menuId: string): void {
    if (this._openSubMenus.has(menuId)) {
      this._openSubMenus.delete(menuId);
    } else {
      this._openSubMenus.add(menuId);
    }
    this.saveSubMenus();
  }

  isSubMenuOpen(menuId: string): boolean {
    return this._openSubMenus.has(menuId);
  }

  private loadState(): void {
    const savedCollapsed = localStorage.getItem('sidebarCollapsed');
    if (savedCollapsed !== null) {
      this._isSidebarCollapsed = savedCollapsed === 'true';
    }

    const savedSubMenus = localStorage.getItem('openSubMenus');
    if (savedSubMenus) {
      try {
        const arr = JSON.parse(savedSubMenus);
        this._openSubMenus = new Set(arr);
      } catch (e) {
        console.error('Error parsing openSubMenus from localStorage', e);
      }
    }
  }

  private saveSubMenus(): void {
    localStorage.setItem(
      'openSubMenus',
      JSON.stringify(Array.from(this._openSubMenus)),
    );
  }
}
