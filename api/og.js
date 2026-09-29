import app from '../server.cjs';

export default function handler(req, res) {
  const queryIndex = req.url.indexOf('?');
  const qs = queryIndex !== -1 ? req.url.slice(queryIndex) : '';
  req.url = '/api/og' + qs;
  return app(req, res);
}
