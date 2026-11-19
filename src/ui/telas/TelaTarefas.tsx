import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ordenarPorPrazo } from '../../controle/regras';
import { ROTULO_TIPO, StatusTarefa, Tarefa, TipoTarefa, TIPOS } from '../../tipos';
import { LinhaTarefa } from '../componentes/LinhaTarefa';
import { MarcaTexto } from '../componentes/MarcaTexto';
import { cores, fonte, marcaTexto } from '../tema';

interface Props {
  tarefas: Tarefa[];
  hoje: string;
  aoAbrir: (tarefa: Tarefa) => void;
  aoAlternar: (id: string) => void;
}

type FiltroStatus = 'todas' | StatusTarefa;

const STATUS: { valor: FiltroStatus; rotulo: string }[] = [
  { valor: 'todas', rotulo: 'Todas' },
  { valor: 'pendente', rotulo: 'Pendentes' },
  { valor: 'concluida', rotulo: 'Concluídas' },
];

export function TelaTarefas({ tarefas, hoje, aoAbrir, aoAlternar }: Props) {
  const [status, setStatus] = useState<FiltroStatus>('todas');
  
  const [tipo, setTipo] = useState<TipoTarefa | null>(null);

  const filtradas = tarefas.filter(
    (t) => (status === 'todas' || t.status === status) && (tipo === null || t.tipo === tipo),
  );
  
  const visiveis = [
    ...ordenarPorPrazo(filtradas.filter((t) => t.status === 'pendente')),
    ...ordenarPorPrazo(filtradas.filter((t) => t.status === 'concluida')),
  ];

  return (
    <ScrollView contentContainerStyle={estilos.corpo}>
      <View style={estilos.topo}>
        <Text style={estilos.titulo}>Tarefas</Text>

        <View style={estilos.status}>
          {STATUS.map((opcao) => {
            const ativo = status === opcao.valor;
            return (
              <Pressable
                key={opcao.valor}
                onPress={() => setStatus(opcao.valor)}
                accessibilityRole="tab"
                accessibilityState={{ selected: ativo }}
                style={estilos.aba}
              >
                <Text style={[estilos.textoAba, ativo && estilos.textoAbaAtiva]}>
                  {opcao.rotulo}
                </Text>
                <View style={[estilos.traco, ativo && estilos.tracoAtivo]} />
              </Pressable>
            );
          })}
        </View>

        <View style={estilos.tipos}>
          {TIPOS.map((opcao) => {
            const ativo = tipo === opcao;
            const rotulo = `${ROTULO_TIPO[opcao]}s`;
            return (
              <Pressable
                key={opcao}
                onPress={() => setTipo(ativo ? null : opcao)}
                accessibilityRole="button"
                accessibilityLabel={`Filtrar por ${rotulo}`}
                accessibilityState={{ selected: ativo }}
                style={estilos.tipo}
              >
                {ativo ? (
                  <MarcaTexto cor={marcaTexto[opcao]} tamanho={15}>
                    {rotulo}
                  </MarcaTexto>
                ) : (
                  <>
                    <View style={[estilos.amostra, { backgroundColor: marcaTexto[opcao] }]} />
                    <Text style={estilos.textoTipo}>{rotulo}</Text>
                  </>
                )}
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={estilos.lista}>
        {visiveis.length === 0 ? (
          <Text style={estilos.vazio}>
            {tarefas.length === 0
              ? 'Nenhuma tarefa anotada. Toque em Nova tarefa para criar a primeira.'
              : 'Nenhuma tarefa com esses filtros.'}
          </Text>
        ) : (
          visiveis.map((tarefa) => (
            <View key={tarefa.id} style={estilos.item}>
              <LinhaTarefa
                tarefa={tarefa}
                hoje={hoje}
                comData
                aoAbrir={aoAbrir}
                aoAlternar={aoAlternar}
              />
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  corpo: { flexGrow: 1 },
  topo: { paddingHorizontal: 20, paddingTop: 18 },
  titulo: {
    fontFamily: fonte.preta,
    fontSize: 40,
    lineHeight: 44,
    letterSpacing: -1,
    color: cores.tinta,
  },
  status: { flexDirection: 'row', gap: 22, marginTop: 14 },
  aba: { paddingTop: 8, minHeight: 44 },
  textoAba: { fontFamily: fonte.media, fontSize: 17, color: cores.grafite },
  textoAbaAtiva: { fontFamily: fonte.forte, color: cores.tinta },
  traco: { height: 3, borderRadius: 2, marginTop: 5, backgroundColor: 'transparent' },
  tracoAtivo: { backgroundColor: cores.caneta },
  tipos: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 20, marginTop: 4, marginBottom: 6 },
  tipo: { flexDirection: 'row', alignItems: 'center', gap: 7, minHeight: 44 },
  amostra: { width: 12, height: 12, borderRadius: 3 },
  textoTipo: { fontFamily: fonte.media, fontSize: 15, color: cores.grafite },
  lista: { flexGrow: 1, borderTopWidth: 1, borderTopColor: cores.pauta },
  item: { paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: cores.pauta },
  vazio: {
    fontFamily: fonte.normal,
    fontSize: 16,
    lineHeight: 23,
    color: cores.grafite,
    paddingHorizontal: 20,
    paddingVertical: 22,
  },
});
