import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import {
  ArrowLeft,
  ArrowRight,
  BadgeAlert,
  BookOpen,
  Calculator,
  ChevronRight,
  Github,
  House,
  Info,
  Languages,
  LayoutGrid,
} from 'lucide-angular/src/icons';
import { LUCIDE_ICONS, LucideIconProvider } from 'lucide-angular';
import { I18n } from './services/i18n';

const lucideIcons = {
  ArrowLeft,
  ArrowRight,
  House,
  LayoutGrid,
  Calculator,
  Languages,
  Github,
  Info,
  BadgeAlert,
  BookOpen,
  ChevronRight,
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch()),

    provideAppInitializer(() => inject(I18n).init()),

    // Lucide icons – global registration
    { provide: LUCIDE_ICONS, multi: true, useValue: new LucideIconProvider(lucideIcons) },
  ],
};
