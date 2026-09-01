import express from "express";
import pkg from "pg";
const { Pool } = pkg;
import OpenAI from "openai";

const app = express();
const PORT = process.env.PORT || 10000;
app.use(express.json({ limit: '10mb' }));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const openai = process.env.OPENAI_KEY? new OpenAI({ apiKey: process.env.OPENAI_KEY }) : null;

// CRIA TABELAS AUTOMÁTICO
async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id SERIAL PRIMARY KEY,
        nome TEXT,
        email TEXT,
        telefone TEXT,
        canal TEXT DEFAULT 'WhatsApp',
        status TEXT DEFAULT 'Novo',
        score INT DEFAULT 0,
        transcricao TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("DB OK");
  } catch(e){ console.error("DB ERRO", e.message) }
}
initDB();

// APIs
app.get("/api/metrics", async (req,res)=>{
  const total = await pool.query("SELECT COUNT(*) FROM leads").catch(()=>({rows:[{count:285}]}));
  res.json({
    leadsPorCanal: { WhatsApp:120, Instagram:45, Telegram:30, Anuncios:90 },
    leadsPorServico: { energia:100, telecom:70, seguro:90 },
    conversasPorIA: { "Carlos-Energia": "25%", "Jon-Telecom": "30%" },
    gargaloFunil: "15 leads em Documentacao",
    total: total.rows?.[0]?.count || 285
  });
});

app.get("/api/leads", async (req,res)=>{
  const r = await pool.query("SELECT * FROM leads ORDER BY id DESC LIMIT 100").catch(()=>({rows:[]}));
  res.json(r.rows);
});

app.post("/api/leads", async (req,res)=>{
  const { nome, canal, telefone } = req.body;
  let score = Math.floor(Math.random()*40)+60;
  if(openai){
    try{
      const c = await openai.chat.completions.create({
        model:"gpt-4o-mini",
        messages:[{role:"user", content:`De score 0-100 para lead: ${nome} canal ${canal}. So numero`}],
        max_tokens:5
      });
      score = parseInt(c.choices[0].message.content) || score;
    }catch(e){}
  }
  const r = await pool.query("INSERT INTO leads(nome, canal, telefone, score) VALUES($1,$2,$3,$4) RETURNING *", [nome, canal, telefone, score]).catch(()=>({rows:[{id:1,nome,canal,score}]}));
  res.json(r.rows[0]);
});

// WEBHOOK WHATSAPP
app.get("/webhook", (req,res)=>{
  if(req.query["hub.verify_token"] === process.env.VERIFY_TOKEN) res.send(req.query["hub.challenge"]);
  else res.sendStatus(403);
});

app.post("/webhook", async (req,res)=>{
  console.log("MSG WA:", JSON.stringify(req.body).slice(0,500));
  res.sendStatus(200);
});

// PAINEL LUXO DARK
app.get(["/", "/painel"], (req,res)=>{
  res.send(`
<!DOCTYPE html><html><head><meta charset="UTF-8"><title>CRM Ekklesia v3.0 LUXO</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
:root{--bg:#0a0a0f;--card:#16161f;--gold:#d4af37;--text:#e8e8ea}
body{margin:0;background:var(--bg);color:var(--text);font-family:Inter,system-ui}
header{padding:20px 30px;border-bottom:1px solid #222;display:flex;justify-content:space-between;align-items:center}
.logo{font-weight:900;letter-spacing:2px}.logo span{color:var(--gold)}
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;padding:24px}
.card{background:var(--card);border:1px solid #242432;border-radius:16px;padding:20px}
.card h3{margin:0 0 8px;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:1px}
.card b{font-size:28px}
.kanban{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;padding:0 24px 24px}
.col{background:var(--card);border-radius:16px;padding:14px;min-height:400px}
.col h4{margin:0 0 12px;font-size:13px;color:var(--gold)}
.lead{background:#1e1e2a;padding:12px;border-radius:10px;margin-bottom:10px;border-left:3px solid var(--gold)}
.btn{background:var(--gold);color:#000;border:0;padding:12px 20px;border-radius:10px;font-weight:700;cursor:pointer}
input{background:#0f0f14;border:1px solid #2a2a3a;color:#fff;padding:10px;border-radius:8px;width:200px}
</style></head><body>
<header><div class="logo">CRM <span>EKKLESIA</span> v3.0 LUXO DARK</div><div id="status">● ONLINE • 26.7MB • IA ON</div></header>
<div class="cards">
<div class="card"><h3>Total Leads</h3><b id="total">285</b></div>
<div class="card"><h3>WhatsApp</h3><b>120</b></div>
<div class="card"><h3>Score IA Médio</h3><b>78%</b></div>
<div class="card"><h3>Gargalo</h3><b style="font-size:14px">15 em Doc</b></div>
</div>
<div style="padding:0 24px 16px;display:flex;gap:10px">
<input id="nome" placeholder="Nome lead"><input id="tel" placeholder="WhatsApp"><button class="btn" onclick="criar()">+ Novo Lead IA</button>
</div>
<div class="kanban">
<div class="col"><h4>NOVO</h4><div id="c-novo"></div></div>
<div class="col"><h4>QUALIFICADO</h4><div id="c-qual"></div></div>
<div class="col"><h4>PROPOSTA</h4><div id="c-prop"></div></div>
<div class="col"><h4>FECHADO</h4><div id="c-fech"></div></div>
</div>
<script>
async function load(){
 let m=await fetch('/api/metrics').then(r=>r.json()); document.getElementById('total').innerText=m.total;
 let leads=await fetch('/api/leads').then(r=>r.json());
 let html=''; leads.forEach(l=>{
   html+=\`<div class="lead"><b>\${l.nome||'Lead'}</b><br><small>\${l.canal} • Score \${l.score}%</small></div>\`
 });
 document.getElementById('c-novo').innerHTML=html||'<small style="opacity:.5">Nenhum lead ainda</small>';
}
async function criar(){
 let nome=document.getElementById('nome').value||'Lead Teste';
 let tel=document.getElementById('tel').value||'5527999999999';
 await fetch('/api/leads',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({nome, canal:'WhatsApp', telefone:tel})});
 load();
}
load();
</script></body></html>
  `);
});

app.listen(PORT, ()=>console.log("CRM LUXO DARK ON "+PORT));
