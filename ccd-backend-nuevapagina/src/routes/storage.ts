import { Router, Request, Response, NextFunction } from 'express';
import request from 'request';
const router = Router();
import multer, { FileFilterCallback } from 'multer';

import { S3Client, ListBucketsCommand, ListObjectsCommand, DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3"

const storage = multer.memoryStorage();

const upload = multer({ storage });


export const r2 = new S3Client({
    region: "auto",
    endpoint: "https://89b4390775d9ea636df759447986d2ae.r2.cloudflarestorage.com",
    credentials: {
        accessKeyId: "565efaec224078967244d303913c30c2",
        secretAccessKey: "e10217b0b75da1269dba95b90e280f686836e88bbffa1fe187f1a9361b7d131d"
    }
})



router.post('/eliminar', async (req, res) => {
    try {
        const deletecommand = new DeleteObjectCommand({ Bucket: "ccd-storage", Key: "CCDLOGOWHITE.jpg" })
        const resp = await r2.send(deletecommand);
        const data = resp
        res.json(data);  // Devuelve la lista de buckets al frontend
    } catch (error) {
        res.status(500).json({ error: "" });
    }
});

router.post('/actualizar', upload.single('pdf'), async (req, res) => {

    try {
        const file = req.file; // El archivo cargado
        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Convierte el archivo a buffer
        const fileBuffer = file.buffer;

        const actualizacommand = new PutObjectCommand({ Bucket: "ccd-storage", Key: "Multimedia/Video/Ccd/Corporativo/ecolima2.png", Body: fileBuffer })
        const resp = await r2.send(actualizacommand);
        const data = resp

        res.json(data);  // Devuelve la lista de buckets al frontend
    } catch (error) {
        res.status(500).json({ error: "" });
    }
});

export default router;
