// Requires
var express = require('express');

// Varibles
var app = express();
var Hospital = require('../models/hospital');
var mdAutenticacion = require('../middlewares/autenticacion');

// =====================================
// Obtener todos los hospitales
// =====================================
app.get('/', (req, res) => {

	var desde = req.query.desde || 0;
   desde = Number(desde);

	Hospital.find({ })
		.skip(desde)
		.limit(5)
		.populate('usuario', 'nombre email')
      .exec( (err, hospitales) => {
         if( err ){
            return res.status(500).json({
               ok: false,
               mensaje: 'Error cargando los hospitales',
               errors: err
            });
			}
			
			Hospital.count({}, (err, conteo) => {
				res.status(200).json({
					ok: true,
					hospitales: hospitales,
					total: conteo
				});
			});

      });
});



// =====================================
// Crear un nuevo hospital
// =====================================
app.post('/', mdAutenticacion.verificaToken, ( req, res ) => {
   var body = req.body;
   
   var hospital = new Hospital({
      nombre: body.nombre,
      img: body.img,
      usuario: req.usuario._id,
   });

   hospital.save( (err, hospitalDB) => {
      if( err ){
         return res.status(400).json({
            ok: false,
            mensaje: 'Error al crear hospital',
            errors: err
         });
      }

      res.status(201).json({
        	ok: true,
			hospital: hospitalDB
      });
   });
});




// =====================================
// Actualizar hospital
// =====================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
	var id = req.params.id;
	var body = req.body;

	Hospital.findById(id, (err, hospital) => {
		// Verifico si no hay un error de base de datos
		if( err ){
         return res.status(500).json({
            ok: false,
            mensaje: 'Error al buscar hospital',
            errors: err
         });
		}
		
		// Verifico si existe un hospital con ese id
		if( !hospital ){
			return res.status(400).json({
            ok: false,
            mensaje: `El hospital con el id ${id} no existe`,
            errors: { message: 'No existe un hospital con ese ID' }
         });
		}

		hospital.nombre = body.nombre;
		hospital.img = body.img;

		hospital.save( (err, hospitalDB) => {
			if( err ){
				return res.status(400).json({
					ok: false,
					mensaje: 'Error al actualizar hospital',
					errors: err
				});
         }

			res.status(200).json({
				ok: true,
				hospital: hospitalDB
			});
		});
	});
});



// =====================================
// Borrar un hospital por el id
// =====================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
	var id = req.params.id;

	Hospital.findByIdAndRemove(id, (err, hospitalDB) => {
		if( err ){
         return res.status(500).json({
            ok: false,
            mensaje: 'Error al borrar hospital',
            errors: err
         });
		}

		if( !hospitalDB ){
         return res.status(400).json({
            ok: false,
            mensaje: 'No existe el id '+id,
            errors: {message: 'No existe un hospital con ese ID'}
         });
		}

		res.status(200).json({
			ok: true,
			hospital: hospitalDB
		});
   });
});



module.exports = app;
