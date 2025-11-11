import { Pool } from 'pg'

if (!process.env.DATABASE_URL) {
  throw new Error('Invalid/Missing environment variable: "DATABASE_URL"')
}

const config = {
  connectionString: process.env.DATABASE_URL,
  // Configuración adicional para mejor performance
  max: 20, // máximo de conexiones en el pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
}

let pool;
let poolPromise;

if (process.env.NODE_ENV === 'development') {
  // En desarrollo, usa una variable global para preservar el pool
  if (!global._postgresPool) {
    pool = new Pool(config)
    global._postgresPool = pool
  }
  poolPromise = global._postgresPool
} else {
  // En producción, crea un nuevo pool
  pool = new Pool(config)
  poolPromise = pool
}

// Función para obtener una conexión del pool
export async function getConnection() {
  const client = await poolPromise.connect()
  return client
}

// Función para ejecutar queries simples
export async function query(text, params) {
  const client = await poolPromise.connect()
  try {
    const result = await client.query(text, params)
    return result
  } finally {
    client.release()
  }
}

// Exporta el pool para uso directo si es necesario
export default poolPromise