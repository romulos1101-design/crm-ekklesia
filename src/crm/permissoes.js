// src/crm/permissoes.js - PRIVACIDADE TOTAL - SÓ VOCÊ VÊ TUDO
import { db } from './db.js';
export const PERMISSOES = {
  SUPER_ADMIN: 'romulos1101@gmail.com',
  verificarAcesso: (userEmail, recurso) => {
    if(userEmail === 'romulos1101@gmail.com') return true;
    const permissao = db.getPermissao(userEmail, recurso);
    return permissao?.liberado || false;
  },
  conceder: async ({emailEquipe, servicos, funil, dashboard}) => {
    await db.savePermissao({emailEquipe, servicos, funil, dashboard, concedidoPor: 'romulos1101@gmail.com'});
  }
};
