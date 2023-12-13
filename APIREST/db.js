// desestructuración {}
import {createPool} from 'mysql2/promise'; 

export const conn = createPool({
  host: 'localhost',
  user: 'root',
  password: 'Isaachm31_22',
  port: 3306,
  database: 'Proyecto'
});

try {
    await conn.query('SELECT 1'); // Intenta realizar una consulta sencilla
    console.log('Conexión exitosa a la base de datos');
  } catch (error) {
    console.error('Error en la conexión a la base de datos:', error);
  }