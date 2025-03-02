import { Component, inject, OnInit } from '@angular/core';
import { google } from 'googleapis';
import { DatePipe } from "@angular/common";
import { OAuth2Client } from 'google-auth-library';

interface CalendarEvent {
  id: string;
  summary: string;
  start: Date;
  end: Date;
}

@Component({
  selector: 'app-calendar-widget',
  standalone: true,
  imports: [
    DatePipe
  ],
  template: `
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-lg font-semibold mb-4">Upcoming Events</h2>

      @if (isLoading) {
        <div class="flex justify-center items-center h-40">
          <span class="text-gray-500">Loading events...</span>
        </div>
      } @else if (error) {
        <div class="text-red-500 text-center">
          {{ error }}
        </div>
      } @else if (events.length === 0) {
        <div class="text-gray-500 text-center">
          No upcoming events
        </div>
      } @else {
        <div class="space-y-4">
          @for (event of events; track event.id) {
            <div class="border-l-4 border-blue-500 pl-4">
              <h3 class="font-medium">{{ event.summary }}</h3>
              <p class="text-sm text-gray-500">
                {{ event.start | date:'MMM d, y h:mm a' }}
              </p>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class CalendarWidgetComponent implements OnInit {
  private authService = inject(GoogleAuthService);

  events: CalendarEvent[] = [];
  isLoading = true;
  error: string | null = null;

  async ngOnInit() {
    await this.loadEvents();
  }

  private async loadEvents() {
    try {
      const auth = new google.auth.OAuth2(
        this.authService.getClientId(),
        this.authService.getClientSecret(),
        'http://localhost:4200/auth/callback'
      );

      auth.setCredentials({
        access_token: this.authService.getAccessToken()
      });

      const calendar = google.calendar({
        version: 'v3',
        auth: auth
      });

      const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        maxResults: 5,
        singleEvents: true,
        orderBy: 'startTime',
      });

      this.events = (response.data.items || []).map(event => ({
        id: event.id!,
        summary: event.summary!,
        start: new Date(event.start?.dateTime || event.start?.date!),
        end: new Date(event.end?.dateTime || event.end?.date!)
      }));
    } catch (err) {
      this.error = 'Failed to load calendar events';
      console.error('Calendar error:', err);
    } finally {
      this.isLoading = false;
    }
  }
}
