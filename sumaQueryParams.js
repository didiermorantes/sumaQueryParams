// Adaptación: SUMA por query params (Node puro, OOP, JSON), manteniendo tus rutas previas.

const { createServer } = require('node:http');
const { URL } = require('node:url');

// Servicio de dominio simple
class Calculator {
  add(a, b) {
    return a + b;
  }
}

class WebServer {
  constructor(hostname, port) {
    // variables del servidor
    this.hostname = hostname;
    this.port = port;

    // respuestas por defecto (para endpoints de texto plano que ya tenías)
    this.codeOK = 200;
    this.errorCode = 400;
    this.contentType = 'Content-Type';
    this.Type = 'text/plain';

    // dominio
    this.calculator = new Calculator();

    // inicialización del servidor
    this.server = createServer((req, res) => {
      // ====== CORS básico + preflight ======
      res.setHeader('Access-Control-Allow-Origin', '*'); // en prod, usar whitelist
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

      if (req.method === 'OPTIONS') {
        res.statusCode = 204;      // No Content
        res.setHeader('Content-Length', '0');
        return res.end();
      }

      // Logs originales
      let endpointRecibido = req.url;
      console.log(`el endpoint recibido es: ${endpointRecibido}`);
      console.log(' el tipo de dato del enpoint recibido: ', typeof endpointRecibido);

      // Armamos la URL completa y la parseamos
      const fullUrl = `http://${req.headers.host}${req.url}`;
      console.log('URL Armada: ', fullUrl);
      const myURL = new URL(fullUrl);

      // ====== NUEVO ENDPOINT JSON: GET /suma?dato1=&dato2= (o ?a=&b=) ======
      if (req.method === 'GET' && myURL.pathname === '/suma') {
        // Para este endpoint, forzamos JSON
        res.setHeader('Content-Type', 'application/json; charset=utf-8');

        // Tomamos dato1/dato2 o sus alias a/b
        const aRaw = myURL.searchParams.get('dato1') ?? myURL.searchParams.get('a');
        const bRaw = myURL.searchParams.get('dato2') ?? myURL.searchParams.get('b');

        // Validaciones
        const toNumberOrFail = (value, name) => {
          if (value === null || value === undefined || value === '') {
            res.statusCode = 400;
            return res.end(JSON.stringify({ error: `Falta el parámetro '${name}'.` }));
          }
          const n = Number(value);
          if (!Number.isFinite(n)) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ error: `'${name}' debe ser un número válido.` }));
          }
          return n;
        };

        const a = toNumberOrFail(aRaw, 'dato1');
        if (res.writableEnded) return; // ya respondió con error
        const b = toNumberOrFail(bRaw, 'dato2');
        if (res.writableEnded) return;

        // Operación
        const result = this.calculator.add(a, b);

        // Respuesta estándar
        res.statusCode = 200;
        return res.end(JSON.stringify({
          op: 'suma',
          by: 'query',
          a,
          b,
          result
        }));
      }

      // ====== Resto de tu lógica original (texto plano) ======
      res.statusCode = this.codeOK;
      res.setHeader(this.contentType, this.Type);

      // Parseo minimal de tu ejemplo de /consulta?...
      let elNombre = '';
      let elApellido = '';
      let laCedula = '';

      const endpointProcesado = fullUrl.split('?');
      console.log('endpointProcesado[0]', endpointProcesado[0]);
      console.log('endpointProcesado[1]', endpointProcesado[1]);

      if (endpointProcesado[1] === null || endpointProcesado[1] === undefined || endpointProcesado[1] == '') {
        console.log('La segunda porción del endpoint procesado está vacía o nula');
      } else {
        // Reusamos myURL ya creado
        console.log('******************************************');
        elNombre = myURL.searchParams.get('nombre');
        console.log(`El nombre recibido es: ${elNombre}`);
        elApellido = myURL.searchParams.get('apellido');
        console.log(`El apellido recibido es: ${elApellido}`);
        laCedula = myURL.searchParams.get('cedula');
        console.log(`La cedula recibida es: ${laCedula}`);
        console.log('******************************************');

        endpointRecibido = '/consulta';
      }

      switch (endpointRecibido) {
        case '/':
          res.write('Hola Mundoooooooo');
          break;
        case '/hola':
          res.write('Este es un saludo diferente a hola mundo');
          break;
        case '/didier':
          res.write('Bienvenido didier');
          break;
        case '/consulta':
          {
            const mensaje = `Se hizo una consulta por query params, y los parametros recibidos fueron Nombre: ${elNombre}, Apelllido: ${elApellido}, y Cedula: ${laCedula}`;
            res.write(mensaje);
          }
          break;
        case '/consulta/sql/id/':
          res.write('Vamos a la base de datos SQL usando el enpoint /consulta/sql/id/ ...');
          break;
        case '/consulta/sql/nombre/':
          res.write('Vamos a la base de datos');
          break;
        case '/consulta/nosql':
          res.write('Vamos a la base de datos');
          break;
        case '/borrar':
          res.write('Eliminamos de la base de datos');
          break;
        default:
          res.statusCode = this.errorCode;
          let mensaje= `Endpoint incorrecto para consulta por Query Params. \n Intente nuevamente con http://127.0.0.1:3000/consulta?nombre=elfar&apellido=morantes&cedula=808080\n `;
          mensaje+= `Tambien puede intentar http://127.0.0.1:3000/suma?dato1=5&dato2=6 \n`;
        mensaje+= `O algunos endpoint mas sencillos como /hola /didier o /borrar \n`;
          res.write(mensaje);
          break;
      }

      res.end();
    });
  } // fin constructor

  iniciarServidor() {
    this.server.listen(this.port, this.hostname, () => {
      console.log(`Servidor corriendo en  http://${this.hostname}:${this.port}/`);
      console.log(`Endpoint de suma (query) disponible: GET http://${this.hostname}:${this.port}/suma?dato1=5&dato2=6`);
      console.log(`También puedes usar alias: GET http://${this.hostname}:${this.port}/suma?a=5&b=6`);
    });
  }
}

// Instancia y arranque
// CONFIGURACION PARA 
// Escucha en process.env.PORT en 0.0.0.0:
// Render exige que el servicio se vincule al puerto y host anteriores para enrutar trafico.
const direccion = '0.0.0.0';
const puerto = process.env.PORT || 3002;

const miWebServer = new WebServer(direccion , puerto);
miWebServer.iniciarServidor();
