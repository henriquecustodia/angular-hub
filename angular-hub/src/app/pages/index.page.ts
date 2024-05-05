import { Component, computed, inject, Input, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { HeaderService } from '../services/header.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { injectLoad } from '@analogjs/router';
import { load } from './index.server';
import { EventCardComponent } from '../components/cards/event-card.component';
import { CalendarModule } from 'primeng/calendar';
import { FormsModule } from '@angular/forms';
import { isSameDay } from 'date-fns';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-home',
  standalone: true,
  template: `
    <aside
      class="h-36 w-full flex flex-col justify-center items-center mb-8"
      style="background-image: url(/assets/images/img.png); background-repeat: no-repeat; background-size: cover;"
    >
      <h1 class="title text-5xl">ANGULAR HUB</h1>
      <h2 class="text-2xl">Curated list of Angular Communities and Events</h2>
    </aside>
    <form class="w-full flex justify-center gap-2 mb-8">
      <p-calendar
        name="date"
        [ngModel]="date"
        (ngModelChange)="date.set($event)"
        placeholder="Select a date"
        [showClear]="true"
      />
      <p-dropdown
        [style]="{ width: '230px' }"
        name="language"
        [options]="languages()"
        [showClear]="true"
        [ngModel]="selectedLanguage()"
        (ngModelChange)="selectedLanguage.set($event)"
        placeholder="Select a language"
      />
    </form>

    <ul
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 justify-start items-start px-8"
    >
      @for (event of filteredEvents(); track event.name) {
        <li>
          <app-event-card [event]="event"></app-event-card>
        </li>
      }
    </ul>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        align-items: center;
      }
    `,
  ],
  imports: [
    RouterLink,
    EventCardComponent,
    CalendarModule,
    FormsModule,
    ButtonModule,
    RouterLinkActive,
    DropdownModule,
  ],
})
export default class HomeComponent {
  #headerService = inject(HeaderService);

  events = toSignal(injectLoad<typeof load>(), { requireSync: true });
  date = signal(null);
  selectedLanguage = signal(null);

  filteredEvents = computed(() => {
    return this.events().filter((event) => {
      return (
        (this.date()
          ? isSameDay(new Date(event.date), new Date(this.date()!))
          : true) &&
        (this.selectedLanguage()
          ? event.language === this.selectedLanguage()
          : true)
      );
    });
  });

  languages = computed(() => {
    return Array.from(new Set(this.events().map((event) => event.language)));
  });

  @Input() set header(header: string) {
    this.#headerService.setHeaderTitle(header);
  }
}
