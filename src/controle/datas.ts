export const DIAS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
export const MESES_CURTOS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
export const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];
const DIAS_LONGOS = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
export const INICIAIS_SEMANA = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

const dois = (n: number) => String(n).padStart(2, '0');

export function paraISO(data: Date): string {
  return `${data.getFullYear()}-${dois(data.getMonth() + 1)}-${dois(data.getDate())}`;
}

export function deISO(iso: string): Date {
  const [ano, mes, dia] = iso.split('-').map(Number);
  return new Date(ano, mes - 1, dia);
}

export function hojeISO(): string {
  return paraISO(new Date());
}

export function somarDias(iso: string, dias: number): string {
  const data = deISO(iso);
  data.setDate(data.getDate() + dias);
  return paraISO(data);
}


export function diasEntre(de: string, ate: string): number {
  const ms = deISO(ate).getTime() - deISO(de).getTime();
  return Math.round(ms / 86_400_000);
}


export function formatarData(iso: string, hoje: string = hojeISO()): string {
  const data = deISO(iso);
  const base = `${DIAS[data.getDay()]}, ${data.getDate()} ${MESES_CURTOS[data.getMonth()]}`;
  return data.getFullYear() === deISO(hoje).getFullYear() ? base : `${base} ${data.getFullYear()}`;
}


export function prazoRelativo(prazo: string, hoje: string = hojeISO()): string {
  const dias = diasEntre(hoje, prazo);
  if (dias === 0) return 'Hoje';
  if (dias === 1) return 'Amanhã';
  if (dias === -1) return 'Atrasada há 1 dia';
  if (dias < 0) return `Atrasada há ${-dias} dias`;
  return `Em ${dias} dias`;
}

export function paraLembrete(data: Date): string {
  return `${paraISO(data)}T${dois(data.getHours())}:${dois(data.getMinutes())}`;
}

export function deLembrete(lembrete: string): Date {
  const [dia, hora] = lembrete.split('T');
  const [h, m] = hora.split(':').map(Number);
  const data = deISO(dia);
  data.setHours(h, m, 0, 0);
  return data;
}

export function formatarLembrete(lembrete: string, hoje: string = hojeISO()): string {
  const [dia, hora] = lembrete.split('T');
  return `${formatarData(dia, hoje)} às ${hora}`;
}

export function formatarDataLonga(iso: string): string {
  const data = deISO(iso);
  return `${DIAS_LONGOS[data.getDay()]}, ${data.getDate()} de ${MESES[data.getMonth()].toLowerCase()}`;
}
