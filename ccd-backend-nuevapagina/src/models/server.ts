import express from "express";
import http from "http";
import cors from "cors";
import { connect } from "../db/connection";
import { Server as SocketIOServer } from "socket.io";
import Sockets from "../sockets/socket";
import inicioRouth from "../routes/inicio";
import authRouth from "../routes/auth";
import pagoRouth from "../routes/pago";
import storageRouth from "../routes/storage";
import bodyParser from "body-parser";

class Server {
  //Variables para definir el servidor
  private app: express.Application;
  private port: String;
  private server: http.Server;
  private io: SocketIOServer;
  private sockets: any;
  //Variables de rutas
  private paths = {
    pago: "/pago",
    storage: "/storage",
    inicio: "/inicio",
    auth: "/auth",
    infraestructura: "/infraestructura",
    CentroAtencion: "/centro-atencion",
    InventarioDepartamental: "/inventario-departamental",
    Select: "/select",
    Menu: "/menu",
    Logistica: "/Logistica",
  }
  //Inicializador
  constructor() {
    this.app = express();
    this.port = process.env.PORT || "3100";
    this.server = http.createServer(this.app);
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: "*", // O puedes especificar los orígenes permitidos aquí
        methods: ["GET", "POST"], // Métodos permitidos
      },
    });
    this.sockets = new Sockets(this.io)
  }
  //Intermediario
  midlewares() {
    // Configuración de CORS para solicitudes HTTP
    this.app.use(cors({
      origin: "*", // Permitir todas las solicitudes de origen
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Métodos permitidos
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true, // Encabezados permitidos
    }));
    this.app.use('/public', express.static("public"));
    this.app.use(bodyParser.json({ limit: '50mb' }));
    this.app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
    this.app.use(express.json());
    this.app.options('*', cors());

    this.app.use((req, res, next) => {
      res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
      res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
      next();
    });
  
  }
  //Rutas
  routes() {
    this.app.use(this.paths.inicio, inicioRouth);
    this.app.use(this.paths.auth, authRouth);
    this.app.use(this.paths.pago, pagoRouth);
    this.app.use(this.paths.storage, storageRouth);

  }
  //Conexion a la base de datos
  async dbConnect() {
    try {
      await connect();
      console.log("Bases de datos online");
    } catch (error) {
      console.log("Bases de datos offline");
      console.log(error);
      throw error;
    }
  }
  //Funcion que ejecuta todo
  execute() {
    this.midlewares();
    this.routes();
    this.server.listen(this.port, () => {
    });

    this.app.get("/", (req, res) => {
      const html = `
        <html>
          <head>
          <title>yaaa</title>
          </head>
            <body>
            <h1>RECI</h1>
            </body>
        </html>
        `;
      res.send(html)
    })




  }
}

export default Server;
