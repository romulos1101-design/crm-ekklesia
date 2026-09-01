import express from 'express';
const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.send(`<h1>CRM Ekklesia v2.4 - ONLINE!</h1><p>Super Admin: romulos1101@gmail.com</p><a href="/dashboard?email=romulos1101@gmail.com">Dashboard</a><br><a href="/health">Health</a>`);
});

app.get('/health', (req,res)=> res.send('OK'));

app.get('/dashboard', async (req,res)=>{
  console.log('Dashboard acessado por', req.query.email);
  if(req.query.email !== 'romulos1101@gmail.com'){
    return res.status(403).send('Acesso negado - so Super Admin');
  }
  try{
    const {getDashboard} = await import('./src/crm/dashboard-metricas.js');
    const dados = await getDashboard(req.query.email);
    res.json(dados);
  }catch(e){
    res.status(500).json({erro: e.message, dica: 'Verifique se src/crm/dashboard-metricas.js existe'});
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, ()=> console.log('CRM v2.4 FINAL na porta '+PORT));
