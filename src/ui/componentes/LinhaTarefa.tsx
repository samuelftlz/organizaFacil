import { Pressable, StyleSheet, Text, View } from 'react-native';
import { formatarData, formatarLembrete, prazoRelativo } from '../../controle/datas';
import { estaAtrasada } from '../../controle/regras';
import { ROTULO_TIPO, Tarefa } from '../../tipos';
import { cores, fonte, marcaTexto } from '../tema';
import { MarcaTexto } from './MarcaTexto';

interface Props {
  tarefa: Tarefa;
  hoje: string;
  
  comData?: boolean;
  aoAbrir: (tarefa: Tarefa) => void;
  aoAlternar: (id: string) => void;
}


export function LinhaTarefa({ tarefa, hoje, comData = false, aoAbrir, aoAlternar }: Props) {
  const concluida = tarefa.status === 'concluida';
  const atrasada = estaAtrasada(tarefa, hoje);

  return (
    <Pressable
      onPress={() => aoAbrir(tarefa)}
      accessibilityRole="button"
      accessibilityLabel={`Editar tarefa ${tarefa.titulo}`}
      style={({ pressed }) => [estilos.linha, pressed && estilos.pressionada]}
    >
      <Pressable
        onPress={() => aoAlternar(tarefa.id)}
        hitSlop={12}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: concluida }}
        accessibilityLabel={concluida ? 'Marcar como pendente' : 'Marcar como concluída'}
        style={[estilos.caixa, concluida && estilos.caixaMarcada]}
      >
        {concluida && <View style={estilos.visto} />}
      </Pressable>

      <View style={estilos.conteudo}>
        <Text style={[estilos.titulo, concluida && estilos.tituloConcluido]} numberOfLines={2}>
          {tarefa.titulo}
        </Text>
        <View style={estilos.detalhes}>
          <MarcaTexto cor={concluida ? cores.pauta : marcaTexto[tarefa.tipo]}>
            {ROTULO_TIPO[tarefa.tipo]}
          </MarcaTexto>
          {!!tarefa.disciplina && (
            <Text style={estilos.detalhe} numberOfLines={1}>
              {tarefa.disciplina}
            </Text>
          )}
          {comData && <Text style={estilos.detalhe}>{formatarData(tarefa.prazo, hoje)}</Text>}
          {comData && !concluida && (
            <Text style={[estilos.detalhe, atrasada && estilos.atrasada]}>
              {prazoRelativo(tarefa.prazo, hoje)}
            </Text>
          )}
          {!concluida && !!tarefa.lembrete && (
            <Text style={estilos.detalhe} numberOfLines={1}>
              Lembrete: {formatarLembrete(tarefa.lembrete, hoje)}
            </Text>
          )}
        </View>
        {}
        {!!tarefa.observacoes?.trim() && (
          <Text
            style={[estilos.observacoes, concluida && estilos.observacoesConcluidas]}
            numberOfLines={3}
          >
            {tarefa.observacoes.trim()}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  linha: { flexDirection: 'row', gap: 14, paddingVertical: 14 },
  pressionada: { opacity: 0.55 },
  caixa: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: cores.tinta,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  caixaMarcada: { backgroundColor: cores.tinta },
  
  visto: {
    width: 7,
    height: 12,
    borderRightWidth: 2.5,
    borderBottomWidth: 2.5,
    borderColor: cores.branco,
    transform: [{ rotate: '45deg' }],
    marginTop: -3,
  },
  conteudo: { flex: 1, gap: 7 },
  titulo: { fontFamily: fonte.media, fontSize: 18, lineHeight: 24, color: cores.tinta },
  tituloConcluido: { textDecorationLine: 'line-through', color: cores.grafiteClaro },
  detalhes: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: 12, rowGap: 4 },
  detalhe: { fontFamily: fonte.normal, fontSize: 14, color: cores.grafite },
  atrasada: { fontFamily: fonte.forte, color: cores.vermelho },
  observacoes: { fontFamily: fonte.normal, fontSize: 15, lineHeight: 21, color: cores.grafite },
  observacoesConcluidas: { color: cores.grafiteClaro },
});
