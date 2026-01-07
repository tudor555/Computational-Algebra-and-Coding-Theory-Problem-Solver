import { ChangeDetectorRef, Component, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { TranslatePipe } from '../../pipes/translate';
import { I18n } from '../../services/i18n';

interface ProblemLink {
  label: string;
  route: string;
  difficulty: 'Ușor' | 'Mediu' | 'Greu';
}

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, LucideAngularModule, TranslatePipe],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  isProblemsOpen = false;
  isLanguageOpen = false;

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

  constructor(private i18n: I18n, private cdr: ChangeDetectorRef) {}

  async onToggleLanguage(): Promise<void> {
    await this.i18n.toggleLanguage();
  }

  get currentLanguage(): 'ro' | 'en' {
    return this.i18n.currentLanguage;
  }

  toggleLanguageMenu(event?: MouseEvent): void {
    event?.stopPropagation();
    this.isLanguageOpen = !this.isLanguageOpen;
  }

  closeLanguageMenu(): void {
    this.isLanguageOpen = false;
  }

  async selectLanguage(language: 'ro' | 'en', event?: MouseEvent): Promise<void> {
    event?.stopPropagation();

    await this.i18n.setLanguage(language);

    // Force UI refresh immediately (no second click needed)
    this.closeLanguageMenu();
    this.cdr.detectChanges();
  }

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
    this.closeLanguageMenu();
  }

  // Close the dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    if (!target) return;

    const clickedInsideProblems = target.closest('[data-problems-menu]');
    if (!clickedInsideProblems) {
      this.closeProblemsMenu();
    }

    const clickedInsideLanguage = target.closest('[data-language-menu]');
    if (!clickedInsideLanguage) {
      this.closeLanguageMenu();
    }
  }
}
