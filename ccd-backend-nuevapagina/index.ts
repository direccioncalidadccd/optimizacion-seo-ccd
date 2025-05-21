import Server from "./src/models/server";

const app = async () => {
  //Inicio de trycatch
  try {
    //Creacion de servidor
    const server = new Server();
    await server.dbConnect();
    server.execute();
  } catch (error) {
    console.log(error);
    throw new Error(error as string);
  }
};

//Ejecución de Promesa
app();
