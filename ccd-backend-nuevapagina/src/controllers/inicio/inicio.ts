import { request, response } from "express";
import SubCategoria from "../../models/subcategoria";

export const listarSubCategoriaxCategoria = async (req = request, res = response) => {
  const { pcategoria } = req.body;

  const data = await SubCategoria.findAll({
    raw: true,
    attributes: [
      "IdSubCategoria",
      "SubCategoria"
    ],
    where: {
      Categoria_id: pcategoria
    },
  });
  if (data) {
    try {
      return res.status(200).json({
        ok: true,
        msg: "Informacion Correcta",
        data,
      });
    } catch (err) {
      return res.status(400).json({
        ok: false,
        msg: "Error de conexión",
      });
    }
  } else {
    res.status(401).json({
      ok: false,
      msg: "Error de conexión",
    });
  }
};