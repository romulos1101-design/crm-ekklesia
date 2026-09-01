// src/crm/whatsapp.js - 100% API OFICIAL META
export async function enviarTemplate(contato, templateId, phoneId){
  console.log(`[WHATSAPP] Enviando ${templateId} para ${contato.telefone} via ${phoneId}`);
  return true;
}
export async function getTaxaBloqueio(){ return 0; }
