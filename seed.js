require('dotenv').config();
const mongoose = require('mongoose');
const Projeto = require('./src/models/Projeto');

const projetosIniciais = [
  { 
    codigo: "PRJ001", 
    nome: "Desenvolvimento de Site", 
    tarefas: [
      { codigo: "TAR101", nome: "Criar layout", responsavel: "Ana" }, 
      { codigo: "TAR102", nome: "Desenvolver API", responsavel: "Carlos" }
    ] 
  },
  { 
    codigo: "PRJ002", 
    nome: "App Mobile", 
    tarefas: [
      { codigo: "TAR201", nome: "Tela de Login", responsavel: "Ana" }
    ] 
  },
  { 
    codigo: "PRJ003", 
    nome: "Migração de Dados", 
    tarefas: [] 
  }
];

mongoose.connect(process.env.MONGO_URI).then(async () => {
  await Projeto.deleteMany({}); // Limpa o banco antes de inserir
  await Projeto.insertMany(projetosIniciais);
  console.log('✅ Banco populado com sucesso!');
  process.exit();
}).catch(err => {
  console.error('Erro:', err);
  process.exit(1);
});