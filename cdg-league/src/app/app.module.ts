import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';  // Importa il componente standalone

@NgModule({
  imports: [
    BrowserModule,
    AppComponent // Importa il componente standalone qui
  ],
  bootstrap: [AppComponent] // Bootstrap il componente
})
export class AppModule {}
