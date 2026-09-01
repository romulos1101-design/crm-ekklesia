// src/crm/servicos-funis.js - SERVIÇOS ILIMITADOS
import { db } from './db.js';
export const SERVICOS = {
  criarServico: async ({nome, funil}) => {
    await db.saveServico({nome, funil, criadoPor: 'romulos1101@gmail.com', criadoEm: new Date()});
    return `Serviço ${nome} criado`;
  },
  getFunil: async (servico) => {
    return await db.getFunilPorServico(servico);
  },
  listar: async () => await db.listarServicos()
};
