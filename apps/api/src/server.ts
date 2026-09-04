import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()
const app = Fastify({ logger: true })
await app.register(cors, { origin: true })
await app.register(jwt, { secret: process.env.JWT_SECRET || 'ekklesia-secret' })

app.decorateRequest('tenant', null)
app.decorateRequest('user', null)

app.addHook('onRequest', async (req:any) => {
  const h = req.headers.authorization
  if(h){ try{ const d:any = app.jwt.verify(h.replace('Bearer ','')); req.user=d; req.tenant={ organizationId: d.organizationId } }catch{} }
})

app.get('/health', async()=>({ok:true}))

app.post('/api/v1/auth/login', async (req:any, reply) => {
  const {email, password} = req.body
  const user = await prisma.user.findUnique({where:{email}})
  if(!user) return reply.code(401).send({error:'Inválido'})
  const ok = await bcrypt.compare(password, user.passwordHash)
  if(!ok) return reply.code(401).send({error:'Inválido'})
  const token = app.jwt.sign({id:user.id, email:user.email, organizationId:user.organizationId, role:user.role, isMaster:user.isMaster},{expiresIn:'7d'})
  return {token, user}
})

// MASTER
app.get('/api/v1/master/organizations', async (req:any, reply) => {
  if(!req.user?.isMaster) return reply.code(403).send({error:'Só MASTER'})
  return prisma.organization.findMany({include:{plan:true, _count:{select:{users:true, leads:true}}}})
})

// CRM - FASE 2
app.get('/api/v1/pipelines', async (req:any) => {
  return prisma.pipeline.findMany({where:{organizationId:req.tenant.organizationId}, include:{stages:{orderBy:{order:'asc'}},}})
})
app.post('/api/v1/pipelines', async (req:any) => {
  const {name, stages} = req.body // stages: ["NOVO","CONTATO","PROPOSTA","FECHADO"]
  const pipeline = await prisma.pipeline.create({data:{name, organizationId:req.tenant.organizationId}})
  for(let i=0;i<stages.length;i++){
    await prisma.pipelineStage.create({data:{pipelineId:pipeline.id, name:stages[i], order:i}})
  }
  return pipeline
})

app.get('/api/v1/leads', async (req:any) => {
  return prisma.lead.findMany({where:{organizationId:req.tenant.organizationId}, include:{contact:true, stage:true}, orderBy:{createdAt:'desc'}})
})
app.post('/api/v1/leads', async (req:any) => {
  const {title, contactId, stageId, value} = req.body
  return prisma.lead.create({data:{title, contactId, stageId, value, organizationId:req.tenant.organizationId}})
})
app.patch('/api/v1/leads/:id/move', async (req:any) => {
  const {stageId} = req.body
  return prisma.lead.update({where:{id:req.params.id}, data:{stageId}})
})

app.listen({port: 3333, host:'0.0.0.0'})
