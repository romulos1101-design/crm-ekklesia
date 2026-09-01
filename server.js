const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');
const app = express();
app.use(cors()); app.use(express.json());
app.use(express.static(path.join(__dirname)));

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

function calcularScoreIA(nome, whatsapp){
  let score = 65;
  const n = nome.toLowerCase();
  if(n.includes('igreja') || n.includes('ltda') || n.includes('pastor') || n.includes('ekklesia')) score += 25;
  if(whatsapp && whatsapp.length >= 11) score += 10;
  if(whatsapp && whatsapp.startsWith('27')) score += 5;
  if(n.length < 4) score -= 20;
  return Math.min(98, Math.max(15, score));
}

app.get('/api/leads', async (req,res)=>{
  try{ const r = await pool.query('SELECT * FROM leads ORDER BY id DESC'); res.json(r.rows); }catch(e){ res.status(500).json({error:e.message}) }
});

app.post('/api/leads', async (req,res)=>{
  const { nome, whatsapp, observacao='', valor=0 } = req.body;
  if(!nome ||!whatsapp) return res.status(400).json({error:'nome e whatsapp obrigatorio'});
  const score_ia = calcularScoreIA(nome, whatsapp);
  try{
    const r = await pool.query('INSERT INTO leads (nome, whatsapp, status, score_ia, observacao, valor) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *', [nome, whatsapp, 'novo', score_ia, observacao, valor]);
    res.json(r.rows[0]);
  }catch(e){ res.status(500).json({error:e.message}) }
});

app.patch('/api/leads/:id', async (req,res)=>{
  const { status, observacao, valor } = req.body;
  try{
    if(status) await pool.query('UPDATE leads SET status=$1 WHERE id=$2', [status, req.params.id]);
    if(observacao!== undefined) await pool.query('UPDATE leads SET observacao=$1 WHERE id=$2', [observacao, req.params.id]);
    if(valor!== undefined) await pool.query('UPDATE leads SET valor=$1 WHERE id=$2', [valor, req.params.id]);
    const r = await pool.query('SELECT * FROM leads WHERE id=$1', [req.params.id]);
    res.json(r.rows[0]);
  }catch(e){ res.status(500).json({error:e.message}) }
});

app.delete('/api/leads/:id', async (req,res)=>{
  try{ await pool.query('DELETE FROM leads WHERE id=$1', [req.params.id]); res.json({ok:true}); }catch(e){ res.status(500).json({error:e.message}) }
});

app.get('/', (req,res)=> res.sendFile(path.join(__dirname,'index.html')));
const PORT = process.env.PORT || 10000;
app.listen(PORT, ()=> console.log('CRM v3.4 PRO LIVE na porta '+PORT));
