// src/crm/dashboard-metricas.js - MÉTRICAS DO SUPER ADMIN
import { db } from './db.js';
export async function getDashboard(superAdminEmail) {
  if(superAdminEmail !== 'romulos1101@gmail.com') throw new Error('Acesso negado - só Super Admin');
  return {
    leadsPorCanal: { whatsapp: 120, instagram: 45, telegram: 30, google_ads: 80 },
    leadsPorServico: { energia: 100, telecom: 70, seguro: 50 },
    conversaoPorIA: { 'Carlos-Energia': '32%', 'Ana-Telecom': '28%' },
    gargaloFunil: '15 leads parados em Documentação - melhorar explicação',
    tempoMedio: '4min 32s',
    taxaResposta: '68%',
    atendimentosAoVivo: await db.getAoVivo(),
    totalContatos: (await db.getTodosOptIn()).length
  };
}
