import { getServerSession } from 'next-auth';
import { authOptions } from "./auth/[...nextauth]";
import fs from 'fs';
import path from 'path';
import multiparty from 'multiparty';

export default async function handle(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    console.log('=== INICIANDO UPLOAD LOCAL ===');
    
    // Verificar autenticación
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      console.log('❌ No autenticado');
      return res.status(401).json({ error: "No autenticado" });
    }

    const isAdmin = session.user.isAdmin || 
                session.user.es_superusuario || 
                session.user.es_personal || 
                session.user.email === 'urtechoalex065@gmail.com';

    if (!isAdmin) {
      console.log('❌ No autorizado');
      return res.status(403).json({ error: "No autorizado" });
    }

    console.log(' Usuario autorizado:', session.user.email);

    // Procesar formulario multipart
    const form = new multiparty.Form();
    
    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error('❌ Error parseando formulario:', err);
          reject(err);
          return;
        }
        console.log('Formulario parseado correctamente');
        resolve({ fields, files });
      });
    });

    console.log(' Archivos recibidos:', files.file?.length || 0);

    if (!files.file || files.file.length === 0) {
      console.log('❌ No se recibieron archivos');
      return res.status(400).json({ error: 'No se recibieron archivos' });
    }

    // Crear directorio de uploads si no existe
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      console.log(' Creando directorio uploads...');
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log(' Directorio creado:', uploadDir);
    }

    const links = [];
    const errors = [];
    
    // Procesar cada archivo
    for (const file of files.file) {
      try {
        console.log(` Procesando archivo: ${file.originalFilename}`);
        console.log(` Tamaño: ${file.size} bytes`);
        console.log(` Ruta temporal: ${file.path}`);

        // Validar que el archivo existe
        if (!fs.existsSync(file.path)) {
          console.error(` Archivo temporal no existe: ${file.path}`);
          errors.push(`Archivo ${file.originalFilename} no encontrado`);
          continue;
        }

        // Validar tipo de archivo
        const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        const fileBuffer = fs.readFileSync(file.path);
        
        // Verificar extensión
        const ext = path.extname(file.originalFilename).toLowerCase();
        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        
        if (!allowedExtensions.includes(ext)) {
          console.error(` Extensión no permitida: ${ext}`);
          errors.push(`Tipo de archivo no permitido: ${file.originalFilename}`);
          continue;
        }

        // Generar nombre único
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 15);
        const cleanName = file.originalFilename
          .toLowerCase()
          .replace(/[^a-z0-9.]/g, '-')
          .replace(/-+/g, '-')
          .substring(0, 50);
        
        const newFilename = `${timestamp}-${randomStr}-${cleanName}`;
        const filepath = path.join(uploadDir, newFilename);
        
        console.log(` Nuevo nombre: ${newFilename}`);

        // Copiar archivo a la carpeta de uploads
        fs.copyFileSync(file.path, filepath);
        console.log(` Archivo guardado: ${filepath}`);

        // Generar link público
        const link = `/uploads/${newFilename}`;
        links.push(link);
        
        console.log(`Link generado: ${link}`);

        // Limpiar archivo temporal
        try {
          fs.unlinkSync(file.path);
          console.log(` Archivo temporal eliminado: ${file.path}`);
        } catch (unlinkError) {
          console.warn(` No se pudo eliminar archivo temporal: ${unlinkError.message}`);
        }

      } catch (fileError) {
        console.error(` Error procesando archivo ${file.originalFilename}:`, fileError);
        errors.push(`Error subiendo ${file.originalFilename}: ${fileError.message}`);
        
        // Intentar limpiar archivo temporal en caso de error
        try {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        } catch (cleanupError) {
          console.warn(' Error limpiando archivo temporal:', cleanupError);
        }
      }
    }

    console.log('Resultado del upload:');
    console.log(` Archivos exitosos: ${links.length}`);
    console.log(` Errores: ${errors.length}`);
    console.log(' Links generados:', links);

    if (links.length === 0 && errors.length > 0) {
      console.log(' Todos los archivos fallaron');
      return res.status(400).json({ 
        error: 'Todos los archivos fallaron al subir',
        details: errors 
      });
    }

    const response = { links };
    if (errors.length > 0) {
      response.warnings = errors;
    }

    console.log(' Upload local completado exitosamente');
    return res.json(response);

  } catch (error) {
    console.error(' ERROR GENERAL EN UPLOAD LOCAL:', error);
    
    res.status(500).json({
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

export const config = {
  api: { 
    bodyParser: false,
  },
};