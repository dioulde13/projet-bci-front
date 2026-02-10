import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class BciLoaderService {
  private isLoaded = false;
  private readonly URL =
    'https://dev-composants-bcibank-ang.ecash-guinee.com/browser';

  load(): void {
    if (this.isLoaded) return;

    // Génère un identifiant unique 
    const uniqueHash = new Date().getTime();

    // Injection CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `${this.URL}/styles.css?v=${uniqueHash}`; 
    document.head.append(link);

    // Injection JS
    const script = document.createElement('script');
    script.src = `${this.URL}/bci-generic-file-import.js?v=${uniqueHash}`; 
    script.onload = () => {
      this.isLoaded = true;
      console.log('BCI Ready with version:', uniqueHash);
    };
    document.body.append(script);
  }
}