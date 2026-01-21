import { Component, OnInit } from '@angular/core';
import { RouterLink} from '@angular/router';

@Component({
  selector: 'app-execution-distribution',
  imports: [RouterLink],
  standalone: true,
  templateUrl: './execution-distribution.component.html',
  styleUrl: './execution-distribution.component.css'
})
export class ExecutionDistributionComponent implements OnInit{


    ngOnInit(): void {
    // const hasReloaded = localStorage.getItem('execute_distribution_reloaded');

    // // Ne recharge qu'une seule fois
    // if (!hasReloaded) {
    //   localStorage.setItem('execute_distribution_reloaded', 'true');
    //   location.reload(); // Recharge total
    // } else {
    //   // Nettoyage pour permettre un autre reload si besoin plus tard
    //   localStorage.removeItem('execute_distribution_reloaded');
    // }
  }
}
