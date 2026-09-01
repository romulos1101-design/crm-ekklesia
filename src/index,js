import express from 'express';
const app = express();
app.get('/', (req,res)=> res.send('<h1>CRM Ekklesia v2.4 - ONLINE!</h1><p>Super Admin: romulos1101@gmail.com</p><p><a href=/health>Health</a></p>'));
app.get('/health', (req,res)=> res.json({status:'ok', versao:'2.4.0'}));
const PORT = process.env.PORT || 10000;
app.listen(PORT, ()=> console.log('Rodando na '+PORT));
