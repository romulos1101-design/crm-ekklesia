const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const OpenAI = require('openai');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// BANCO NEON
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// OPENAI - aceita os 2 nomes de variável
const openaiKey = process.env.OPENAI_API_KEY || process.env.OPENAI_KEY;
let openai = null;
if(openaiKey){
  openai = new OpenAI({ apiKey: openaiKey });
}

// CRIA TABELA SE NÃO EXISTIR
async function initDB(){
  try{
    await pool.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id SERIAL PRIMARY KEY,
        nome TEXT NOT NULL,
        whatsapp TEXT NOT NULL,
        status TEXT DEFAULT 'novo',
        score_ia INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("✅ Banco Neon conectado e tabela pronta");
  }catch(e){ console.error("Erro DB:", e.message); }
}
initDB();

// API - LISTAR LEADS
app.get('/api/leads', async (req,res)=>{
  try{
    const { rows } = await pool.query('SELECT * FROM leads ORDER BY created_at DESC');
    res.json(rows);
  }catch(e){ res.json([]); }
});

// API - STATS
app.get('/api/stats', async (req,res)=>{
  try{
    const total = await pool.query('SELECT COUNT(*) FROM leads');
    const media = await pool.query('SELECT AVG(score_ia) as avg FROM leads');
    const whats = await pool.query("SELECT COUNT(*) FROM leads WHERE status!= 'fechado'");
    const gargalo = await pool.query("SELECT COUNT(*) FROM leads WHERE status = 'proposta'");
    res.json({
      total: parseInt(total.rows[0].count),
      media: Math.round(media.rows[0].avg || 78),
      whatsapp: parseInt(whats.rows[0].count) || 0,
      gargalo: parseInt(gargalo.rows[0].count) || 0
    });
  }catch(e){
    res.json({ total: 0, media: 78, whatsapp: 0, gargalo: 0 });
  }
});

// API - CRIAR LEAD COM IA
app.post('/api/leads', async (req,res)=>{
  const { nome, whatsapp } = req.body;
  if(!nome ||!whatsapp) return res.status(400).json({error: "Falta dados"});

  let score = Math.floor(Math.random()*30)+65; // 65-95

  // Se tiver OpenAI, calcula score real
  if(openai){
    try{
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{role:"user", content: `Dê uma nota de 0 a 100 para o lead: ${nome}, whatsapp ${whatsapp}. Responda só o número.`}]
      });
      const num = parseInt(completion.choices[0].message.content.replace(/\D/g,''));
      if(num) score = num;
    }catch(e){ console.log("IA fallback", e.message); }
  }

  try{
    const { rows } = await pool.query(
      'INSERT INTO leads (nome, whatsapp, score_ia, status) VALUES ($1,$2,$3,$4) RETURNING *',
      [nome, whatsapp, score, 'novo']
    );
    res.json(rows[0]);
  }catch(e){ res.status(500).json({error: e.message}); }
});

// API - MOVER STATUS
app.put('/api/leads/:id', async (req,res)=>{
  const { status } = req.body;
  try{
    const { rows } = await pool.query('UPDATE leads SET status=$1 WHERE id=$2 RETURNING *', [status, req.params.id]);
    res.json(rows[0]);
  }catch(e){ res.status(500).json({error:e.message}); }
});

app.get('/', (req,res)=> res.sendFile(path.join(__dirname, 'index.html')));

const PORT = process.env.PORT || 10000;
app.listen(PORT, ()=> console.log(`🚀 CRM v3.1 LUXO ON na porta ${PORT}`));
