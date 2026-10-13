import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface ChatMessage {
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class PersonalShopperService {
  private http = inject(HttpClient);

  private apiUrl = '/.netlify/functions/gemini-proxy';

  private messagesSignal = signal<ChatMessage[]>([
    {
      sender: 'assistant',
      text: '¡Hola! Soy tu asistente virtual de DashStore. ¿En qué puedo ayudarte hoy con tus compras?',
      timestamp: new Date()
    }
  ]);

  private isLoadingSignal = signal<boolean>(false);

  readonly messages = this.messagesSignal.asReadonly();
  readonly isLoading = this.isLoadingSignal.asReadonly();

  async sendMessage(userPrompt: string): Promise<void> {
    if (!userPrompt.trim() || this.isLoadingSignal()) return;

    const userMessage: ChatMessage = { sender: 'user', text: userPrompt, timestamp: new Date() };
    this.messagesSignal.update(msgs => [...msgs, userMessage]);
    this.isLoadingSignal.set(true);

    try {
      // Enviamos el prompt plano a nuestra función proxy
      const response: any = await firstValueFrom(
        this.http.post(this.apiUrl, { prompt: userPrompt })
      );

      const candidateText = response?.text || 'Lo siento, no pude procesar tu respuesta.';

      const assistantMessage: ChatMessage = {
        sender: 'assistant',
        text: candidateText,
        timestamp: new Date()
      };

      this.messagesSignal.update(msgs => [...msgs, assistantMessage]);

    } catch (error) {
      console.error('Error al conectar con el asistente:', error);
      const responseError = error instanceof HttpErrorResponse ? error.error?.error : undefined;
      const errorMessage: ChatMessage = {
        sender: 'assistant',
        text: typeof responseError === 'string'
          ? responseError
          : 'Hubo un error de conexión con el asistente inteligente. Por favor, intenta de nuevo más tarde.',
        timestamp: new Date()
      };
      this.messagesSignal.update(msgs => [...msgs, errorMessage]);
    } finally {
      this.isLoadingSignal.set(false);
    }
  }
}
