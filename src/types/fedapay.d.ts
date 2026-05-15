declare module 'fedapay' {
  export class FedaPay {
    static setApiKey(key: string): void;
    static setEnvironment(env: 'sandbox' | 'live'): void;

    static Transaction: {
      create(data: Record<string, any>): Promise<FedaPayTransaction>;
      retrieve(id: number): Promise<FedaPayTransaction>;
    };
  }

  export interface FedaPayTransaction {
    id: number;
    status: string;
    amount: number;
    reference: string;
    generateToken(): Promise<{ token: string; url: string }>;
  }
}
