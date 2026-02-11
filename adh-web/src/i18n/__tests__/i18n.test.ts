import { describe, it, expect, beforeEach } from 'vitest';
import { t, setLocale, getLocale, fr, en } from '../index';

describe('i18n', () => {
  beforeEach(() => {
    setLocale('fr');
  });

  it('should return French translation by default', () => {
    expect(t('datacatch.welcome.title')).toBe('Saisie client');
  });

  it('should return English translation after setLocale', () => {
    setLocale('en');
    expect(t('datacatch.welcome.title')).toBe('Guest registration');
  });

  it('should return the path when key is invalid', () => {
    expect(t('datacatch.nonexistent.key')).toBe('datacatch.nonexistent.key');
  });

  it('should return correct locale after setLocale', () => {
    expect(getLocale()).toBe('fr');
    setLocale('en');
    expect(getLocale()).toBe('en');
  });

  it('should return path for deeply invalid path', () => {
    expect(t('a.b.c.d.e')).toBe('a.b.c.d.e');
  });

  it('should return path for empty string', () => {
    expect(t('')).toBe('');
  });

  it('should have all FR keys mirrored in EN', () => {
    const frKeys = getAllKeys(fr);
    const enKeys = getAllKeys(en);
    for (const key of frKeys) {
      expect(enKeys).toContain(key);
    }
  });

  it('should have all EN keys mirrored in FR', () => {
    const frKeys = getAllKeys(fr);
    const enKeys = getAllKeys(en);
    for (const key of enKeys) {
      expect(frKeys).toContain(key);
    }
  });

  it('should translate personal info labels in FR', () => {
    expect(t('datacatch.personalInfo.nom')).toBe('Nom');
    expect(t('datacatch.personalInfo.prenom')).toBe('Prenom');
  });

  it('should translate personal info labels in EN', () => {
    setLocale('en');
    expect(t('datacatch.personalInfo.nom')).toBe('Last name');
    expect(t('datacatch.personalInfo.prenom')).toBe('First name');
  });

  it('should translate step labels', () => {
    expect(t('datacatch.steps.welcome')).toBe('Accueil');
    setLocale('en');
    expect(t('datacatch.steps.welcome')).toBe('Welcome');
  });

  it('should translate completion messages', () => {
    expect(t('datacatch.completion.titleSuccess')).toBe('Donnees client enregistrees');
    setLocale('en');
    expect(t('datacatch.completion.titleSuccess')).toBe('Guest data registered');
  });
});

function getAllKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  const keys: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null) {
      keys.push(...getAllKeys(value as Record<string, unknown>, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}
