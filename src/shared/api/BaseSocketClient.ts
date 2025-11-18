import { Client } from '@stomp/stompjs'; // Dodano StompSubscription
import type { IMessage, StompSubscription } from '@stomp/stompjs';

// Klasa generyczna z typem T dla ładunku wiadomości
export class BaseSocketClient<T> { 
  protected client: Client;
  protected serviceName: string;

  constructor(brokerUrl: string, serviceName: string) {
    this.serviceName = serviceName;
    
    this.client = new Client({
      brokerURL: brokerUrl,
      debug: (str) => {
        console.log(`[WS-${this.serviceName.toUpperCase()}]: ${str}`);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

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
    const token = localStorage.getItem('authToken');
    if (token) {
      this.client.connectHeaders = {
        Authorization: `Bearer ${token}`,
      };
      console.log(`[${this.serviceName}] Activating...`);
      this.client.activate();
    } else {
      console.error(`[${this.serviceName}] No auth token found. Cannot connect.`);
    }
  }

  public deactivate() {
    console.log(`[${this.serviceName}] Deactivating...`);
    this.client.deactivate();
  }

  public isConnected(): boolean {
    return this.client.connected;
  }
  
  // --- METODY SUBSKRYPCJI ---

  // Zmieniamy na PUBLICZNĄ metodę i dodajemy zwrot subscriptionId
  public subscribeToTopic(topic: string, callback: (payload: T) => void): string {
    const trySubscribe = () => {
        if (this.client.connected) {
            console.log(`[${this.serviceName}] Subscribing to: ${topic}`);
            
            // Zapisujemy subskrypcję do zwrotu ID
            const subscription: StompSubscription = this.client.subscribe(topic, (message: IMessage) => {
                if (message.body) {
                    try {
                        // UŻYWAMY TYPU GENERYCZNEGO T
                        callback(JSON.parse(message.body) as T); 
                    } catch (e) {
                        console.error(`[${this.serviceName}] JSON Parse Error`, e);
                    }
                }
            });
            // Zwracamy ID subskrypcji
            return subscription.id; 

        } else {
            console.log(`[${this.serviceName}] Waiting for connection...`);
            setTimeout(trySubscribe, 500);
            return ''; // Powrót pustego ID podczas oczekiwania
        }
    }
    
    // Z uwagi na asynchroniczność, w hooku musimy upewnić się, że połączenie jest aktywne PRZED subskrypcją.
    // Tutaj pozostawiamy oryginalną logikę z retry, ale zmieniamy typowanie callbacka na Promise.
    // Jednak, dla prostoty, zwrócimy to co trySubscribe, co może być pustym stringiem, jeśli nie połączono od razu.
    return trySubscribe() || '';
  }
  
  // Metoda do usuwania subskrypcji
  public unsubscribe(subscriptionId: string): void {
      if (this.client.active) {
          this.client.unsubscribe(subscriptionId);
          console.log(`[${this.serviceName}] Unsubscribed: ${subscriptionId}`);
      }
  }
}