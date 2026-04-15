export function sendJson(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

export function sendError(res, status, message) {
  sendJson(res, status, { success: false, error: message });
}