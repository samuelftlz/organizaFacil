import { RascunhoTarefa, Tarefa, TIPOS } from '../tipos';
import { deLembrete, hojeISO } from './datas';

export type ErrosTarefa = Partial<Record<'titulo' | 'tipo' | 'prazo' | 'lembrete', string>>;

export function validarTarefa(
  rascunho: RascunhoTarefa,
  lembreteAnterior?: string,
  agora: Date = new Date(),
): ErrosTarefa {
  const erros: ErrosTarefa = {};
  if (!rascunho.titulo.trim()) erros.titulo = 'Informe um título para a tarefa.';
  if (!rascunho.tipo || !TIPOS.includes(rascunho.tipo)) erros.tipo = 'Escolha o tipo da tarefa.';
  if (!rascunho.prazo || !/^\d{4}-\d{2}-\d{2}$/.test(rascunho.prazo)) {
    erros.prazo = 'Escolha a data de entrega.';
  }
  const { lembrete, prazo } = rascunho;
  if (lembrete) {
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(lembrete)) {
      erros.lembrete = 'Escolha o dia e a hora do lembrete.';
    } else if (prazo && lembrete.slice(0, 10) > prazo) {
      erros.lembrete = 'O lembrete precisa ser até o dia da entrega.';
    } else if (lembrete !== lembreteAnterior && deLembrete(lembrete).getTime() <= agora.getTime()) {
      erros.lembrete = 'Esse horário já passou. Escolha um horário futuro.';
    }
  }
  return erros;
}

function limpar(rascunho: RascunhoTarefa) {
  return {
    titulo: rascunho.titulo.trim(),
    disciplina: rascunho.disciplina.trim() || undefined,
    observacoes: rascunho.observacoes.trim() || undefined,
    tipo: rascunho.tipo!,
    prazo: rascunho.prazo!,
    lembrete: rascunho.lembrete ?? undefined,
  };
}

function novoId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}


export function criarTarefa(rascunho: RascunhoTarefa): Tarefa {
  return {
    id: novoId(),
    ...limpar(rascunho),
    status: 'pendente',
    criadaEm: new Date().toISOString(),
  };
}

export function editarTarefa(tarefa: Tarefa, rascunho: RascunhoTarefa): Tarefa {
  return { ...tarefa, ...limpar(rascunho) };
}

export function alternarStatus(tarefa: Tarefa): Tarefa {
  return tarefa.status === 'pendente'
    ? { ...tarefa, status: 'concluida', concluidaEm: new Date().toISOString() }
    : { ...tarefa, status: 'pendente', concluidaEm: undefined };
}


export function ordenarPorPrazo(tarefas: Tarefa[]): Tarefa[] {
  return [...tarefas].sort(
    (a, b) => a.prazo.localeCompare(b.prazo) || a.criadaEm.localeCompare(b.criadaEm),
  );
}

export function estaAtrasada(tarefa: Tarefa, hoje: string = hojeISO()): boolean {
  return tarefa.status === 'pendente' && tarefa.prazo < hoje;
}

export interface DiaAgenda {
  prazo: string;
  tarefas: Tarefa[];
}


export function montarAgenda(tarefas: Tarefa[]): DiaAgenda[] {
  const dias: DiaAgenda[] = [];
  for (const tarefa of ordenarPorPrazo(tarefas.filter((t) => t.status === 'pendente'))) {
    const ultimo = dias[dias.length - 1];
    if (ultimo?.prazo === tarefa.prazo) ultimo.tarefas.push(tarefa);
    else dias.push({ prazo: tarefa.prazo, tarefas: [tarefa] });
  }
  return dias;
}
