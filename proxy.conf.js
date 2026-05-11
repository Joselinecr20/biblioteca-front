module.exports = [
  {
    context: ['/auth', '/libros', '/usuarios', '/reservas', '/prestamos', '/multas', '/upload'],
    target: 'http://localhost:8080',
    secure: false,
    changeOrigin: true,
    logLevel: 'debug',
    bypass: function (req) {
      if (req.headers.accept && req.headers.accept.includes('text/html')) {
        return '/index.html';
      }
    },
  },
];
