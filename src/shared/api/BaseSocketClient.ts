import { Client } from '@stomp/stompjs';
import type { IMessage, StompSubscription } from '@stomp/stompjs';

// Klasa generyczna z typem T dla ładunku wiadomości
export class BaseSocketClient<T> { 
  protected client: Client;
  protected serviceName: string;

  constructor(brokerUrl: string, serviceName: string) {
    this.serviceName = serviceName;
    
    this.client = new Client({
      brokerURL: brokerUrl,
      
      // --- KONFIGURACJA POŁĄCZENIA ---
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      // KLUCZOWA ZMIANA: beforeConnect wykonuje się przed KAŻDĄ próbą połączenia (również przy reconnect)
      beforeConnect: () => {
          const token = localStorage.getItem('accessToken');
          
          if (token) {
              this.client.connectHeaders = {
                  Authorization: `Bearer ${token}`,
              };
              console.log(`[${this.serviceName}] Attaching fresh Bearer Token...`);
          } else {
              console.warn(`[${this.serviceName}] No token found in localStorage. Connecting as guest/cookie...`);
              // Jeśli używasz ciasteczek, to tutaj headers mogą być puste, a przeglądarka i tak wyśle cookie.
              // Jeśli JWT jest wymagane, backend odrzuci połączenie, a klient spróbuje ponownie za 5s (gdy token może już wrócić).
          }
      },

      debug: (str) => {
        // console.log(`[WS-${this.serviceName.toUpperCase()}]: ${str}`);
      },
    });

    // --- HANDLERY ---

    this.client.onConnect = (frame) => {
      console.log(`[${this.serviceName}] Connected!`);
    };

    this.client.onStompError = (frame) => {
      console.error(`[${this.serviceName}] Broker error: ${frame.headers['message']}`);
      console.error(`Details: ${frame.body}`);
    };

    this.client.onWebSocketClose = () => {
        console.log(`[${this.serviceName}] Connection Closed`);
    }
  }

  // --- METODY CYKLU ŻYCIA ---

  public activate() {
    // ZMIANA: Po prostu aktywujemy klienta.
    // Logika pobierania tokena została przeniesiona do beforeConnect wyżej.
    console.log(`[${this.serviceName}] Activating client...`);
    this.client.activate();
  }

  public deactivate() {
    console.log(`[${this.serviceName}] Deactivating...`);
    this.client.deactivate();
  }

  public isActive(): boolean {
    return this.client.active;
  }
  
  public isConnected(): boolean {
      return this.client.connected;
  }
  
  // --- METODY SUBSKRYPCJI ---

  public subscribeToTopic(topic: string, callback: (payload: T) => void): string {
    const trySubscribe = () => {
        if (this.client.connected) {
            console.log(`[${this.serviceName}] Subscribing to: ${topic}`);
            
            const subscription: StompSubscription = this.client.subscribe(topic, (message: IMessage) => {
                if (message.body) {
                    try {
                        callback(JSON.parse(message.body) as T); 
                    } catch (e) {
                        console.error(`[${this.serviceName}] JSON Parse Error`, e);
                    }
                }
            });
            return subscription.id; 

        } else {
            // console.log(`[${this.serviceName}] Waiting for connection...`);
            setTimeout(trySubscribe, 500);
            return ''; 
        }
    }
    
    return trySubscribe() || '';
  }
  
  public unsubscribe(subscriptionId: string): void {
      // Dodano try-catch i sprawdzenie clienta, aby uniknąć błędów przy demontażu
      if (this.client && subscriptionId) {
          try {
              // Sprawdzamy czy connected, bo unsubscribe na rozłączonym kliencie może rzucić błąd
              if (this.client.connected) {
                 this.client.unsubscribe(subscriptionId);
                 console.log(`[${this.serviceName}] Unsubscribed: ${subscriptionId}`);
              }
          } catch (e) {
              console.warn(`[${this.serviceName}] Failed to unsubscribe safely:`, e);
          }
      }
  }
}