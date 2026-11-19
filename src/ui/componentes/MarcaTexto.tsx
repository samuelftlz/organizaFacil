import { StyleSheet, Text, View } from 'react-native';
import { cores, fonte } from '../tema';

interface Props {
  cor: string;
  children: string;
  tamanho?: number;
}


export function MarcaTexto({ cor, children, tamanho = 14 }: Props) {
  return (
    <View style={estilos.caixa}>
      <View style={[estilos.risco, { backgroundColor: cor }]} />
      <Text style={[estilos.texto, { fontSize: tamanho }]}>{children}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  caixa: { marginHorizontal: 5 },
  risco: {
    position: 'absolute',
    left: -5,
    right: -5,
    top: 1,
    bottom: 0,
    borderRadius: 3,
    transform: [{ rotate: '-1.5deg' }],
  },
  texto: { fontFamily: fonte.forte, color: cores.tinta },
});
