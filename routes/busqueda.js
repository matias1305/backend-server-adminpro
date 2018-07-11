// Requires
var express = require('express');

// Variables
var app = express();
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');



// =====================================
// Busqueda por coleccion
// =====================================
app.get('/coleccion/:tabla/:busqueda', (req, res) => {

   var tabla = req.params.tabla;
   var busqueda = req.params.busqueda;
   var regex = new RegExp(busqueda, 'i');

   switch( tabla ){
      case 'usuarios':
         buscarUsuario(regex).then( usuarios => {
            res.status(200).json({
               ok: true,
               usuarios: usuarios
            });
         });
      break;

      case 'hospitales':
         buscarHospitales(regex).then( hospitales => {
            res.status(200).json({
               ok: true,
               hospitales: hospitales
            });
         });
      break;

      case 'medicos':
         buscarMedicos(regex).then( medicos => {
            res.status(200).json({
               ok: true,
               medicos: medicos
            });
         });
      break;

      default:
         return res.status(200).json({
            ok: false,
            mensaje: 'Los tipos de busqueda solo son: hospitales, usuarios, medicos',
            errors: {
               message: 'Tipo de tabla/coleccion no valido'
            }
         });
   }
});




// =====================================
// Busqueda general
// =====================================
app.get('/todo/:busqueda', (req, res, next) => {

   var busqueda = req.params.busqueda;
   var regex = new RegExp(busqueda, 'i');

   Promise.all([
      buscarHospitales(regex),
      buscarMedicos(regex),
      buscarUsuario(regex)
   ]).then( respuestas => {
      res.status(200).json({
         ok: true,
         hospitales: respuestas[0],
         medicos: respuestas[1],
         usuarios: respuestas[2]
      });
   });   
});

function buscarHospitales( regex ){
   return new Promise( (resolve, reject) => {
      Hospital.find({nombre: regex})
         .populate('usuario', 'nombre email')
         .exec( (err, hospitales) => {
            if( err ){
               reject('Error al cargar hospitales');
            }else{
               resolve(hospitales);
            }
         });
      
   });
}

function buscarMedicos( regex ){
   return new Promise( (resolve, reject) => {
      Medico.find({nombre: regex})
         .populate('usuario', 'nombre email')
         .populate('hospital', 'nombre')
         .exec( (err, medicos) => {
            if( err ){
               reject('Error al cargar medicos');
            }else{
               resolve(medicos);
            }
         });
   });
}


function buscarUsuario( regex ){
   return new Promise( (resolve, reject) => {
      Usuario.find({}, 'nombre email role')
            .or([{'nombre': regex}, {'email': regex}])
            .exec( (err, usuarios) => {
               if( err ){
                  reject('Error al cargar usuarios');
               }
               resolve(usuarios);
            });
   });
}

module.exports = app;