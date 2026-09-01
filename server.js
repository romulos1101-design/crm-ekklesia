import express from "express";
const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());

// DADOS DO DASHBOARD
const metricas = {
  leadsPorCanal: { whatsapp: 120, instagram: 45, telegram: 30, google_ads: 90 },
  leadsPorServico: { energia: 100, telecom: 70, seguro: 90 },
  conversaoPorIA: { "Carlos-Energia": "25%", "Jun-Telecom": "28%" },
  gargaloFunil: "15 leads parados em Documentação - melhorar explicação",
  tempoMedio: "mais 32s",
  taxaResposta: "85%",
  atendimentoAoVivo: 6,
  totalContatos: 285
};

app.get("/", (req,res)=>{
  res.send("CRM Ekklesia v2.5 AZUL - ONLINE ✅ | Use /dashboard?email=seu@email.com");
});

app.get("/dashboard", (req,res)=>{
  const email = req.query.email || "romulos1101@gmail.com";
  const html = `
  <!DOCTYPE html>
  <html>
  <head><title>CRM Ekklesia - Dashboard</title>
  <meta charset="UTF-8">
  <style>
    body{font-family:Arial;background:#f0f4ff;margin:0;padding:20px}
    .header{background:#0d47a1;color:white;padding:20px;border-radius:12px}
    .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:15px;margin-top:20px}
    .card{background:white;padding:20px;border-radius:12px;box-shadow:0 4px 10px rgba(0,0,0,0.1);border-left:5px solid #0d47a1}
    .card h3{margin:0 0 10px 0;color:#0d47a1}
    .valor{font-size:28px;font-weight:bold;color:#1565c0}
    .alerta{background:#fff3e0;border-left:5px solid #ff9800}
    button{background:#0d47a1;color:white;border:none;padding:12px 20px;border-radius:8px;cursor:pointer;font-weight:bold}
  </style>
  </head>
  <body>
    <div class="header">
      <h1>🔵 CRM Ekklesia v2.5 - Dashboard Gerencial</h1>
      <p>Usuário: ${email} | Total: ${metricas.totalContatos} contatos</p>
    </div>
    <div class="grid">
      <div class="card"><h3>📱 WhatsApp</h3><div class="valor">${metricas.leadsPorCanal.whatsapp} leads</div></div>
      <div class="card"><h3>📸 Instagram</h3><div class="valor">${metricas.leadsPorCanal.instagram} leads</div></div>
      <div class="card"><h3>✈️ Telegram</h3><div class="valor">${metricas.leadsPorCanal.telegram} leads</div></div>
      <div class="card"><h3>🎯 Google Ads</h3><div class="valor">${metricas.leadsPorCanal.google_ads} leads</div></div>
      <div class="card"><h3>⚡ Energia Solar</h3><div class="valor">${metricas.leadsPorServico.energia} leads</div></div>
      <div class="card"><h3>📡 Telecom</h3><div class="valor">${metricas.leadsPorServico.telecom} leads</div></div>
      <div class="card"><h3>🛡️ Seguro</h3><div class="valor">${metricas.leadsPorServico.seguro} leads</div></div>
      <div class="card alerta"><h3>🚨 Gargalo do Funil</h3><div>${metricas.gargaloFunil}</div></div>
    </div>
    <div class="grid" style="margin-top:20px">
      <div class="card"><h3>🤖 Conversão IA</h3>Carlos: ${metricas.conversaoPorIA["Carlos-Energia"]} | Jun: ${metricas.conversaoPorIA["Jun-Telecom"]}</div>
      <div class="card"><h3>⏱️ Tempo Médio</h3><div class="valor">${metricas.tempoMedio}</div></div>
      <div class="card"><h3>💬 Taxa Resposta</h3><div class="valor">${metricas.taxaResposta}</div></div>
      <div class="card"><h3>🔴 Ao Vivo</h3><div class="valor">${metricas.atendimentoAoVivo} agentes</div></div>
    </div>
    <div style="margin-top:20px" class="card">
      <h3>🚀 Disparo em Massa por Etiqueta</h3>
      <p>Ex: /api/disparo?etiqueta=Energia%20Solar&mensagem=Promoção</p>
      <a href="/api/disparo?etiqueta=Energia Solar"><button>Testar Disparo Energia Solar</button></a>
    </div>
  </body>
  </html>
  `;
  res.send(html);
});

app.get("/api/disparo", (req,res)=>{
  const {etiqueta, mensagem} = req.query;
  if(!etiqueta) return res.status(400).json({erro:"Informe ?etiqueta=Energia Solar"});
  res.json({sucesso:true, etiqueta, mensagem: mensagem||"Mensagem padrão", enviados: metricas.leadsPorServico.energia, status:"Disparo agendado"});
});

app.listen(PORT, ()=> console.log(`CRM v2.5 AZUL na porta ${PORT}`));
