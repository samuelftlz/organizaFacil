import { TipoTarefa } from '../tipos';

export const cores = {
  papel: '#F8FAFD',
  pauta: '#D5E0EE',
  margem: '#F0667E',
  tinta: '#14224A',
  caneta: '#2346D4',
  grafite: '#5C6784',
  grafiteClaro: '#A4AEC4',
  vermelho: '#D5203A',
  branco: '#FFFFFF',
};

export const marcaTexto: Record<TipoTarefa, string> = {
  atividade: '#FFE65C',
  prova: '#FFA3C0',
  trabalho: '#9BE8A6',
};

export const fonte = {
  normal: 'BricolageGrotesque_400Regular',
  media: 'BricolageGrotesque_500Medium',
  forte: 'BricolageGrotesque_700Bold',
  preta: 'BricolageGrotesque_800ExtraBold',
};
