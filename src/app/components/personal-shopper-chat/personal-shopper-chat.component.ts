import { Component, inject, signal, ElementRef, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PersonalShopperService } from '../../services/personal-shopper.service';

@Component({
  selector: 'app-personal-shopper-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './personal-shopper-chat.component.html',
  styleUrl: './personal-shopper-chat.component.css'
})
export class PersonalShopperChatComponent {

  shopperService = inject(PersonalShopperService);

  isOpen = signal<boolean>(false);

  userInputValue = signal<string>('');

  // Referencia moderna al contenedor de mensajes para hacer scroll automático
  private scrollContainer = viewChild<ElementRef>('scrollContainer');

  // Alternar la visibilidad de la ventana de chat
  toggleChat() {
    this.isOpen.update(value => !value);
  }

  async sendMessage() {
    const text = this.userInputValue().trim();
    if (!text || this.shopperService.isLoading()) return;

    this.userInputValue.set('');
    await this.shopperService.sendMessage(text);
    this.scrollToBottom();
  }

  // Lógica para forzar la vista hacia el último mensaje recibido
  private scrollToBottom() {
    setTimeout(() => {
      const el = this.scrollContainer()?.nativeElement;
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    }, 50);
  }
}
