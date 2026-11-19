import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { deISO, DIAS, formatarDataLonga, MESES_CURTOS, prazoRelativo } from '../../controle/datas';
import { estaAtrasada, montarAgenda } from '../../controle/regras';
import { Tarefa } from '../../tipos';
import { LinhaTarefa } from '../componentes/LinhaTarefa';
import { cores, fonte } from '../tema';

interface Props {
  tarefas: Tarefa[];
  hoje: string;
  aoAbrir: (tarefa: Tarefa) => void;
  aoAlternar: (id: string) => void;
}


const MARGEM = 78;

function plural(n: number, um: string, varios: string): string {
  return `${n} ${n === 1 ? um : varios}`;
}

function resumir(tarefas: Tarefa[], hoje: string): string {
  if (tarefas.length === 0) return 'Nenhuma tarefa anotada ainda.';
  const pendentes = tarefas.filter((t) => t.status === 'pendente');
  if (pendentes.length === 0) return 'Nada pendente. Tudo entregue.';
  const atrasadas = pendentes.filter((t) => estaAtrasada(t, hoje)).length;
  const partes = [plural(pendentes.length, 'entrega pendente', 'entregas pendentes')];
  if (atrasadas > 0) partes.push(plural(atrasadas, 'atrasada', 'atrasadas'));
  return `${partes.join(', ')}.`;
}

export function TelaRotina({ tarefas, hoje, aoAbrir, aoAlternar }: Props) {
  const agenda = montarAgenda(tarefas);
  const concluidas = tarefas.filter((t) => t.status === 'concluida').length;

  return (
    <ScrollView contentContainerStyle={estilos.corpo}>
      <View style={estilos.topo}>
        <Text style={estilos.data}>{formatarDataLonga(hoje)}</Text>
        <Text style={estilos.titulo}>Minha rotina</Text>
        <Text style={estilos.resumo}>{resumir(tarefas, hoje)}</Text>
        {concluidas > 0 && (
          <Text style={estilos.feitas}>
            {plural(concluidas, 'tarefa concluída', 'tarefas concluídas')} até agora.
          </Text>
        )}
      </View>

      <View style={estilos.pagina}>
        <View style={estilos.linhaDaMargem} />

        {agenda.length === 0 ? (
          <View style={estilos.dia}>
            <View style={estilos.margem} />
            <View style={estilos.vazio}>
              <Text style={estilos.textoVazio}>
                {tarefas.length === 0
                  ? 'Toque em Nova tarefa para anotar a primeira atividade, prova ou trabalho.'
                  : 'Quando você anotar uma nova entrega, ela aparece aqui.'}
              </Text>
            </View>
          </View>
        ) : (
          agenda.map(({ prazo, tarefas: doDia }) => {
            const data = deISO(prazo);
            const atrasado = prazo < hoje;
            const ehHoje = prazo === hoje;
            return (
              <View key={prazo} style={estilos.dia}>
                <View style={estilos.margem}>
                  <Text style={[estilos.semana, atrasado && estilos.vermelho]}>
                    {DIAS[data.getDay()]}
                  </Text>
                  <Text
                    style={[estilos.numero, ehHoje && estilos.azul, atrasado && estilos.vermelho]}
                  >
                    {data.getDate()}
                  </Text>
                  <Text style={[estilos.semana, atrasado && estilos.vermelho]}>
                    {MESES_CURTOS[data.getMonth()]}
                  </Text>
                </View>
                <View style={estilos.tarefas}>
                  <Text
                    style={[estilos.quando, ehHoje && estilos.azul, atrasado && estilos.vermelho]}
                  >
                    {prazoRelativo(prazo, hoje)}
                  </Text>
                  {doDia.map((tarefa) => (
                    <LinhaTarefa
                      key={tarefa.id}
                      tarefa={tarefa}
                      hoje={hoje}
                      aoAbrir={aoAbrir}
                      aoAlternar={aoAlternar}
                    />
                  ))}
                </View>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  corpo: { flexGrow: 1 },
  topo: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 22 },
  data: { fontFamily: fonte.normal, fontSize: 15, color: cores.grafite },
  titulo: {
    fontFamily: fonte.preta,
    fontSize: 40,
    lineHeight: 44,
    letterSpacing: -1,
    color: cores.tinta,
    marginTop: 2,
  },
  resumo: { fontFamily: fonte.media, fontSize: 17, color: cores.tinta, marginTop: 10 },
  feitas: { fontFamily: fonte.normal, fontSize: 15, color: cores.grafite, marginTop: 2 },
  
  pagina: { flexGrow: 1, borderTopWidth: 1, borderTopColor: cores.pauta },
  linhaDaMargem: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: MARGEM,
    width: 1.5,
    backgroundColor: cores.margem,
    opacity: 0.7,
  },
  dia: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: cores.pauta },
  margem: { width: MARGEM, alignItems: 'center', paddingTop: 14, paddingBottom: 14 },
  semana: { fontFamily: fonte.media, fontSize: 13, color: cores.grafite },
  numero: { fontFamily: fonte.preta, fontSize: 32, lineHeight: 36, color: cores.tinta },
  tarefas: { flex: 1, paddingLeft: 16, paddingRight: 18, paddingTop: 14 },
  quando: { fontFamily: fonte.media, fontSize: 13, color: cores.grafite },
  azul: { color: cores.caneta },
  vermelho: { color: cores.vermelho },
  vazio: { flex: 1, paddingLeft: 16, paddingRight: 24, paddingVertical: 22 },
  textoVazio: { fontFamily: fonte.normal, fontSize: 16, lineHeight: 23, color: cores.grafite },
});
