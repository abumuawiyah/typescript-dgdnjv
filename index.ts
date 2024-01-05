import 'htmx.org';
import 'htmx.org/dist/ext/json-enc.js';
import { Route, routes } from './routes';
import Mustache = require('mustache');
import './style.css';
import { newServer } from 'mock-xmlhttprequest';
import MockXhrRequest from 'mock-xmlhttprequest/dist/types/MockXhrRequest';

const routeValidator = (path: string) => (inputUrl: string) =>
  inputUrl.startsWith(path);

const routeHandler = (route: Route) => (req: MockXhrRequest) => {
  const templatePromise =
    'template' in route
      ? Promise.resolve(route.template)
      : fetch(route.templateUrl).then((res) => res.text());
  const dataPromise = route.data ? route.data(req.requestData) : {};

  Promise.all([templatePromise, dataPromise])
    .then(([template, data]) => Mustache.render(template, data))
    .then((renderedTemplate) => req.respond(200, {}, renderedTemplate));
};

const server = newServer();
routes.forEach((route) => {
  server.get(routeValidator(route.path), routeHandler(route));
  server.post(routeValidator(route.path), routeHandler(route));
});
server.setDefaultHandler((req) => {
  fetch(req.url, {
    headers: req.requestHeaders.getHash(),
    method: req.method,
    body: req.body,
  })
    .then((res) => {
      req.setResponseHeaders(
        res.status,
        Object.fromEntries(res.headers.entries()),
        res.statusText
      );
      return res.text();
    })
    .then((res) => req.setResponseBody(res));
});
server.install(window);
