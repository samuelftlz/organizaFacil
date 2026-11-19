import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  deISO,
  deLembrete,
  formatarData,
  paraLembrete,
  prazoRelativo,
  somarDias,
} from '../../controle/datas';
import { ErrosTarefa, validarTarefa } from '../../controle/regras';
import { RascunhoTarefa, ROTULO_TIPO, Tarefa, TIPOS } from '../../tipos';
import { cores, fonte, marcaTexto } from '../tema';
import { Calendario } from './Calendario';
import { MarcaTexto } from './MarcaTexto';

interface Props {
  
  tarefa: Tarefa | null;
  hoje: string;
  aoSalvar: (rascunho: RascunhoTarefa) => void;
  aoExcluir: (id: string) => void;
  aoFechar: () => void;
}

function rascunhoInicial(tarefa: Tarefa | null): RascunhoTarefa {
  return {
    titulo: tarefa?.titulo ?? '',
    disciplina: tarefa?.disciplina ?? '',
    observacoes: tarefa?.observacoes ?? '',
    tipo: tarefa?.tipo ?? null,
    prazo: tarefa?.prazo ?? null,
    lembrete: tarefa?.lembrete ?? null,
  };
}


function lembreteSugerido(prazo: string | null, hoje: string): Date {
  const sugerido = deISO(prazo && prazo >= hoje ? prazo : hoje);
  sugerido.setHours(8, 0, 0, 0);
  const agora = new Date();
  if (sugerido.getTime() <= agora.getTime()) {
    sugerido.setTime(agora.getTime());
    sugerido.setHours(agora.getHours() + 1, 0, 0, 0);
  }
  return sugerido;
}

export function FormularioTarefa({ tarefa, hoje, aoSalvar, aoExcluir, aoFechar }: Props) {
  const margens = useSafeAreaInsets();
  const [rascunho, setRascunho] = useState(() => rascunhoInicial(tarefa));
  const [erros, setErros] = useState<ErrosTarefa>({});
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);

  const mudar = (parte: Partial<RascunhoTarefa>) => {
    setRascunho((atual) => ({ ...atual, ...parte }));
    setErros({});
  };

  const salvar = () => {
    const encontrados = validarTarefa(rascunho, tarefa?.lembrete);
    if (Object.keys(encontrados).length > 0) {
      setErros(encontrados);
      return;
    }
    aoSalvar(rascunho);
  };

  
  const escolherHora = (base: Date) => {
    DateTimePickerAndroid.open({
      value: base,
      mode: 'time',
      is24Hour: true,
      onChange: (evento, escolhida) => {
        if (evento.type !== 'set' || !escolhida) return;
        const nova = new Date(base);
        nova.setHours(escolhida.getHours(), escolhida.getMinutes(), 0, 0);
        mudar({ lembrete: paraLembrete(nova) });
      },
    });
  };

  const escolherDia = (base: Date, depoisEscolherHora: boolean) => {
    DateTimePickerAndroid.open({
      value: base,
      mode: 'date',
      minimumDate: deISO(hoje),
      maximumDate: rascunho.prazo ? deISO(rascunho.prazo) : undefined,
      onChange: (evento, escolhida) => {
        if (evento.type !== 'set' || !escolhida) return;
        const nova = new Date(base);
        nova.setFullYear(escolhida.getFullYear(), escolhida.getMonth(), escolhida.getDate());
        if (depoisEscolherHora) escolherHora(nova);
        else mudar({ lembrete: paraLembrete(nova) });
      },
    });
  };

  const lembreteAtual = rascunho.lembrete ? deLembrete(rascunho.lembrete) : null;

  const atalhos = [
    { rotulo: 'Hoje', data: hoje },
    { rotulo: 'Amanhã', data: somarDias(hoje, 1) },
    { rotulo: 'Em 1 semana', data: somarDias(hoje, 7) },
  ];

  return (
    <Modal visible animationType="slide" onRequestClose={aoFechar}>
      {}
      <KeyboardAvoidingView
        style={[estilos.tela, { paddingTop: margens.top }]}
        behavior="padding"
      >
        <View style={estilos.limite}>
          <View style={estilos.barra}>
            <Pressable
              onPress={aoFechar}
              hitSlop={10}
              accessibilityRole="button"
              style={estilos.acaoBarra}
            >
              <Text style={estilos.cancelar}>Cancelar</Text>
            </Pressable>
            <Pressable
              onPress={salvar}
              hitSlop={10}
              accessibilityRole="button"
              style={estilos.acaoBarra}
            >
              <Text style={estilos.salvarTopo}>Salvar</Text>
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={[estilos.corpo, { paddingBottom: margens.bottom + 32 }]}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={estilos.titulo}>{tarefa ? 'Editar tarefa' : 'Nova tarefa'}</Text>

            <TextInput
              value={rascunho.titulo}
              onChangeText={(titulo) => mudar({ titulo })}
              placeholder="O que você precisa entregar?"
              placeholderTextColor={cores.grafiteClaro}
              style={[estilos.campoTitulo, erros.titulo && estilos.campoComErro]}
              maxLength={80}
              autoFocus={!tarefa}
              accessibilityLabel="Título da tarefa"
            />
            {!!erros.titulo && <Text style={estilos.erro}>{erros.titulo}</Text>}

            <Text style={estilos.rotulo}>Tipo</Text>
            <View style={estilos.tipos}>
              {TIPOS.map((tipo) => {
                const ativo = rascunho.tipo === tipo;
                return (
                  <Pressable
                    key={tipo}
                    onPress={() => mudar({ tipo })}
                    accessibilityRole="radio"
                    accessibilityLabel={ROTULO_TIPO[tipo]}
                    accessibilityState={{ selected: ativo }}
                    style={estilos.tipo}
                  >
                    {ativo ? (
                      <MarcaTexto cor={marcaTexto[tipo]} tamanho={19}>
                        {ROTULO_TIPO[tipo]}
                      </MarcaTexto>
                    ) : (
                      <>
                        <View style={[estilos.amostra, { backgroundColor: marcaTexto[tipo] }]} />
                        <Text style={estilos.textoTipo}>{ROTULO_TIPO[tipo]}</Text>
                      </>
                    )}
                  </Pressable>
                );
              })}
            </View>
            {!!erros.tipo && <Text style={estilos.erro}>{erros.tipo}</Text>}

            <Text style={estilos.rotulo}>Data de entrega</Text>
            <Text style={[estilos.prazo, !rascunho.prazo && estilos.prazoVazio]}>
              {rascunho.prazo
                ? `${formatarData(rascunho.prazo, hoje)} (${prazoRelativo(rascunho.prazo, hoje).toLowerCase()})`
                : 'Escolha um dia no calendário'}
            </Text>
            <View style={estilos.atalhos}>
              {atalhos.map((atalho) => {
                const ativo = rascunho.prazo === atalho.data;
                return (
                  <Pressable
                    key={atalho.rotulo}
                    onPress={() => mudar({ prazo: atalho.data })}
                    accessibilityRole="button"
                    style={[estilos.atalho, ativo && estilos.atalhoAtivo]}
                  >
                    <Text style={[estilos.textoAtalho, ativo && estilos.textoAtalhoAtivo]}>
                      {atalho.rotulo}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Calendario
              
              key={rascunho.prazo?.slice(0, 7) ?? 'vazio'}
              valor={rascunho.prazo}
              hoje={hoje}
              aoEscolher={(prazo) => mudar({ prazo })}
            />
            {!!erros.prazo && <Text style={estilos.erro}>{erros.prazo}</Text>}

            <Text style={estilos.rotulo}>Lembrete (opcional)</Text>
            {rascunho.lembrete && lembreteAtual ? (
              <View style={estilos.atalhos}>
                <Pressable
                  onPress={() => escolherDia(lembreteAtual, false)}
                  accessibilityRole="button"
                  accessibilityLabel="Mudar o dia do lembrete"
                  style={[estilos.atalho, estilos.atalhoAtivo]}
                >
                  <Text style={[estilos.textoAtalho, estilos.textoAtalhoAtivo]}>
                    {formatarData(rascunho.lembrete.slice(0, 10), hoje)}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => escolherHora(lembreteAtual)}
                  accessibilityRole="button"
                  accessibilityLabel="Mudar a hora do lembrete"
                  style={[estilos.atalho, estilos.atalhoAtivo]}
                >
                  <Text style={[estilos.textoAtalho, estilos.textoAtalhoAtivo]}>
                    {rascunho.lembrete.slice(11)}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => mudar({ lembrete: null })}
                  accessibilityRole="button"
                  style={estilos.atalho}
                >
                  <Text style={estilos.textoAtalho}>Remover</Text>
                </Pressable>
              </View>
            ) : (
              <View style={estilos.atalhos}>
                <Pressable
                  onPress={() => escolherDia(lembreteSugerido(rascunho.prazo, hoje), true)}
                  accessibilityRole="button"
                  style={estilos.atalho}
                >
                  <Text style={estilos.textoAtalho}>+ Adicionar lembrete</Text>
                </Pressable>
              </View>
            )}
            {!!erros.lembrete && <Text style={estilos.erro}>{erros.lembrete}</Text>}

            <Text style={estilos.rotulo}>Matéria (opcional)</Text>
            <TextInput
              value={rascunho.disciplina}
              onChangeText={(disciplina) => mudar({ disciplina })}
              placeholder="Ex.: Cálculo I"
              placeholderTextColor={cores.grafiteClaro}
              style={estilos.campo}
              maxLength={40}
              accessibilityLabel="Matéria"
            />

            <Text style={estilos.rotulo}>Observações (opcional)</Text>
            <TextInput
              value={rascunho.observacoes}
              onChangeText={(observacoes) => mudar({ observacoes })}
              placeholder="Capítulos, grupo, local da prova"
              placeholderTextColor={cores.grafiteClaro}
              style={[estilos.campo, estilos.campoAlto]}
              multiline
              maxLength={300}
              accessibilityLabel="Observações"
            />

            <Pressable
              onPress={salvar}
              accessibilityRole="button"
              style={({ pressed }) => [estilos.botaoSalvar, pressed && estilos.pressionado]}
            >
              <Text style={estilos.textoBotaoSalvar}>Salvar tarefa</Text>
            </Pressable>

            {tarefa &&
              (confirmandoExclusao ? (
                <View style={estilos.confirmacao}>
                  <Text style={estilos.textoConfirmacao}>
                    Excluir esta tarefa? Não dá para desfazer.
                  </Text>
                  <View style={estilos.botoesConfirmacao}>
                    <Pressable
                      onPress={() => setConfirmandoExclusao(false)}
                      accessibilityRole="button"
                      style={estilos.botaoManter}
                    >
                      <Text style={estilos.textoManter}>Manter</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => aoExcluir(tarefa.id)}
                      accessibilityRole="button"
                      style={estilos.botaoConfirmar}
                    >
                      <Text style={estilos.textoConfirmar}>Excluir</Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <Pressable
                  onPress={() => setConfirmandoExclusao(true)}
                  accessibilityRole="button"
                  style={estilos.botaoExcluir}
                >
                  <Text style={estilos.textoExcluir}>Excluir tarefa</Text>
                </Pressable>
              ))}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.papel },
  limite: { flex: 1, width: '100%', maxWidth: 520, alignSelf: 'center' },
  barra: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: cores.pauta,
  },
  acaoBarra: { minHeight: 52, justifyContent: 'center' },
  cancelar: { fontFamily: fonte.media, fontSize: 17, color: cores.grafite },
  salvarTopo: { fontFamily: fonte.forte, fontSize: 17, color: cores.caneta },
  corpo: { paddingHorizontal: 20, paddingTop: 20 },
  titulo: {
    fontFamily: fonte.preta,
    fontSize: 34,
    lineHeight: 38,
    letterSpacing: -0.8,
    color: cores.tinta,
    marginBottom: 14,
  },
  
  campoTitulo: {
    fontFamily: fonte.media,
    fontSize: 21,
    color: cores.tinta,
    borderBottomWidth: 2,
    borderBottomColor: cores.tinta,
    paddingVertical: 10,
  },
  campo: {
    fontFamily: fonte.normal,
    fontSize: 17,
    color: cores.tinta,
    borderBottomWidth: 1.5,
    borderBottomColor: cores.pauta,
    paddingVertical: 9,
  },
  campoAlto: { minHeight: 76, textAlignVertical: 'top' },
  campoComErro: { borderBottomColor: cores.vermelho },
  erro: { fontFamily: fonte.media, fontSize: 14, color: cores.vermelho, marginTop: 6 },
  rotulo: { fontFamily: fonte.media, fontSize: 14, color: cores.grafite, marginTop: 26 },
  tipos: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 26 },
  tipo: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 48 },
  amostra: { width: 14, height: 14, borderRadius: 3 },
  textoTipo: { fontFamily: fonte.media, fontSize: 19, color: cores.grafite },
  prazo: { fontFamily: fonte.forte, fontSize: 19, color: cores.tinta, marginTop: 8 },
  prazoVazio: { fontFamily: fonte.normal, color: cores.grafiteClaro },
  atalhos: { flexDirection: 'row', gap: 8, marginTop: 12, marginBottom: 14 },
  atalho: {
    borderWidth: 1.5,
    borderColor: cores.pauta,
    borderRadius: 8,
    paddingHorizontal: 14,
    minHeight: 40,
    justifyContent: 'center',
  },
  atalhoAtivo: { borderColor: cores.caneta },
  textoAtalho: { fontFamily: fonte.media, fontSize: 15, color: cores.grafite },
  textoAtalhoAtivo: { fontFamily: fonte.forte, color: cores.caneta },
  botaoSalvar: {
    backgroundColor: cores.caneta,
    borderRadius: 12,
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
  },
  pressionado: { opacity: 0.8 },
  textoBotaoSalvar: { fontFamily: fonte.forte, fontSize: 18, color: cores.branco },
  botaoExcluir: { alignItems: 'center', justifyContent: 'center', minHeight: 52, marginTop: 6 },
  textoExcluir: { fontFamily: fonte.media, fontSize: 16, color: cores.vermelho },
  confirmacao: { marginTop: 22, gap: 12 },
  textoConfirmacao: { fontFamily: fonte.media, fontSize: 16, color: cores.tinta },
  botoesConfirmacao: { flexDirection: 'row', gap: 10 },
  botaoManter: {
    flex: 1,
    minHeight: 48,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: cores.pauta,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoManter: { fontFamily: fonte.media, fontSize: 16, color: cores.tinta },
  botaoConfirmar: {
    flex: 1,
    minHeight: 48,
    borderRadius: 10,
    backgroundColor: cores.vermelho,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoConfirmar: { fontFamily: fonte.forte, fontSize: 16, color: cores.branco },
});
