export type TipoTarefa = 'atividade' | 'prova' | 'trabalho';
export type StatusTarefa = 'pendente' | 'concluida';

export interface Tarefa {
  id: string;
  titulo: string;
  
  disciplina?: string;
  observacoes?: string;
  tipo: TipoTarefa;
  
  prazo: string;
  
  lembrete?: string;
  status: StatusTarefa;
  criadaEm: string;
  concluidaEm?: string;
}

export interface RascunhoTarefa {
  titulo: string;
  disciplina: string;
  observacoes: string;
  tipo: TipoTarefa | null;
  prazo: string | null;
  lembrete: string | null;
}

export const TIPOS: TipoTarefa[] = ['atividade', 'prova', 'trabalho'];

export const ROTULO_TIPO: Record<TipoTarefa, string> = {
  atividade: 'Atividade',
  prova: 'Prova',
  trabalho: 'Trabalho',
};
