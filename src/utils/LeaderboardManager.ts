/**
 * Gerenciador de Leaderboard (localStorage)
 */

export interface RunData {
  kills: number;
  survivalTime: number; // em segundos
  timestamp: number;
}

export class LeaderboardManager {
  private static readonly STORAGE_KEY = 'astrogod-leaderboard';
  private static readonly MAX_ENTRIES = 10;

  /**
   * Salva uma nova run no leaderboard
   */
  static saveRun(kills: number, survivalTime: number): void {
    const runs = this.getAll();

    const newRun: RunData = {
      kills,
      survivalTime,
      timestamp: Date.now()
    };

    runs.push(newRun);

    // Ordena por kills (maior para menor), depois por tempo
    runs.sort((a, b) => {
      if (b.kills !== a.kills) {
        return b.kills - a.kills;
      }
      return b.survivalTime - a.survivalTime;
    });

    // Mantém apenas as top 10
    const topRuns = runs.slice(0, this.MAX_ENTRIES);

    // Salva no localStorage
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(topRuns));
    } catch (error) {
      console.error('Erro ao salvar leaderboard:', error);
    }
  }

  /**
   * Retorna todas as runs salvas
   */
  static getAll(): RunData[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Erro ao carregar leaderboard:', error);
    }
    return [];
  }

  /**
   * Retorna o melhor score (maior número de kills)
   */
  static getBestRun(): RunData | null {
    const runs = this.getAll();
    return runs.length > 0 ? runs[0] : null;
  }

  /**
   * Verifica se uma run é recorde
   */
  static isNewRecord(kills: number): boolean {
    const best = this.getBestRun();
    return best === null || kills > best.kills;
  }

  /**
   * Limpa todo o leaderboard
   */
  static clear(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Formata tempo em minutos:segundos
   */
  static formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Formata data
   */
  static formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
