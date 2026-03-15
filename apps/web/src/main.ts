import Bugsnag from '@bugsnag/js';
import { plugin } from '@bugsnag/plugin-angular';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';

if (environment.bugsnagApiKey) {
  Bugsnag.start({
    apiKey: environment.bugsnagApiKey,
    plugins: [plugin],
  });
}

bootstrapApplication(AppComponent, appConfig).catch((err: unknown) => {
  if (Bugsnag.isStarted()) {
    Bugsnag.notify(err instanceof Error ? err : new Error(String(err)));
  }
  console.error(err);
});
