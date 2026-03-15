import { Injectable } from '@angular/core';
import Bugsnag from '@bugsnag/js';

@Injectable({ providedIn: 'root' })
export class ErrorReportingService {
  notify(error: unknown, context?: string): void {
    if (!Bugsnag.isStarted()) return;

    const err: Error = error instanceof Error ? error : new Error(String(error));
    Bugsnag.notify(err, (event) => {
      if (context) {
        event.context = context;
      }
    });
  }
}
