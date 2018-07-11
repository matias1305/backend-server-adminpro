// Requires
var mongoose = require('mongoose');

// Variables
var Schema = mongoose.Schema;

var medicoSchema = new Schema({
   nombre: {
      type: String,
      required: [true, 'El nombre es necesario']
   },
   img: {
      type: String,
      required: false
   },
   usuario: {
      type: Schema.Types.ObjectId,
      ref: 'Usuario',
      required: [true, 'El usuario es necesario']
   },
   hospital: {
      type: Schema.Types.ObjectId,
      ref: 'Hospital',
      required: [true, 'El hospital es necesario']
   }
});


module.exports = mongoose.model('Medico', medicoSchema);