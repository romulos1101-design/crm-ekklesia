import express from 'express';
const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.send(`
    <body style="background:#0b1120;color:white;font-family:sans-serif;padding:40px">
      <h1 style="color:#38bdf8">CRM EKKLESIA v2.4 FINAL - ONLINE</h1>
      <p>Super Admin: <b>romulos1101@gmail.com</b></p>
      <p>Servicos ilimitados: <b>ATIVOS</b></p>
      <p>Disparo: <b>PRONTO - 25 msgs/min + Rodizio 2 numeros</b></p>
      <p><a href="/dashboard?email=romulos1101@gmail.com" style="color:#38bdf8">Ver Dashboard</a></p>
      <p>Status: v2.4.0 OK - Commit: ${new Date().toLocaleString('pt-BR')}</p>
    </body>
  `);
});

app.get('/dashboard', async (req,res)=>{
  if(req.query.email !== 'romulos1101@gmail.com') return res.send('Acesso negado');
  const {getDashboard} = await import('./src/crm/dashboard-metricas.js');
  res.json(await getDashboard(req.query.email));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, ()=> console.log('CRM v2.4 FINAL na porta '+PORT));
