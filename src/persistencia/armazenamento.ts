import AsyncStorage from '@react-native-async-storage/async-storage';
import { Tarefa } from '../tipos';

const CHAVE = '@organizafacil/tarefas/v1';

export async function carregarTarefas(): Promise<Tarefa[]> {
  const bruto = await AsyncStorage.getItem(CHAVE);
  if (!bruto) return [];
  const dados: unknown = JSON.parse(bruto);
  return Array.isArray(dados) ? (dados as Tarefa[]) : [];
}

export async function salvarTarefas(tarefas: Tarefa[]): Promise<void> {
  await AsyncStorage.setItem(CHAVE, JSON.stringify(tarefas));
}

const CHAVE_PEDIU_ALARME_EXATO = '@organizafacil/pediu-alarme-exato/v1';

export async function jaPediuAlarmeExato(): Promise<boolean> {
  return (await AsyncStorage.getItem(CHAVE_PEDIU_ALARME_EXATO)) === '1';
}

export async function marcarPedidoAlarmeExato(): Promise<void> {
  await AsyncStorage.setItem(CHAVE_PEDIU_ALARME_EXATO, '1');
}
