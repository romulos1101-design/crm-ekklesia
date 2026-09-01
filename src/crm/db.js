// src/crm/db.js - Banco temporário em memória
const store = { contatos: [], servicos: [], permissoes: [] };
export const db = {
  getTodosOptIn: async () => store.contatos.filter(c=>c.optin==='SIM'),
  getPorEtiqueta: async (etq) => store.contatos.filter(c=>c.etiquetas?.includes(etq)),
  getFunilPorServico: async (s) => store.servicos.find(x=>x.nome===s)?.funil || [],
  saveServico: async (d) => { store.servicos.push(d); },
  listarServicos: async () => store.servicos,
  savePermissao: async (d) => { store.permissoes.push(d); },
  getPermissao: (email, rec) => store.permissoes.find(p=>p.emailEquipe===email),
  getAoVivo: async () => 0
};
