import {
  BricolageGrotesque_400Regular,
  BricolageGrotesque_500Medium,
  BricolageGrotesque_700Bold,
  BricolageGrotesque_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/bricolage-grotesque';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, AppState, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { hojeISO } from './src/controle/datas';
import { useTarefas } from './src/controle/useTarefas';
import { RascunhoTarefa, Tarefa } from './src/tipos';
import { FormularioTarefa } from './src/ui/componentes/FormularioTarefa';
import { TelaRotina } from './src/ui/telas/TelaRotina';
import { TelaTarefas } from './src/ui/telas/TelaTarefas';
import { cores, fonte } from './src/ui/tema';

type Aba = 'rotina' | 'tarefas';

type Formulario = { tarefa: Tarefa | null } | null;


function useHoje(): string {
  const [hoje, setHoje] = useState(hojeISO);
  useEffect(() => {
    const assinatura = AppState.addEventListener('change', (estado) => {
      if (estado === 'active') setHoje(hojeISO());
    });
    return () => assinatura.remove();
  }, []);
  return hoje;
}

function Conteudo() {
  const margens = useSafeAreaInsets();
  const hoje = useHoje();
  const { tarefas, carregando, erro, adicionar, atualizar, excluir, alternar } = useTarefas();
  const [aba, setAba] = useState<Aba>('rotina');
  const [formulario, setFormulario] = useState<Formulario>(null);

  const abrir = (tarefa: Tarefa) => setFormulario({ tarefa });
  const fechar = () => setFormulario(null);

  const salvar = (rascunho: RascunhoTarefa) => {
    if (formulario?.tarefa) atualizar(formulario.tarefa.id, rascunho);
    else adicionar(rascunho);
    fechar();
  };

  const Tela = aba === 'rotina' ? TelaRotina : TelaTarefas;

  return (
    <View style={[estilos.app, { paddingTop: margens.top }]}>
      <StatusBar style="dark" />
      <View style={estilos.limite}>
        {!!erro && (
          <View style={estilos.aviso} accessibilityRole="alert">
            <Text style={estilos.textoAviso}>{erro}</Text>
          </View>
        )}

        <View style={estilos.area}>
          {carregando ? (
            <ActivityIndicator style={estilos.carregando} color={cores.caneta} />
          ) : (
            <Tela tarefas={tarefas} hoje={hoje} aoAbrir={abrir} aoAlternar={alternar} />
          )}
        </View>

        <View style={[estilos.barra, { paddingBottom: Math.max(margens.bottom, 10) }]}>
          <BotaoAba rotulo="Rotina" ativa={aba === 'rotina'} aoTocar={() => setAba('rotina')} />
          <BotaoAba rotulo="Tarefas" ativa={aba === 'tarefas'} aoTocar={() => setAba('tarefas')} />
          <Pressable
            onPress={() => setFormulario({ tarefa: null })}
            accessibilityRole="button"
            style={({ pressed }) => [estilos.novo, pressed && estilos.novoPressionado]}
          >
            <Text style={estilos.textoNovo}>+ Nova tarefa</Text>
          </Pressable>
        </View>
      </View>

      {formulario && (
        <FormularioTarefa
          tarefa={formulario.tarefa}
          hoje={hoje}
          aoSalvar={salvar}
          aoExcluir={(id) => {
            excluir(id);
            fechar();
          }}
          aoFechar={fechar}
        />
      )}
    </View>
  );
}

function BotaoAba(props: { rotulo: string; ativa: boolean; aoTocar: () => void }) {
  return (
    <Pressable
      onPress={props.aoTocar}
      accessibilityRole="tab"
      accessibilityState={{ selected: props.ativa }}
      style={estilos.aba}
    >
      <Text style={[estilos.textoAba, props.ativa && estilos.textoAbaAtiva]}>{props.rotulo}</Text>
      <View style={[estilos.traco, props.ativa && estilos.tracoAtivo]} />
    </Pressable>
  );
}

export default function App() {
  const [fontesProntas] = useFonts({
    BricolageGrotesque_400Regular,
    BricolageGrotesque_500Medium,
    BricolageGrotesque_700Bold,
    BricolageGrotesque_800ExtraBold,
  });

  return (
    <SafeAreaProvider>
      {fontesProntas ? (
        <Conteudo />
      ) : (
        <View style={estilos.app}>
          <ActivityIndicator style={estilos.carregando} color={cores.caneta} />
        </View>
      )}
    </SafeAreaProvider>
  );
}

const estilos = StyleSheet.create({
  app: { flex: 1, backgroundColor: cores.papel },
  limite: { flex: 1, width: '100%', maxWidth: 520, alignSelf: 'center' },
  area: { flex: 1 },
  carregando: { flex: 1 },
  aviso: { borderLeftWidth: 3, borderLeftColor: cores.vermelho, paddingLeft: 12, margin: 20 },
  textoAviso: { fontFamily: fonte.media, fontSize: 15, color: cores.vermelho },
  barra: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 22,
    backgroundColor: cores.papel,
    borderTopWidth: 1.5,
    borderTopColor: cores.tinta,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  aba: { minHeight: 48, justifyContent: 'center' },
  textoAba: { fontFamily: fonte.media, fontSize: 17, color: cores.grafite },
  textoAbaAtiva: { fontFamily: fonte.forte, color: cores.tinta },
  traco: { height: 3, borderRadius: 2, marginTop: 4, backgroundColor: 'transparent' },
  tracoAtivo: { backgroundColor: cores.caneta },
  novo: {
    marginLeft: 'auto',
    backgroundColor: cores.caneta,
    borderRadius: 12,
    minHeight: 48,
    paddingHorizontal: 18,
    justifyContent: 'center',
  },
  novoPressionado: { opacity: 0.8 },
  textoNovo: { fontFamily: fonte.forte, fontSize: 16, color: cores.branco },
});
