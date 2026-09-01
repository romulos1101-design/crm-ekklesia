import express from "express";
const app = express();
const PORT = process.env.PORT || 10000;
app.use(express.json());

const metricas = {
  leadsPorCanal: { whatsapp: 120, instagram: 45, telegram: 30, google_ads: 90 },
  leadsPorServico: { energia: 100, telecom: 70, seguro: 90 },
  conversaoPorIA: { "Carlos-Energia": "25%", "Jun-Telecom": "28%" },
  gargaloFunil: "15 leads em Documentação",
  total: 285
};

app.get("/", (req,res)=> res.send("CRM v3.0 LUXO DARK ONLINE"));

app.get("/dashboard", (req,res)=>{
  const email = req.query.email || "romulos1101@gmail.com";
  res.send(`
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"><title>CRM Ekklesia v3.0 LUXO</title>
<style>
  :root{--bg:#0a0a0f;--card:#16161f;--azul:#2563eb;--text:#e2e8f0}
  .light{--bg:#f1f5f9;--card:#ffffff;--text:#0f172a}
  body{background:var(--bg);color:var(--text);font-family:Inter,Arial;margin:0;padding:20px;transition:0.3s}
  .header{display:flex;justify-content:space-between;align-items:center;background:linear-gradient(90deg,#0f172a,#1e3a8a);padding:20px;border-radius:16px;color:white}
  .toggle{padding:10px 18px;border-radius:20px;border:none;background:#fff;color:#000;cursor:pointer;font-weight:bold}
  .kanban{display:grid;grid-template-columns:repeat(4,1fr);gap:15px;margin-top:20px}
  .coluna{background:var(--card);border-radius:16px;padding:15px;min-height:400px;border:1px solid #1e293b}
  .coluna h3{border-bottom:2px solid var(--azul);padding-bottom:8px}
  .card{background:var(--bg);padding:12px;margin:10px 0;border-radius:10px;border-left:4px solid var(--azul);cursor:pointer}
  .card:hover{transform:scale(1.02)}
  .whatsapp-editor{margin-top:30px;background:var(--card);padding:20px;border-radius:16px}
  input,textarea{width:100%;padding:10px;margin:5px 0;border-radius:8px;border:1px solid #334155;background:var(--bg);color:var(--text)}
  button.btn{background:var(--azul);color:white;padding:12px;border:none;border-radius:8px;font-weight:bold;cursor:pointer;width:100%}
</style>
</head>
<body class="dark" id="body">
  <div class="header">
    <div><h1>💎 CRM Ekklesia v3.0 - LUXO DARK</h1><small>${email} | ${metricas.total} contatos</small></div>
    <button class="toggle" onclick="toggle()">🌗 Claro/Escuro</button>
  </div>

  <div class="kanban">
    <div class="coluna"><h3>📱 WhatsApp - 120</h3><div class="card">Lead #001 - João - Energia</div><div class="card">Lead #002 - Maria - Seguro</div><div class="card"><button class="btn" onclick="location.href='/api/disparo?etiqueta=WhatsApp'">🚀 Disparar p/ WhatsApp</button></div></div>
    <div class="coluna"><h3>📸 Instagram - 45</h3><div class="card">Lead #121 - Pedro</div><div class="card">Lead #122 - Ana</div></div>
    <div class="coluna"><h3>⚡ Energia Solar - 100</h3><div class="card">Carlos - 25% conv</div><div class="card"><button class="btn" onclick="location.href='/api/disparo?etiqueta=Energia Solar'">⚡ Disparar Energia</button></div></div>
    <div class="coluna"><h3>🚨 Gargalo - 15</h3><div class="card" style="border-left:4px solid orange">${metricas.gargaloFunil}</div><div class="card">🔴 6 ao vivo</div><div class="card">⏱️ +32s tempo médio</div></div>
  </div>

  <div class="whatsapp-editor">
    <h3>🛠️ Editar WhatsApp / Mensagens</h3>
    <label>Mensagem Padrão:</label><textarea id="msg">Olá {nome}, temos uma condição especial de Energia Solar pra você! ☀️</textarea>
    <label>Etiqueta:</label><input id="etiqueta" value="Energia Solar">
    <button class="btn" onclick="disparar()">🚀 ENVIAR DISPARO AGORA</button>
    <p id="status"></p>
  </div>

<script>
function toggle(){document.getElementById('body').classList.toggle('light')}
function disparar(){
  const et = document.getElementById('etiqueta').value;
  const msg = document.getElementById('msg').value;
  fetch('/api/disparo?etiqueta='+encodeURIComponent(et)+'&mensagem='+encodeURIComponent(msg))
  .then(r=>r.json()).then(d=>{document.getElementById('status').innerHTML='✅ Enviados: '+d.enviados+' p/ '+d.etiqueta});
}
</script>
</body>
</html>`);
});

app.get("/api/disparo", (req,res)=>{
  const {etiqueta, mensagem} = req.query;
  res.json({sucesso:true,etiqueta:etiqueta||"Geral",mensagem:mensagem||"Padrão",enviados: metricas.leadsPorServico.energia || 100,status:"Disparo agendado - MODO LUXO"});
});

app.listen(PORT, ()=> console.log("CRM v3.0 LUXO na porta "+PORT));
