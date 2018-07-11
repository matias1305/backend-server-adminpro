// Requires
var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');

// Variables
var app = express();
var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

// default options
app.use(fileUpload());

app.put('/:tipo/:id', (req, res, next) => {

   var tipo = req.params.tipo;
   var id = req.params.id;

   // Tipos de coleccion
   var tiposValidos = ['hospitales', 'medicos', 'usuarios'];

   if( tiposValidos.indexOf(tipo) < 0 ){
      return res.status(400).json({
         ok: false,
         mensaje: 'Tipo de coleccion no valida',
         errors: {
            message: 'Tipo de coleccion no es valida'
         }
      });
   }

   if( !req.files ){
      return res.status(400).json({
         ok: false,
         mensaje: 'No selecciono una imagen',
         errors: {
            message: 'No selecciono ninguna imagen'
         }
      });
   }

   // Obtener nombre del archivo
   var archivo = req.files.imagen;
   var nombreCortado = archivo.name.split('.');
   var extensionArchivo = nombreCortado[ nombreCortado.length -1 ];

   // Solo estas extensiones aceptamos
   var extensionesValidas = ['png', 'jpg', 'gif', 'jpg', 'jpeg'];

   if( extensionesValidas.indexOf(extensionArchivo) < 0 ){
      return res.status(400).json({
         ok: false,
         mensaje: 'Extension no válida',
         errors: {
            message: 'Las extenciones validas son '+ extensionesValidas.join(', ')
         }
      });
   }

   // Nombre de archivo personalizado
   var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extensionArchivo }`;

   // Mover archivo del temporal a un PATH en especifico
   var path = `./uploads/${ tipo }/${ nombreArchivo }`;

   archivo.mv(path, err => {
      if( err ){
         return res.status(500).json({
            ok: false,
            mensaje: 'Error al mover archivo',
            errors: err
         });
      }

      subirPorTipo( tipo, id, nombreArchivo, res );
   });
});



function subirPorTipo( tipo, id, nombreArchivo, res ){
   if(tipo === 'usuarios'){
      Usuario.findById(id, (err, usuarioDB) => {
         if( !usuarioDB ){
            return res.status(400).json({
               ok: false,
               mensaje: 'El usuario ingresado no es valido',
               errors: err
            });
         }

         var pathViejo = './uploads/usuarios/'+usuarioDB.img;

         // Si existe elimina la imagen anterior
         if(fs.existsSync(pathViejo)){
            fs.unlink(pathViejo);
         }

         usuarioDB.img = nombreArchivo;

         usuarioDB.save( (err, usuarioActualizado) => {
            usuarioActualizado.password = ':)';
            return res.status(200).json({
               ok: true,
               mensaje: 'Imagen de usuario actualizada',
               usuario: usuarioActualizado
            });
         });
      });
   }

   if(tipo === 'medicos'){
      Medico.findById(id, (err, medicoDB) => {
         if( !medicoDB ){
            return res.status(400).json({
               ok: false,
               mensaje: 'El medico ingresado no es valido',
               errors: err
            });
         }

         var pathViejo = './uploads/medicos/'+medicoDB.img;

         // Si existe elimina la imagen anterior
         if(fs.existsSync(pathViejo)){
            fs.unlink(pathViejo);
         }

         medicoDB.img = nombreArchivo;

         medicoDB.save( (err, medicoActualizado) => {
            
            return res.status(200).json({
               ok: true,
               mensaje: 'Imagen de medico actualizada',
               medico: medicoActualizado
            });
         });
      });
   }

   if(tipo === 'hospitales'){
      Hospital.findById(id, (err, hospitalDB) => {
         if( !hospitalDB ){
            return res.status(400).json({
               ok: false,
               mensaje: 'El hospital ingresado no es valido',
               errors: err
            });
         }

         var pathViejo = './uploads/hospitales/'+hospitalDB.img;

         // Si existe elimina la imagen anterior
         if(fs.existsSync(pathViejo)){
            fs.unlink(pathViejo);
         }

         hospitalDB.img = nombreArchivo;

         hospitalDB.save( (err, hospitalActualizado) => {
            
            return res.status(200).json({
               ok: true,
               mensaje: 'Imagen del hospital actualizada',
               hospital: hospitalActualizado
            });
         });
      });
   }
}

module.exports = app;