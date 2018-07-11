// Requires
var express = require('express');

// Varibles
var app = express();
var Medico = require('../models/medico');
var mdAutenticacion = require('../middlewares/autenticacion');


// =====================================
// Obtener todos los medicos
// =====================================
app.get('/', (req, res) => {

  var desde = req.query.desde || 0;
  desde = Number(desde);

  Medico.find({ })
    	.skip(desde)
		.limit(5)
		.populate('usuario', 'nombre email')
		.populate('hospital')
      .exec( (err, medicos) => {
         if( err ){
            return res.status(500).json({
               ok: false,
               mensaje: 'Error cargando los medicos',
               errors: err
            });
         }

			Medico.count({}, (err, conteo) => {
				res.status(200).json({
					ok: true,
					medicos: medicos,
					total: conteo
				});
			});
      });
});



// =====================================
// Crear un nuevo medico
// =====================================
app.post('/', mdAutenticacion.verificaToken, ( req, res ) => {
   var body = req.body;
   
   var medico = new Medico({
      nombre: body.nombre,
      img: body.img,
      usuario: req.usuario._id,
      hospital: body.hospital
   });

   medico.save( (err, medicoDB) => {
      if( err ){
         return res.status(400).json({
            ok: false,
            mensaje: 'Error al crear medico',
            errors: err
         });
      }

      res.status(201).json({
         ok: true,
			medico: medicoDB
      });
   });
});



// =====================================
// Actualizar medico
// =====================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
	var id = req.params.id;
	var body = req.body;

	Medico.findById(id, (err, medico) => {
		// Verifico si no hay un error de base de datos
		if( err ){
         return res.status(500).json({
            ok: false,
            mensaje: 'Error al buscar medico',
            errors: err
         });
		}
		
		// Verifico si existe un medico con ese id
		if( !medico ){
			return res.status(400).json({
            ok: false,
            mensaje: `El medico con el id ${id} no existe`,
            errors: { message: 'No existe un medico con ese ID' }
         });
		}

		medico.nombre = body.nombre;
      medico.img = body.img;
      medico.hospital = body.hospital;

		medico.save( (err, medicoDB) => {
			if( err ){
				return res.status(400).json({
					ok: false,
					mensaje: 'Error al actualizar medico',
					errors: err
				});
         }

			res.status(200).json({
				ok: true,
				medico: medicoDB
			});
		});
	});
});



// =====================================
// Borrar un medico por el id
// =====================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
	var id = req.params.id;

	Medico.findByIdAndRemove(id, (err, medicoDB) => {
		if( err ){
         return res.status(500).json({
            ok: false,
            mensaje: 'Error al borrar medico',
            errors: err
         });
		}

		if( !medicoDB ){
         return res.status(400).json({
            ok: false,
            mensaje: 'No existe el id '+id,
            errors: {message: 'No existe un medico con ese ID'}
         });
		}

		res.status(200).json({
			ok: true,
			medico: medicoDB
		});
   });
});


module.exports = app;