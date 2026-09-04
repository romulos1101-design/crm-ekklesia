
import React from 'react'
import {createRoot} from 'react-dom/client'

function App(){
  const [leads,setLeads]=React.useState([])
  const [stages,setStages]=React.useState([{name:'NOVO'},{name:'CONTATO'},{name:'QUALIFICADO'},{name:'PROPOSTA'},{name:'FECHADO'}])

  return (
    <div className="p-6 bg-zinc-950 min-h-screen text-white">
      <h1 className="text-2xl font-bold">👑 Ekklésia CRM - Kanban</h1>
      <div className="flex gap-4 mt-6 overflow-x-auto">
        {stages.map(s=>(
          <div key={s.name} className="min-w-[280px] bg-zinc-900 rounded-xl p-3">
            <h3 className="font-bold mb-3">{s.name}</h3>
            <div className="space-y-2">
              <div className="bg-zinc-800 p-3 rounded">Lead exemplo - {s.name}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
createRoot(document.getElementById('root')).render(<App/>)
}
