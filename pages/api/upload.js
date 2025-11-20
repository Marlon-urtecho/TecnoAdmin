import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import fs from 'fs';
import mime from 'mime-types';
import multiparty from 'multiparty';
import { getServerSession } from 'next-auth';
import { authOptions } from "./auth/[...nextauth]";

const bucketName = 'dawid-next-ecommerce';

export default async function handle(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Verificar la autenticación del admin
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ error: "No autenticado" });
    }

    // Por esta verificación más robusta:
    const isAdmin = session.user.isAdmin || 
                session.user.es_superusuario || 
                session.user.es_personal || 
                session.user.email === 'urtechoalex065@gmail.com';

    if (!isAdmin) {
          return res.status(403).json({ error: "No autorizado - Se requieren permisos de administrador" });
    }

    // Procesar el formulario multipart
    const form = new multiparty.Form();
    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve({ fields, files });
      });
    });

    console.log('Archivos recibidos:', files.file?.length || 0);

    // Configurar cliente S3
    const client = new S3Client({
      region: 'us-east-1',
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      },
    });

    const links = [];
    
    // Procesar cada archivo
    if (files.file && files.file.length > 0) {
      for (const file of files.file) {
        try {
          const ext = file.originalFilename.split('.').pop();
          const newFilename = Date.now() + '-' + Math.random().toString(36).substring(2) + '.' + ext;
          
          await client.send(new PutObjectCommand({
            Bucket: bucketName,
            Key: newFilename,
            Body: fs.readFileSync(file.path),
            ACL: 'public-read',
            ContentType: mime.lookup(file.path) || 'application/octet-stream',
          }));

          const link = `https://${bucketName}.s3.amazonaws.com/${newFilename}`;
          links.push(link);

          // Limpiar archivo temporal
          fs.unlinkSync(file.path);
        } catch (fileError) {
          console.error('Error procesando archivo:', file.originalFilename, fileError);
          // Continuar con el siguiente archivo
        }
      }
    }

    return res.json({ links });

  } catch (error) {
    console.error('Error en API carga de archivos:', error);
    
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'El archivo ya existe' });
    }
    
    res.status(500).json({
      error: error.message || 'Error interno del servidor'
    });
  }
}

export const config = {
  api: { bodyParser: false },
};