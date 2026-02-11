import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ModularGroup, OrderComputationResult } from '../../../services/modular-group';
import { LucideAngularModule } from 'lucide-angular';
import { TranslatePipe } from '../../../pipes/translate';

@Component({
  selector: 'app-problem6-zn-order-idempotent',
  imports: [RouterModule, LucideAngularModule, TranslatePipe],
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

  // Handle changes in the modulus input field
  onModulusChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = Number(input.value);

    this.modulus = Number.isNaN(value) ? 0 : value;
  }

  // Handle changes in the element input field
  onElementChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = Number(input.value);

    this.element = Number.isNaN(value) ? 0 : value;
  }

  // Run the computations: order and idempotent check
  onCompute(): void {
    this.errorMessage = null;
    this.computationResult = null;
    this.isIdempotentResult = null;

    try {
      if (!Number.isInteger(this.modulus) || this.modulus <= 1) {
        this.errorMessage = 'problem6.errors.modulusMin';
        return;
      }

      if (!Number.isInteger(this.element)) {
        this.errorMessage = 'problem6.errors.elementInteger';
        return;
      }

      // Compute order in (Z_n, ·)
      this.computationResult = this.modularGroupService.computeOrderInZn(
        this.element,
        this.modulus,
      );

      // Compute idempotent status
      this.isIdempotentResult = this.modularGroupService.isIdempotent(this.element, this.modulus);
    } catch (error: unknown) {
      this.errorMessage = error instanceof Error ? error.message : 'problem6.errors.unexpected';
    }
  }
}
