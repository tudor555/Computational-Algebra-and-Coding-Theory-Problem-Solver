import { Component, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

interface ProblemLink {
  label: string;
  route: string;
  difficulty: 'Ușor' | 'Mediu' | 'Greu';
}

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  isProblemsOpen = false;

  readonly githubRepoUrl =
    'https://github.com/tudor555/Computational-Algebra-and-Coding-Theory-Problem-Solver.git';

  readonly problems: ProblemLink[] = [
    {
      label: 'Problema 1 – Matrice triunghiulare',
      route: '/triangular-matrices',
      difficulty: 'Ușor',
    },
    {
      label: 'Problema 2 – Simetrică / antisimetrică',
      route: '/matrix-decomposition',
      difficulty: 'Ușor',
    },
    {
      label: 'Problema 6 – Ordin & idempotent în ℤₙ',
      route: '/zn-order-idempotent',
      difficulty: 'Ușor',
    },

    {
      label: 'Problema 5 – Rang & inversă (Gauss)',
      route: '/gauss-rank-inverse',
      difficulty: 'Mediu',
    },
    {
      label: 'Problema 11 – Matrice de control (H)',
      route: '/code-parity-check',
      difficulty: 'Mediu',
    },

    {
      label: 'Problema 12 – Valori proprii (2×2, 3×3)',
      route: '/eigen-values',
      difficulty: 'Greu',
    },
    {
      label: 'Problema 14 – Euclid + fracție continuă',
      route: '/euclid-continued-fraction',
      difficulty: 'Greu',
    },
  ];

  toggleProblemsMenu(): void {
    this.isProblemsOpen = !this.isProblemsOpen;
  }

  closeProblemsMenu(): void {
    this.isProblemsOpen = false;
  }

  // Close the dropdown when pressing Escape
  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeProblemsMenu();
  }

  // Close the dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    if (!target) return;

    // Any element inside the menu or button should keep it open
    const clickedInsideMenu = target.closest('[data-problems-menu]');
    if (!clickedInsideMenu) {
      this.closeProblemsMenu();
    }
  }
}
