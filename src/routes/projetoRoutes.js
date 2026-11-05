const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/projetoController');

router.get('/', ctrl.listarProjetos);
router.post('/', ctrl.criarProjeto);
router.get('/:codigo/resumo', ctrl.resumoProjeto);
router.get('/:codigo/tarefas', ctrl.listarTarefas);
router.post('/:codigo/tarefas', ctrl.adicionarTarefa);
router.put('/:codigo/tarefas/:codigoTarefa', ctrl.atualizarTarefa);
router.delete('/:codigo/tarefas/:codigoTarefa', ctrl.excluirTarefa);
router.get('/:codigo', ctrl.buscarProjeto);
router.put('/:codigo', ctrl.atualizarProjeto);
router.delete('/:codigo', ctrl.excluirProjeto);

module.exports = router;