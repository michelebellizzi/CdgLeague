import { enableProdMode } from '@angular/core';
import { environment } from './environments/environment';
import { AppServerModule } from './app/app.server.module';  // Importa il server module
import { renderModule } from '@angular/platform-server';  // Importa renderModule
import { config } from './app/app.config.server';  // Corretto: usa 'config' invece di 'appConfig'

if (environment.production) {
  enableProdMode();  // Abilita la modalità di produzione per performance ottimizzate
}

// Questa funzione gestisce il bootstrap dell'app server
export { AppServerModule } from './app/app.server.module';

// Renderizza il modulo server
renderModule(AppServerModule, {
  document: '<app-root></app-root>',  // Il documento HTML di base
  url: '/'  // L'URL della pagina da renderizzare
}).catch(err => {
  console.error('Error during SSR bootstrap:', JSON.stringify(err, null, 2));  // Gestisce gli errori di bootstrap
});
