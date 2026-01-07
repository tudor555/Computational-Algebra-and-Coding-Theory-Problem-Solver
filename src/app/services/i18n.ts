import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom } from 'rxjs';

export type LanguageCode = 'ro' | 'en';
type TranslationDictionary = Record<string, unknown>;

@Injectable({ providedIn: 'root' })
export class I18n {
  private readonly storageKey = 'app_language';
  private readonly isBrowser: boolean;

  private loadedLanguage: LanguageCode | null = null;
  private translations: TranslationDictionary = {};

  private readonly languageSubject = new BehaviorSubject<LanguageCode>('ro');
  readonly language$ = this.languageSubject.asObservable();

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);

    // Pick initial language safely (browser-only localStorage)
    const initialLanguage = this.readStoredLanguage() ?? 'ro';
    this.languageSubject.next(initialLanguage);
  }

  get currentLanguage(): LanguageCode {
    return this.languageSubject.value;
  }

  async init(): Promise<void> {
    // Ensure the correct dictionary is loaded before UI uses translations
    await this.loadLanguage(this.currentLanguage);
  }

  async setLanguage(language: LanguageCode): Promise<void> {
    if (language === this.currentLanguage) {
      return;
    }

    if (this.isBrowser) {
      localStorage.setItem(this.storageKey, language);
    }

    this.languageSubject.next(language);
    await this.loadLanguage(language);
  }

  async toggleLanguage(): Promise<void> {
    await this.setLanguage(this.currentLanguage === 'ro' ? 'en' : 'ro');
  }

  translate(key: string, params?: Record<string, string | number>): string {
    const rawValue = this.getNestedValue(this.translations, key);
    if (typeof rawValue !== 'string') {
      return key;
    }
    return this.interpolate(rawValue, params);
  }

  private readStoredLanguage(): LanguageCode | null {
    if (!this.isBrowser) {
      return null;
    }

    const stored = localStorage.getItem(this.storageKey);
    return stored === 'ro' || stored === 'en' ? stored : null;
  }

  private async loadLanguage(language: LanguageCode): Promise<void> {
    if (this.loadedLanguage === language) {
      return;
    }

    const url = `assets/i18n/${language}.json`;
    this.translations = await firstValueFrom(this.http.get<TranslationDictionary>(url));
    this.loadedLanguage = language;
  }

  private getNestedValue(dictionary: TranslationDictionary, key: string): unknown {
    return key.split('.').reduce<unknown>((acc, part) => {
      if (acc && typeof acc === 'object' && part in (acc as Record<string, unknown>)) {
        return (acc as Record<string, unknown>)[part];
      }
      return undefined;
    }, dictionary);
  }

  private interpolate(template: string, params?: Record<string, string | number>): string {
    if (!params) return template;

    return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, paramName: string) => {
      const value = params[paramName];
      return value === undefined ? `{{${paramName}}}` : String(value);
    });
  }
}
