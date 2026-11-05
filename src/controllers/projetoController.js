const Projeto = require('../models/Projeto');

// 1. Listar todos (GET /projetos) - Suporta filtros ?nome= e ?tarefa=
exports.listarProjetos = async (req, res) => {
  try {
    const { nome, tarefa } = req.query;
    let filtro = {};

    if (nome) {
      // Pesquisa parcial e case-insensitive (ignora maiúscula/minúscula)
      filtro.nome = { $regex: nome, $options: 'i' };
    }
    if (tarefa) {
      // Filtra projetos que tenham uma tarefa com o código específico
      filtro['tarefas.codigo'] = tarefa;
    }

    const projetos = await Projeto.find(filtro);
    res.status(200).json(projetos);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao listar projetos' });
  }
};

// 2. Buscar por código (GET /projetos/:codigo)
exports.buscarProjeto = async (req, res) => {
  try {
    const projeto = await Projeto.findOne({ codigo: req.params.codigo });
    if (!projeto) return res.status(404).json({ erro: 'Projeto não encontrado' });
    res.status(200).json(projeto);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar projeto' });
  }
};

// 3. Cadastrar (POST /projetos)
exports.criarProjeto = async (req, res) => {
  try {
    const { codigo, nome, tarefas } = req.body;

    // Validação de campos obrigatórios
    if (!codigo || !nome) {
      return res.status(400).json({ erro: 'Código e nome são obrigatórios' });
    }

    // Verifica duplicidade de projeto
    const existe = await Projeto.findOne({ codigo });
    if (existe) return res.status(409).json({ erro: 'Código de projeto já cadastrado' });

    // Validação de tarefas duplicadas no array (se enviadas na criação)
    if (tarefas && tarefas.length > 0) {
      const codigosTarefas = tarefas.map(t => t.codigo);
      const temDuplicata = codigosTarefas.some((cod, index) => codigosTarefas.indexOf(cod) !== index);
      if (temDuplicata) return res.status(409).json({ erro: 'Códigos de tarefas duplicados no projeto' });
    }

    const novoProjeto = await Projeto.create({ codigo, nome, tarefas: tarefas || [] });
    res.status(201).json(novoProjeto);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao criar projeto' });
  }
};

// 4. Atualizar nome (PUT /projetos/:codigo) - Sem alterar tarefas
exports.atualizarProjeto = async (req, res) => {
  try {
    const { nome } = req.body;
    if (!nome) return res.status(400).json({ erro: 'O nome é obrigatório' });

    const projeto = await Projeto.findOneAndUpdate(
      { codigo: req.params.codigo },
      { nome },
      { new: true, runValidators: true }
    );

    if (!projeto) return res.status(404).json({ erro: 'Projeto não encontrado' });
    res.status(200).json(projeto);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao atualizar projeto' });
  }
};

// 5. Excluir (DELETE /projetos/:codigo)
exports.excluirProjeto = async (req, res) => {
  try {
    const projeto = await Projeto.findOneAndDelete({ codigo: req.params.codigo });
    if (!projeto) return res.status(404).json({ erro: 'Projeto não encontrado' });
    res.status(204).send(); // 204 No Content
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao excluir projeto' });
  }
};

// --- GERENCIAMENTO DE TAREFAS ---

// 6. Listar tarefas (GET /projetos/:codigo/tarefas)
exports.listarTarefas = async (req, res) => {
  try {
    const projeto = await Projeto.findOne({ codigo: req.params.codigo });
    if (!projeto) return res.status(404).json({ erro: 'Projeto não encontrado' });
    res.status(200).json(projeto.tarefas);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao listar tarefas' });
  }
};

// 7. Adicionar tarefa (POST /projetos/:codigo/tarefas)
exports.adicionarTarefa = async (req, res) => {
  try {
    const { codigo, nome, responsavel } = req.body;
    if (!codigo || !nome || !responsavel) {
      return res.status(400).json({ erro: 'Código, nome e responsável são obrigatórios' });
    }

    const projeto = await Projeto.findOne({ codigo: req.params.codigo });
    if (!projeto) return res.status(404).json({ erro: 'Projeto não encontrado' });

    // Verifica se a tarefa já existe no array do projeto
    const tarefaExiste = projeto.tarefas.some(t => t.codigo === codigo);
    if (tarefaExiste) return res.status(409).json({ erro: 'Código de tarefa já existe neste projeto' });

    projeto.tarefas.push({ codigo, nome, responsavel });
    await projeto.save();
    res.status(201).json(projeto);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao adicionar tarefa' });
  }
};

// 8. Atualizar tarefa (PUT /projetos/:codigo/tarefas/:codigoTarefa)
exports.atualizarTarefa = async (req, res) => {
  try {
    const { nome, responsavel } = req.body;
    const projeto = await Projeto.findOne({ codigo: req.params.codigo });
    if (!projeto) return res.status(404).json({ erro: 'Projeto não encontrado' });

    const tarefa = projeto.tarefas.find(t => t.codigo === req.params.codigoTarefa);
    if (!tarefa) return res.status(404).json({ erro: 'Tarefa não encontrada' });

    if (nome) tarefa.nome = nome;
    if (responsavel) tarefa.responsavel = responsavel;

    await projeto.save();
    res.status(200).json(projeto);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao atualizar tarefa' });
  }
};

// 9. Excluir tarefa (DELETE /projetos/:codigo/tarefas/:codigoTarefa)
exports.excluirTarefa = async (req, res) => {
  try {
    const projeto = await Projeto.findOne({ codigo: req.params.codigo });
    if (!projeto) return res.status(404).json({ erro: 'Projeto não encontrado' });

    const index = projeto.tarefas.findIndex(t => t.codigo === req.params.codigoTarefa);
    if (index === -1) return res.status(404).json({ erro: 'Tarefa não encontrada' });

    projeto.tarefas.splice(index, 1);
    await projeto.save();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao excluir tarefa' });
  }
};

// 10. Resumo (GET /projetos/:codigo/resumo)
exports.resumoProjeto = async (req, res) => {
  try {
    const projeto = await Projeto.findOne({ codigo: req.params.codigo });
    if (!projeto) return res.status(404).json({ erro: 'Projeto não encontrado' });

    // Extrai responsáveis únicos usando Set
    const responsaveis = [...new Set(projeto.tarefas.map(t => t.responsavel))];

    res.status(200).json({
      codigo: projeto.codigo,
      nome: projeto.nome,
      totalTarefas: projeto.tarefas.length,
      responsaveis: responsaveis
    });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao gerar resumo' });
  }
};