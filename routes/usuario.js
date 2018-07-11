// Requires
var express = require('express');
var bcrypt = require('bcryptjs'); // encripta las contraseñas

// Varibles
var app = express();
var Usuario = require('../models/usuario');
var mdAutenticacion = require('../middlewares/autenticacion');


// =====================================
// Obtener todos los usuarios
// =====================================
app.get('/', (req, res) => {
   Usuario.find({ }, 'nombre email img role')
      .exec( (err, usuarios) => {
         if( err ){
            return res.status(500).json({
               ok: false,
               mensaje: 'Error cargando los usuarios',
               errors: err
            });
         }

         res.status(200).json({
            ok: true,
            usuarios: usuarios
         });
      });
});




// =====================================
// Crear un nuevo usuario
// =====================================
app.post('/', mdAutenticacion.verificaToken, ( req, res ) => {
   var body = req.body;
   
   var usuario = new Usuario({
      nombre: body.nombre,
      email: body.email,
      password: bcrypt.hashSync(body.password, 10),
      img: body.img,
      role: body.role
   });

   usuario.save( (err, usuarioDB) => {
      if( err ){
         return res.status(400).json({
            ok: false,
            mensaje: 'Error al crear usuario',
            errors: err
         });
      }

      res.status(201).json({
         ok: true,
			usuario: usuarioDB,
			usuarioToken: req.usuario
      });
   });

});


// =====================================
// Actualizar usuario
// =====================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
	var id = req.params.id;
	var body = req.body;

	Usuario.findById(id, (err, usuario) => {
		// Verifico si no hay un error de base de datos
		if( err ){
         return res.status(500).json({
            ok: false,
            mensaje: 'Error al buscar usuario',
            errors: err
         });
		}
		
		// Verifico si existe un usuario con ese id
		if( !usuario ){
			return res.status(400).json({
            ok: false,
            mensaje: `El usuario con el id ${id} no existe`,
            errors: { message: 'No existe un usuario con ese ID' }
         });
		}

		usuario.nombre = body.nombre;
		usuario.email = body.email;
		usuario.role = body.role;

		usuario.save( (err, usuarioDB) => {
			if( err ){
				return res.status(400).json({
					ok: false,
					mensaje: 'Error al actualizar usuario',
					errors: err
				});
			}

			usuario.password = ':)';

			res.status(200).json({
				ok: true,
				usuario: usuarioDB
			});
		});
	});
});


// =====================================
// Borrar un usuario por el id
// =====================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
	var id = req.params.id;

	Usuario.findByIdAndRemove(id, (err, usuarioDB) => {
		if( err ){
         return res.status(500).json({
            ok: false,
            mensaje: 'Error al borrar usuario',
            errors: err
         });
		}

		if( !usuarioDB ){
         return res.status(400).json({
            ok: false,
            mensaje: 'No existe el id '+id,
            errors: {message: 'No existe un usuario con ese ID'}
         });
		}

		res.status(200).json({
			ok: true,
			usuario: usuarioDB
		});
   });
});


module.exports = app;