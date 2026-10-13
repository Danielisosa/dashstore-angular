import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PersonalShopperChatComponent } from './components/personal-shopper-chat/personal-shopper-chat.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, PersonalShopperChatComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'dash-store';
}
