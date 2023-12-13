import express from 'express';
import { conn } from '../db.js';
import { createHash } from 'crypto';

const app = express();

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true,
    })
);

// POST
app.post('/registro', async (req, res) => {
    const { username, useremail, userpasswd, userquestion, useranswer, userposition } = req.body;
    let hash = createHash("md5").update(userpasswd).digest("hex");
    let anshash = createHash("md5").update(useranswer).digest("hex");

    try {
        const [results] = await conn.execute('INSERT INTO Proyecto.usuario (username, useremail,userpasswd, userquestion,useranswer,userposition) VALUES (?, ?, ?,?,?,?)', [username, useremail, hash, userquestion, anshash, userposition]);
        
        console.log('Resultado de la inserción:', results);

        res.json(results);
    } catch (error) {
        console.error('Error al insertar usuario:', error);

        // Manejo del error de duplicación de entrada
        if (error.code === 'ER_DUP_ENTRY') {
            const match = error.sqlMessage.match(/Duplicate entry '(.+)' for key '.+'/);
            const duplicateValue = match && match[1];
            res.status(409).json({ msg: `El valor '${duplicateValue}' ya existe en la base de datos` });
        } else {
            res.status(500).json({ msg: 'Error al insertar usuario' });
        }
    }
});


app.post('/login', async (req, res) => {
    const { username, hash } = req.body;
    
    try {
        const [results] = await conn.execute('SELECT * FROM Proyecto.Usuario WHERE username = ?', [username]);


        if (results && results.length > 0) {
            
            if (results[0].userpasswd === hash) {
                res.json(results[0]);
            } else {
                res.status(401).json({ msg: 'Credenciales inválidas' });
            }
            
        } else {
            res.status(404).json({ msg: 'Usuario no encontrado' });
            res.json(results[0]);
        }

    } catch (error) {
        res.status(500).json({ msg: 'Error en el servidor' });
    }
});

// GET
app.get('/users', async (req, res) => {
    try {
        const [rows] = await conn.query('SELECT * FROM Proyecto.Usuario');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al obtener usuarios' });
    }
});



// PUT
app.put('/update', (req, res) => {
    const { id, nombre, edad } = req.body;

    conn.query('UPDATE tablausers SET nombre = ?, edad = ? WHERE id = ?', [nombre, edad, id], (error, results) => {
        if (error) {
            console.error(error);
            res.status(500).json({ msg: 'Error al actualizar usuario' });
        } else {
            res.json({ msg: 'Usuario actualizado exitosamente' });
        }
    });
});

// DELETE
app.delete('/eliminar', async (req, res) => {
    const { username } = req.query;


    try {
        const [results] = await conn.execute('DELETE FROM Proyecto.Usuario WHERE username = ?', [username]);
        console.log('Resultado de la eliminación:', results);

        res.json({ msg: 'Usuario eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({ msg: 'Error al eliminar usuario' });
    }
});

const PORT = process.env.PORT || 2000;

app.listen(PORT, () => {
    console.log(`Servidor en ejecución en el puerto ${PORT}`);
});
