import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ModularGroup, OrderComputationResult } from '../../services/modular-group';

@Component({
  selector: 'app-problem6-zn-order-idempotent',
  imports: [RouterModule],
  templateUrl: './problem6-zn-order-idempotent.html',
  styleUrl: './problem6-zn-order-idempotent.scss',
})
export class Problem6ZnOrderIdempotent {
  modulus = 10; // n
  element = 3; // a

  computationResult: OrderComputationResult | null = null;
  isIdempotentResult: boolean | null = null;
  errorMessage: string | null = null;

  constructor(private modularGroupService: ModularGroup) {}

  // Handle changes in the modulus input field.
  onModulusChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = Number(input.value);

    this.modulus = Number.isNaN(value) ? 0 : value;
  }

  // Handle changes in the element input field.
  onElementChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = Number(input.value);

    this.element = Number.isNaN(value) ? 0 : value;
  }

  // Run the computations: order and idempotent check.
  onCompute(): void {
    this.errorMessage = null;
    this.computationResult = null;
    this.isIdempotentResult = null;

    try {
      if (!Number.isInteger(this.modulus) || this.modulus <= 1) {
        this.errorMessage = 'Modulul n trebuie să fie un număr întreg cel puțin 2.';
        return;
      }

      if (!Number.isInteger(this.element)) {
        this.errorMessage = 'Elementul a trebuie să fie un număr întreg.';
        return;
      }

      // Compute order in (Z_n, ·)
      this.computationResult = this.modularGroupService.computeOrderInZn(
        this.element,
        this.modulus
      );

      // Compute idempotent status
      this.isIdempotentResult = this.modularGroupService.isIdempotent(this.element, this.modulus);
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.errorMessage = error.message;
      } else {
        this.errorMessage = 'A apărut o eroare neașteptată în timpul calculului.';
      }
    }
  }
}
