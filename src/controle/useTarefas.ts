import { useCallback, useEffect, useState } from 'react';
import { sincronizarLembretes } from '../dispositivo/notificacoes';
import { carregarTarefas, salvarTarefas } from '../persistencia/armazenamento';
import { RascunhoTarefa, Tarefa } from '../tipos';
import { alternarStatus, criarTarefa, editarTarefa } from './regras';

export function useTarefas() {
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    carregarTarefas()
      .then(setTarefas)
      .catch(() => setErro('Não foi possível ler as tarefas salvas neste aparelho.'))
      .finally(() => setCarregando(false));
  }, []);

  useEffect(() => {
    if (!carregando) sincronizarLembretes(tarefas);
  }, [tarefas, carregando]);

  const aplicar = useCallback((mudar: (atuais: Tarefa[]) => Tarefa[]) => {
    setTarefas((atuais) => {
      const novas = mudar(atuais);
      salvarTarefas(novas)
        .then(() => setErro(null))
        .catch(() => setErro('Não foi possível salvar. Verifique o espaço do aparelho.'));
      return novas;
    });
  }, []);

  const adicionar = useCallback(
    (rascunho: RascunhoTarefa) => aplicar((atuais) => [...atuais, criarTarefa(rascunho)]),
    [aplicar],
  );

  const atualizar = useCallback(
    (id: string, rascunho: RascunhoTarefa) =>
      aplicar((atuais) => atuais.map((t) => (t.id === id ? editarTarefa(t, rascunho) : t))),
    [aplicar],
  );

  const excluir = useCallback(
    (id: string) => aplicar((atuais) => atuais.filter((t) => t.id !== id)),
    [aplicar],
  );

  const alternar = useCallback(
    (id: string) => aplicar((atuais) => atuais.map((t) => (t.id === id ? alternarStatus(t) : t))),
    [aplicar],
  );

  return { tarefas, carregando, erro, adicionar, atualizar, excluir, alternar };
}
