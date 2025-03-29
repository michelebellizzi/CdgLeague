import { NgModule } from '@angular/core';
import { ServerModule } from '@angular/platform-server';
import { AppComponent } from './app.component';

@NgModule({
  imports: [
    ServerModule // Importa solo il modulo server per il rendering lato server
  ],
  bootstrap: [AppComponent] // Bootstrap direttamente il componente standalone
})
export class AppServerModule {}
