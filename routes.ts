import RequestData from 'mock-xmlhttprequest/dist/types/RequestData';

type RouteDataReturn = { [key: string]: any };

interface BaseRoute {
  path: string;
  data?: (req: RequestData) => RouteDataReturn | Promise<RouteDataReturn>;
}

interface RouteWithTemplate extends BaseRoute {
  template: string;
}

interface RouteWithTemplateUrl extends BaseRoute {
  templateUrl: string;
}

export type Route = RouteWithTemplate | RouteWithTemplateUrl;

export const routes: Route[] = [
  {
    path: '/api/debug',
    template: `
      <h2>Hello {{ username }}, on {{ time }}!</h2>
      <p>Below are some random names.</p>
      <ul>
        {{#names}}
        <li>{{ . }}</li>
        {{/names}}
      </ul>
    `,
    data: (req) => {
      const body = JSON.parse(req.body);
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            names: ['John', 'Jane'],
            time: new Date().toLocaleString(),
            username: body['name'],
          });
        }, 2000);
      });
    },
  },
];
