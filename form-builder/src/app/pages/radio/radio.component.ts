import { CommonModule } from "@angular/common";
import { Component ,Input } from '@angular/core';

@Component({
  selector: 'app-radio',
  standalone:true,
  imports: [CommonModule],
  templateUrl: './radio.component.html',
  styleUrl: './radio.component.css'
})
export class RadioComponent {
  @Input() field: any;
}
