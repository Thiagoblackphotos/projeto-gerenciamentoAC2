require('dotenv').config();
const express = require('express');
const connectDB = require('./src/config/database');
const projetoRoutes = require('./src/routes/projetoRoutes');

const app = express();
app.use(express.json()); // Importante para ler JSON no body

connectDB(); // Conecta ao banco

app.use('/projetos', projetoRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});