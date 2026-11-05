const mongoose = require('mongoose');

const TarefaSchema = new mongoose.Schema({
  codigo: { type: String, required: true },
  nome: { type: String, required: true },
  responsavel: { type: String, required: true }
}, { _id: false });

const ProjetoSchema = new mongoose.Schema({
  codigo: { type: String, required: true, unique: true },
  nome: { type: String, required: true },
  tarefas: [TarefaSchema]
});

module.exports = mongoose.model('Projeto', ProjetoSchema);