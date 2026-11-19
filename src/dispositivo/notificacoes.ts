import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { Alert, Platform } from 'react-native';
import { planejarLembretes } from '../controle/lembretes';
import { jaPediuAlarmeExato, marcarPedidoAlarmeExato } from '../persistencia/armazenamento';
import { Tarefa } from '../tipos';

const CANAL = 'prazos';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function temPermissao(): Promise<boolean> {
  const atual = await Notifications.getPermissionsAsync();
  if (atual.granted) return true;
  if (!atual.canAskAgain) return false;
  return (await Notifications.requestPermissionsAsync()).granted;
}

function confirmar(titulo: string, mensagem: string): Promise<boolean> {
  return new Promise((resolver) => {
    Alert.alert(
      titulo,
      mensagem,
      [
        { text: 'Agora não', style: 'cancel', onPress: () => resolver(false) },
        { text: 'Permitir', onPress: () => resolver(true) },
      ],
      { cancelable: true, onDismiss: () => resolver(false) },
    );
  });
}


async function garantirAlarmeExato(): Promise<void> {
  const atual = await Notifications.getExactAlarmPermissionsAsync();
  if (atual.granted || !atual.canAskAgain || (await jaPediuAlarmeExato())) return;
  await marcarPedidoAlarmeExato();
  const aceitou = await confirmar(
    'Lembretes na hora certa',
    'Para avisar exatamente no horário que você escolheu, o Android precisa que você ative "Alarmes e lembretes" para o OrganizaFácil na próxima tela.',
  );
  if (aceitou) await Notifications.requestExactAlarmPermissionsAsync();
}

async function reagendar(tarefas: Tarefa[]): Promise<void> {
  const lembretes = planejarLembretes(tarefas);
  
  if (lembretes.length === 0 || !(await temPermissao())) {
    await Notifications.cancelAllScheduledNotificationsAsync();
    return;
  }
  if (Platform.OS === 'android') {
    await garantirAlarmeExato();
    await Notifications.setNotificationChannelAsync(CANAL, {
      name: 'Prazos de entrega',
      importance: AndroidImportance.HIGH,
    });
  }
  await Notifications.cancelAllScheduledNotificationsAsync();
  for (const lembrete of lembretes) {
    await Notifications.scheduleNotificationAsync({
      content: { title: lembrete.titulo, body: lembrete.corpo },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: lembrete.quando,
        channelId: CANAL,
      },
    });
  }
}

let fila: Promise<void> = Promise.resolve();


export function sincronizarLembretes(tarefas: Tarefa[]): void {
  fila = fila.then(() => reagendar(tarefas)).catch(() => undefined);
}
