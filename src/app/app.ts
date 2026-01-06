import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Footer } from './components/footer/footer';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Footer, LucideAngularModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('computational-algebra-and-coding-theory-problem-solver');
}
