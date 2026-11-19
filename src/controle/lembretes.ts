import { ROTULO_TIPO, Tarefa } from '../tipos';
import { deLembrete, diasEntre } from './datas';

export interface Lembrete {
  titulo: string;
  corpo: string;
  quando: Date;
}

const LIMITE = 60;

function tituloDoLembrete(tarefa: Tarefa, lembrete: string): string {
  const tipo = ROTULO_TIPO[tarefa.tipo];
  const dias = diasEntre(lembrete.slice(0, 10), tarefa.prazo);
  if (dias <= 0) return `${tipo} para hoje`;
  if (dias === 1) return `${tipo} para amanhã`;
  return `${tipo} em ${dias} dias`;
}

export function planejarLembretes(tarefas: Tarefa[], agora: Date = new Date()): Lembrete[] {
  const lembretes: Lembrete[] = [];
  for (const tarefa of tarefas) {
    if (tarefa.status !== 'pendente' || !tarefa.lembrete) continue;
    const corpo = tarefa.disciplina ? `${tarefa.titulo} · ${tarefa.disciplina}` : tarefa.titulo;
    lembretes.push({
      titulo: tituloDoLembrete(tarefa, tarefa.lembrete),
      corpo,
      quando: deLembrete(tarefa.lembrete),
    });
  }
  return lembretes
    .filter((l) => l.quando.getTime() > agora.getTime())
    .sort((a, b) => a.quando.getTime() - b.quando.getTime())
    .slice(0, LIMITE);
}
