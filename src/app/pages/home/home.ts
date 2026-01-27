import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '../../pipes/translate';

type Difficulty = 'easy' | 'medium' | 'hard';

interface HomeProblemCard {
  id: string;
  number: number;
  route: string;
  difficulty: Difficulty;
}

@Component({
  selector: 'app-home',
  imports: [RouterModule, NgClass, TranslatePipe],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  // Controls how many problem cards are displayed per row on desktop.
  readonly cardsPerRow: 2 | 3 | 4 = 3;

  readonly problems: HomeProblemCard[] = [
    { id: 'problem1', number: 1, route: '/triangular-matrices', difficulty: 'easy' },
    { id: 'problem2', number: 2, route: '/matrix-decomposition', difficulty: 'easy' },
    { id: 'problem6', number: 6, route: '/zn-order-idempotent', difficulty: 'easy' },

    { id: 'problem3', number: 3, route: '/hermitian-matrix-inverse', difficulty: 'medium' },
    { id: 'problem4', number: 4, route: '/gauss-4x4-linear-system', difficulty: 'medium' },
    { id: 'problem5', number: 5, route: '/gauss-rank-inverse', difficulty: 'medium' },
    { id: 'problem9', number: 9, route: '/linear-code-check', difficulty: 'medium' },
    { id: 'problem10', number: 10, route: '/generator-matrix-codewords', difficulty: 'medium' },
    { id: 'problem11', number: 11, route: '/code-parity-check', difficulty: 'medium' },

    { id: 'problem7', number: 7, route: '/m2r-matrix-order-idempotent', difficulty: 'hard' },
    { id: 'problem8', number: 8, route: '/code-parameters', difficulty: 'hard' },
    { id: 'problem12', number: 12, route: '/eigen-values', difficulty: 'hard' },
    { id: 'problem13', number: 13, route: '/galois-group-polynomial', difficulty: 'hard' },
    { id: 'problem14', number: 14, route: '/euclid-continued-fraction', difficulty: 'hard' },
  ];

  get gridClass(): string {
    switch (this.cardsPerRow) {
      case 2:
        return 'md:grid-cols-2';
      case 3:
        return 'md:grid-cols-3';
      case 4:
        return 'md:grid-cols-4';
      default:
        return 'md:grid-cols-2';
    }
  }

  get easyProblems(): HomeProblemCard[] {
    return this.problems.filter((problem) => problem.difficulty === 'easy');
  }

  get mediumProblems(): HomeProblemCard[] {
    return this.problems.filter((problem) => problem.difficulty === 'medium');
  }

  get hardProblems(): HomeProblemCard[] {
    return this.problems.filter((problem) => problem.difficulty === 'hard');
  }

  trackByProblemId(_: number, item: HomeProblemCard): string {
    return item.id;
  }
}
