import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Importa le componenti
import { MatchDetailComponent } from './app/components/match-detail/match-detail.component';
import { UserProfileComponent } from './app/components/user-profile/user-profile.component';

// Definisci il tipo per il parametro 'route'
interface PrerenderRoute {
  path: string;
  component: any;
  getPrerenderParams: (route: any) => { id: string }[];
}

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

// Definisci le rotte per il prerendering
const routes: PrerenderRoute[] = [
  {
    path: 'profile/:id',
    component: UserProfileComponent,
    getPrerenderParams: (route: any) => {
      // Ritorna i parametri da prerenderizzare
      return [{ id: '1' }, { id: '2' }];
    }
  },
  {
    path: 'match/:id',
    component: MatchDetailComponent,
    getPrerenderParams: (route: any) => {
      // Ritorna i parametri da prerenderizzare
      return [{ id: '100' }, { id: '101' }];
    }
  }
];

// Serve i file statici dal browserDistFolder
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Gestisce tutte le richieste rendendo l'app Angular.
 */
app.use('/**', (req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

// Avvia il server
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler utilizzato da Angular CLI (per il dev-server e durante il build) o Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
