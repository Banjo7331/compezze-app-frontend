import { BaseSocketClient } from '@/shared/api/BaseSocketClient';
import type { WSMessage } from '../model/types'; 

const SURVEY_WS_URL = 'ws://localhost:8003/ws'; 

// Definicja generycznego typu payloadu (bez zmian)
type SurveySocketPayload = WSMessage; 

class SurveySocketClient extends BaseSocketClient<SurveySocketPayload> {
  constructor() {
    super(SURVEY_WS_URL, 'Survey'); 
  }
  
  // FIX 1: Dodanie metody isActive() (i connectAndSubscribe)
  public isActive(): boolean {
      return this.client.active; // Metoda dziedziczona z BaseSocketClient
  }

  // Uproszczona metoda aktywacji
  public connectAndSubscribe(onConnect?: () => void): void {
      // Używamy onConnect z BaseSocketClient.onConnect
      this.client.onConnect = () => {
          console.log(`[${this.serviceName}] Connected!`);
          if (onConnect) onConnect();
      };
      this.activate();
  }

  // FIX 2: Metoda subskrypcji musi zwracać ID subskrypcji (string)
  // BaseSocketClient.ts ma publiczną metodę subscribeToTopic, która zwraca string.
  public subscribeToRoomUpdates(roomId: string, callback: (data: SurveySocketPayload) => void): string {
    // Zapewniamy, że zwracamy wartość z metody bazowej (czyli subscriptionId)
    return this.subscribeToTopic(`/topic/room/${roomId}`, callback); 
  }
  
  // Metoda do anulowania subskrypcji
  public unsubscribe(subscriptionId: string): void {
      super.unsubscribe(subscriptionId);
  }
}

export const surveySocket = new SurveySocketClient();