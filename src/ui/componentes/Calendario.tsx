import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { deISO, INICIAIS_SEMANA, MESES, paraISO } from '../../controle/datas';
import { cores, fonte } from '../tema';

interface Props {
  valor: string | null;
  hoje: string;
  aoEscolher: (iso: string) => void;
}


export function Calendario({ valor, hoje, aoEscolher }: Props) {
  const inicial = deISO(valor ?? hoje);
  const [mes, setMes] = useState({ ano: inicial.getFullYear(), indice: inicial.getMonth() });

  const mudarMes = (passo: number) => {
    const data = new Date(mes.ano, mes.indice + passo, 1);
    setMes({ ano: data.getFullYear(), indice: data.getMonth() });
  };

  const vaziosAntes = new Date(mes.ano, mes.indice, 1).getDay();
  const diasNoMes = new Date(mes.ano, mes.indice + 1, 0).getDate();
  const celulas: (number | null)[] = [
    ...Array<null>(vaziosAntes).fill(null),
    ...Array.from({ length: diasNoMes }, (_, i) => i + 1),
  ];

  return (
    <View>
      <View style={estilos.cabecalho}>
        <Text style={estilos.mes}>
          {MESES[mes.indice]} de {mes.ano}
        </Text>
        <View style={estilos.setas}>
          <Pressable
            onPress={() => mudarMes(-1)}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel="Mês anterior"
            style={estilos.seta}
          >
            <View style={[estilos.ponta, estilos.pontaEsquerda]} />
          </Pressable>
          <Pressable
            onPress={() => mudarMes(1)}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel="Próximo mês"
            style={estilos.seta}
          >
            <View style={[estilos.ponta, estilos.pontaDireita]} />
          </Pressable>
        </View>
      </View>

      <View style={estilos.grade}>
        {INICIAIS_SEMANA.map((inicialDia, i) => (
          <View key={`s${i}`} style={estilos.celulaSemana}>
            <Text style={estilos.semana}>{inicialDia}</Text>
          </View>
        ))}
        {celulas.map((dia, i) => {
          if (dia === null) return <View key={`v${i}`} style={estilos.celula} />;
          const iso = paraISO(new Date(mes.ano, mes.indice, dia));
          const escolhido = iso === valor;
          const ehHoje = iso === hoje;
          return (
            <View key={iso} style={estilos.celula}>
              <Pressable
                onPress={() => aoEscolher(iso)}
                accessibilityRole="button"
                accessibilityLabel={`Dia ${dia} de ${MESES[mes.indice]}`}
                accessibilityState={{ selected: escolhido }}
                style={[estilos.dia, escolhido && estilos.diaEscolhido]}
              >
                <Text
                  style={[
                    estilos.textoDia,
                    iso < hoje && estilos.textoPassado,
                    escolhido && estilos.textoEscolhido,
                  ]}
                >
                  {dia}
                </Text>
                {ehHoje && <View style={estilos.pontoHoje} />}
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  mes: { fontFamily: fonte.forte, fontSize: 17, color: cores.tinta },
  setas: { flexDirection: 'row', gap: 4 },
  seta: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  
  ponta: { width: 11, height: 11, borderColor: cores.caneta, borderTopWidth: 2.5 },
  pontaEsquerda: { borderLeftWidth: 2.5, transform: [{ rotate: '-45deg' }], marginLeft: 5 },
  pontaDireita: { borderRightWidth: 2.5, transform: [{ rotate: '45deg' }], marginRight: 5 },
  grade: { flexDirection: 'row', flexWrap: 'wrap' },
  celulaSemana: {
    width: `${100 / 7}%`,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: cores.pauta,
    marginBottom: 4,
  },
  semana: { fontFamily: fonte.media, fontSize: 13, color: cores.grafite },
  celula: { width: `${100 / 7}%`, height: 44, alignItems: 'center', justifyContent: 'center' },
  dia: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  diaEscolhido: { borderColor: cores.caneta },
  textoDia: { fontFamily: fonte.normal, fontSize: 16, color: cores.tinta },
  textoPassado: { color: cores.grafiteClaro },
  textoEscolhido: { fontFamily: fonte.preta, color: cores.caneta },
  pontoHoje: {
    position: 'absolute',
    bottom: 3,
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: cores.margem,
  },
});
