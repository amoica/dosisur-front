import { Injectable } from '@angular/core';
import nspell from 'nspell';

@Injectable({
  providedIn: 'root'
})
export class SpellCheckService {
  private spell!: nspell;

  constructor() {
    this.loadDictionary();
  }

  private async loadDictionary(): Promise<void> {
    try {
      const [affResponse, dicResponse] = await Promise.all([
        fetch('./assets/dictionaries/es_AR.aff'),
        fetch('./assets/dictionaries/es_AR.dic')
      ]);
      const affData = await affResponse.text();
      const dicData = await dicResponse.text();
      this.spell = nspell(affData, dicData);
    } catch (error) {
      console.error('Error al cargar el diccionario:', error);
    }
  }

  checkWord(word: string): { valid: boolean, suggestions: string[] } {
    if (!this.spell) {
      console.warn('El diccionario aún no está cargado, retornando valor por defecto.');
      return { valid: true, suggestions: [] };
    }
    const valid = this.spell.correct(word);
    const suggestions = valid ? [] : this.spell.suggest(word);
    return { valid, suggestions };
  }
}