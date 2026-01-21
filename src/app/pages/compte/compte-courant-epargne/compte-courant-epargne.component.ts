import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-compte-courant-epargne',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './compte-courant-epargne.component.html',
  styleUrl: './compte-courant-epargne.component.css'
})
export class CompteCourantEpargneComponent implements OnInit {

  ngOnInit(): void {
    const hasReloaded = localStorage.getItem('compte_courant_epargne_reloaded');

    // Ne recharge qu'une seule fois
    if (!hasReloaded) {
      localStorage.setItem('compte_courant_epargne_reloaded', 'true');
      location.reload(); // Recharge total
    } else {
      // Nettoyage pour permettre un autre reload si besoin plus tard
      localStorage.removeItem('compte_courant_epargne_reloaded');
    }
  }
}
