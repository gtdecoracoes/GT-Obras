import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

const CORES_ALUMINIO = ["Branco","Preto","Fosco","Natural/Brilhante","Bronze","Champagne"];
const CORES_VIDRO = ["Incolor","Fumê","Verde","Boreal (canelado)","Espelhado"];

const CORES = ["#f97316","#3b82f6","#8b5cf6","#22c55e","#ec4899","#f59e0b","#14b8a6","#ef4444","#a855f7","#06b6d4"];

const PERFIS = [
  { id:"admin",        label:"Admin (Dono)",  icon:"👑", verValor:true,  gerenciar:true,  verRelatorio:true  },
  { id:"gestora",      label:"Gestora",       icon:"📋", verValor:true,  gerenciar:true,  verRelatorio:true  },
  { id:"funcionario",  label:"Funcionário",   icon:"👷", verValor:false, gerenciar:false, verRelatorio:false },
  { id:"terceirizado", label:"Terceirizado",  icon:"🔧", verValor:false, gerenciar:false, verRelatorio:false },
  { id:"medidor",      label:"Medidor",       icon:"📐", verValor:false, gerenciar:false, verRelatorio:false },
];

const TIPOS_INICIAL = ["Box de Banheiro","Espelho","Sacada/Varanda","Janela","Manutenção","Vidro Comum","Guarda-corpo","Porta de Vidro","Vidro Temperado","Cobertura de Vidro","Divisória","Outro"];

const STATUS_FLOW = [
  { id:"lead",       label:"Lead",             color:"#64748b", icon:"📞" },
  { id:"orcamento",  label:"Orçamento",        color:"#f59e0b", icon:"📋" },
  { id:"aprovado",   label:"Aprovado",         color:"#3b82f6", icon:"✅" },
  { id:"medicao",    label:"Medição",          color:"#8b5cf6", icon:"📐" },
  { id:"aguardando", label:"Aguard. Material", color:"#ec4899", icon:"📦" },
  { id:"execucao",   label:"Em Execução",      color:"#f97316", icon:"🔧" },
  { id:"pendente",   label:"Pendente/Revisão", color:"#ef4444", icon:"⚠️" },
  { id:"finalizado", label:"Finalizado",       color:"#22c55e", icon:"🏁" },
];

const EQUIPE_INICIAL = [
  { id:1, nome:"Gutemberg", funcao:"Dono",             perfil:"admin",        telefone:"", cor:"#f97316", ativo:true },
  { id:2, nome:"Gestora",   funcao:"Gestora de Obras", perfil:"gestora",      telefone:"", cor:"#8b5cf6", ativo:true },
  { id:3, nome:"Irani",     funcao:"Instalador",       perfil:"funcionario",  telefone:"", cor:"#3b82f6", ativo:true },
  { id:4, nome:"Juliano",   funcao:"Instalador",       perfil:"funcionario",  telefone:"", cor:"#22c55e", ativo:true },
  { id:5, nome:"Eduardo",   funcao:"Terceirizado",     perfil:"terceirizado", telefone:"", cor:"#ec4899", ativo:true },
];

const OBRAS_INICIAL = [
  {
    id:1, cliente:"Maria Fernanda", telefone:"(11) 99123-4567",
    endereco:"Rua das Flores, 234 – Moema, SP",
    tipo:"Box de Banheiro", status:"execucao", responsavelId:3, valor:2400,
    fornecedor:{ pendente:true, prazo:"22/05/2026", item:"Box temperado 8mm" },
    checklist:[
      {id:1,item:"Tirar medidas do banheiro",feito:true},
      {id:2,item:"Confirmar cor do perfil",feito:true},
      {id:3,item:"Instalar box",feito:false},
      {id:4,item:"Silicone e acabamento",feito:false},
    ],
    notas:"Cliente quer perfil preto fosco. Banheiro social.", dataCriacao:"2026-05-08"
  },
  {
    id:2, cliente:"Roberto Alves", telefone:"(11) 98765-3210",
    endereco:"Av. Paulista, 1000 – Bela Vista, SP",
    tipo:"Sacada/Varanda", status:"aguardando", responsavelId:4, valor:5800,
    fornecedor:{ pendente:true, prazo:"26/05/2026", item:"Vidro laminado 10mm" },
    checklist:[
      {id:1,item:"Vistoria técnica",feito:true},
      {id:2,item:"Solicitar vidro ao fornecedor",feito:true},
      {id:3,item:"Instalação",feito:false},
    ],
    notas:"Sacada 3,2m. Andar alto, precisa de andaime.", dataCriacao:"2026-05-05"
  },
  {
    id:3, cliente:"Ana Paula Costa", telefone:"(11) 91234-5678",
    endereco:"Rua Augusta, 555 – Consolação, SP",
    tipo:"Espelho", status:"finalizado", responsavelId:3, valor:890,
    fornecedor:{ pendente:false, prazo:"", item:"" },
    checklist:[
      {id:1,item:"Medir parede",feito:true},
      {id:2,item:"Instalar espelho",feito:true},
      {id:3,item:"Fixar moldura",feito:true},
    ],
    notas:"Espelho de corpo inteiro. Instalado com sucesso.", dataCriacao:"2026-04-28"
  },
  {
    id:4, cliente:"Carlos Mendes", telefone:"(11) 97654-3210",
    endereco:"Rua Oscar Freire, 78 – Jardins, SP",
    tipo:"Manutenção", status:"aprovado", responsavelId:4, valor:320,
    fornecedor:{ pendente:false, prazo:"", item:"" },
    checklist:[
      {id:1,item:"Diagnosticar problema",feito:false},
      {id:2,item:"Trocar borracha do box",feito:false},
    ],
    notas:"Box antigo com vazamento. Banheiro do quarto.", dataCriacao:"2026-05-14"
  },
];

const getSt  = (id) => STATUS_FLOW.find(s=>s.id===id) || STATUS_FLOW[0];
const nextSt = (id) => { const i=STATUS_FLOW.findIndex(s=>s.id===id); return i<STATUS_FLOW.length-1?STATUS_FLOW[i+1].id:id; };
const getP   = (id) => PERFIS.find(p=>p.id===id) || PERFIS[2];

function Av({ nome, cor, size=32 }) {
  const t=(nome||"?").split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase();
  return <div style={{width:size,height:size,borderRadius:"50%",background:cor||"#475569",color:"#fff",
    display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*.36,fontWeight:800,
    flexShrink:0,boxShadow:`0 2px 8px ${cor||"#475569"}55`}}>{t}</div>;
}

function Badge({ status }) {
  const s=getSt(status);
  return <span style={{background:s.color+"22",color:s.color,border:`1px solid ${s.color}55`,
    borderRadius:20,padding:"2px 10px",fontSize:11,fontWeight:700,whiteSpace:"nowrap"}}>{s.icon} {s.label}</span>;
}

const inp={width:"100%",background:"#1e293b",border:"1px solid #334155",borderRadius:10,
  color:"#e2e8f0",padding:"10px 14px",fontSize:14,boxSizing:"border-box",fontFamily:"inherit"};

function Lbl({ t, children }) {
  return <div><div style={{fontSize:10,color:"#64748b",letterSpacing:1,marginBottom:5,textTransform:"uppercase"}}>{t}</div>{children}</div>;
}

// ─── MODAL FUNCIONÁRIO ────────────────────────────────────────────────────────
function ModalFunc({ func, onClose, onSave, onDelete }) {
  const isEdit=!!func?.id;
  const [f,setF]=useState(func||{nome:"",funcao:"",perfil:"funcionario",telefone:"",cor:CORES[0],ativo:true});
  const s=(k,v)=>setF(p=>({...p,[k]:v}));
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:1200,
      display:"flex",alignItems:"center",justifyContent:"center",padding:16}}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:20,width:"100%",
        maxWidth:420,maxHeight:"90vh",overflow:"hidden",display:"flex",flexDirection:"column",
        boxShadow:"0 25px 60px rgba(0,0,0,0.7)"}}>
        <div style={{padding:"18px 22px",borderBottom:"1px solid #1e293b",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <h2 style={{margin:0,fontSize:16,fontWeight:800,color:"#f1f5f9"}}>{isEdit?"✏️ Editar Pessoa":"➕ Nova Pessoa"}</h2>
          <button onClick={onClose} style={{background:"#1e293b",border:"none",borderRadius:8,color:"#94a3b8",cursor:"pointer",padding:"6px 10px"}}>✕</button>
        </div>
        <div style={{padding:22,overflowY:"auto",display:"flex",flexDirection:"column",gap:14}}>
          <div style={{display:"flex",alignItems:"center",gap:14,background:"#1e293b",borderRadius:14,padding:14}}>
            <Av nome={f.nome||"?"} cor={f.cor} size={50}/>
            <div>
              <div style={{fontSize:15,fontWeight:800,color:"#f1f5f9"}}>{f.nome||"Nome da pessoa"}</div>
              <div style={{fontSize:12,color:"#64748b",marginTop:2}}>{getP(f.perfil).icon} {f.funcao||"Função"}</div>
            </div>
          </div>
          <Lbl t="Cor do Avatar">
            <div style={{display:"flex",gap:8,flexWrap:"wrap",paddingTop:4}}>
              {CORES.map(c=><div key={c} onClick={()=>s("cor",c)} style={{width:28,height:28,borderRadius:"50%",
                background:c,cursor:"pointer",border:f.cor===c?"3px solid #fff":"3px solid transparent",
                outline:f.cor===c?`2px solid ${c}`:"none",outlineOffset:2}}/>)}
            </div>
          </Lbl>
          <Lbl t="Nome *"><input value={f.nome} onChange={e=>s("nome",e.target.value)} placeholder="Ex: Eduardo Silva" style={inp}/></Lbl>
          <Lbl t="Função / Cargo"><input value={f.funcao} onChange={e=>s("funcao",e.target.value)} placeholder="Ex: Instalador, Medidor, Auxiliar..." style={inp}/></Lbl>
          <Lbl t="Perfil de Acesso">
            <select value={f.perfil} onChange={e=>s("perfil",e.target.value)} style={inp}>
              {PERFIS.map(p=><option key={p.id} value={p.id}>{p.icon} {p.label}</option>)}
            </select>
            <div style={{marginTop:8,background:"#0f172a",borderRadius:8,padding:"8px 12px",fontSize:12,
              color:f.perfil==="admin"?"#f59e0b":f.perfil==="gestora"?"#8b5cf6":f.perfil==="funcionario"?"#3b82f6":"#ec4899"}}>
              {f.perfil==="admin"&&"👑 Acesso total: valores, relatórios, cria e edita tudo"}
              {f.perfil==="gestora"&&"📋 Vê valores e relatórios, cria e edita obras"}
              {f.perfil==="funcionario"&&"👷 Vê só obras atribuídas — sem valores financeiros"}
              {f.perfil==="terceirizado"&&"🔧 Vê só obras atribuídas — sem valores financeiros"}
            </div>
          </Lbl>
          <Lbl t="Telefone / WhatsApp"><input value={f.telefone} onChange={e=>s("telefone",e.target.value)} placeholder="(11) 9xxxx-xxxx" style={inp}/></Lbl>
          <Lbl t="Status">
            <div style={{display:"flex",gap:8}}>
              {[true,false].map(v=>(
                <button key={String(v)} onClick={()=>s("ativo",v)} style={{flex:1,padding:"9px 0",borderRadius:10,
                  cursor:"pointer",fontWeight:700,fontSize:13,border:f.ativo===v?"none":"1px solid #334155",
                  background:f.ativo===v?(v?"#22c55e":"#ef4444"):"#1e293b",color:f.ativo===v?"#fff":"#64748b"}}>
                  {v?"✅ Ativo":"⛔ Inativo"}
                </button>
              ))}
            </div>
          </Lbl>
        </div>
        <div style={{padding:"14px 22px",borderTop:"1px solid #1e293b",display:"flex",gap:8}}>
          {isEdit&&<button onClick={()=>onDelete(func.id)} style={{background:"#7f1d1d",border:"none",
            borderRadius:10,color:"#fca5a5",cursor:"pointer",padding:"11px 16px",fontSize:13,fontWeight:700}}>🗑️</button>}
          <button onClick={()=>{if(f.nome.trim())onSave({...f,id:f.id||Date.now()});}} style={{flex:1,
            background:"linear-gradient(135deg,#f97316,#ea580c)",border:"none",borderRadius:10,
            color:"#fff",cursor:"pointer",padding:12,fontSize:14,fontWeight:800}}>
            {isEdit?"Salvar Alterações":"Adicionar à Equipe"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MODAL NOVA OBRA ──────────────────────────────────────────────────────────
function ModalNovaObra({ onClose, onCreate, equipe, tipos, setTipos }) {
  const ativos=equipe.filter(e=>e.ativo);
  const [novoTipo,setNovoTipo]=useState("");
  const [f,setF]=useState({cliente:"",telefone:"",endereco:"",tipo:tipos[0]||"Box de Banheiro",
    responsavelId:ativos[0]?.id||null,valor:"",notas:"",fornecedor:{pendente:false,prazo:"",item:""}});
  const s=(k,v)=>setF(p=>({...p,[k]:v}));
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",zIndex:1100,
      display:"flex",alignItems:"center",justifyContent:"center",padding:16}}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:20,width:"100%",
        maxWidth:500,maxHeight:"90vh",overflow:"hidden",display:"flex",flexDirection:"column",
        boxShadow:"0 25px 60px rgba(0,0,0,0.7)"}}>
        <div style={{padding:"18px 22px",borderBottom:"1px solid #1e293b",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <h2 style={{margin:0,fontSize:17,fontWeight:800,color:"#f1f5f9"}}>➕ Nova Obra / Cliente</h2>
          <button onClick={onClose} style={{background:"#1e293b",border:"none",borderRadius:8,color:"#94a3b8",cursor:"pointer",padding:"6px 10px"}}>✕</button>
        </div>
        <div style={{padding:22,overflowY:"auto",display:"flex",flexDirection:"column",gap:14}}>
          <Lbl t="Cliente *"><input value={f.cliente} onChange={e=>s("cliente",e.target.value)} placeholder="Nome do cliente" style={inp}/></Lbl>
          <Lbl t="Telefone"><input value={f.telefone} onChange={e=>s("telefone",e.target.value)} placeholder="(11) 9xxxx-xxxx" style={inp}/></Lbl>
          <Lbl t="Endereço"><input value={f.endereco} onChange={e=>s("endereco",e.target.value)} placeholder="Rua, número – bairro, cidade" style={inp}/></Lbl>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <Lbl t="Tipo de Serviço">
              <select value={f.tipo} onChange={e=>s("tipo",e.target.value)} style={inp}>
                {tipos.map(t=><option key={t}>{t}</option>)}
              </select>
            </Lbl>
            <Lbl t="Valor (R$)">
              <input type="number" value={f.valor} onChange={e=>s("valor",e.target.value)} placeholder="0" style={inp}/>
            </Lbl>
          </div>
          <Lbl t="Responsável">
            <select value={f.responsavelId} onChange={e=>s("responsavelId",Number(e.target.value))} style={inp}>
              {ativos.map(e=><option key={e.id} value={e.id}>{getP(e.perfil).icon} {e.nome} — {e.funcao}</option>)}
            </select>
          </Lbl>
          <Lbl t="Notas / Instruções para o técnico">
            <textarea value={f.notas} onChange={e=>s("notas",e.target.value)}
              placeholder="Instruções, observações, detalhes do serviço..."
              style={{...inp,minHeight:80,resize:"vertical"}}/>
          </Lbl>
          <div style={{background:"#1e293b",borderRadius:12,padding:14}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:f.fornecedor.pendente?12:0}}>
              <span style={{fontSize:13,fontWeight:700,color:"#e2e8f0"}}>📦 Tem pedido de fornecedor?</span>
              <button onClick={()=>s("fornecedor",{...f.fornecedor,pendente:!f.fornecedor.pendente})} style={{
                background:f.fornecedor.pendente?"#f97316":"#334155",border:"none",borderRadius:20,
                color:"#fff",cursor:"pointer",padding:"4px 14px",fontSize:12,fontWeight:700}}>
                {f.fornecedor.pendente?"Sim":"Não"}
              </button>
            </div>
            {f.fornecedor.pendente&&(
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                <input value={f.fornecedor.item} onChange={e=>s("fornecedor",{...f.fornecedor,item:e.target.value})}
                  placeholder="Item pedido (ex: Box temperado 8mm)" style={inp}/>
                <input value={f.fornecedor.prazo} onChange={e=>s("fornecedor",{...f.fornecedor,prazo:e.target.value})}
                  placeholder="Prazo de chegada (ex: 26/05/2026)" style={inp}/>
              </div>
            )}
          </div>
        </div>
        <div style={{padding:"14px 22px",borderTop:"1px solid #1e293b"}}>
          <button onClick={()=>{if(f.cliente.trim()){onCreate({...f,id:Date.now(),status:"lead",
            valor:Number(f.valor)||0,checklist:[],dataCriacao:new Date().toISOString().slice(0,10)});onClose();}}}
            style={{width:"100%",background:"linear-gradient(135deg,#f97316,#ea580c)",border:"none",
              borderRadius:12,color:"#fff",cursor:"pointer",padding:14,fontSize:15,fontWeight:800}}>
            Cadastrar Obra
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MODAL DETALHES DA OBRA ───────────────────────────────────────────────────
function ModalObra({ obra, onClose, onUpdate, onDelete, equipe, perfil }) {
  const [tab,setTab]=useState("info");
  const [notas,setNotas]=useState(obra.notas);
  const [checklist,setChecklist]=useState(obra.checklist);
  const [fotos,setFotos]=useState(obra.fotos||[]);
  const [novoItem,setNovoItem]=useState("");
  const s=getSt(obra.status);
  const p=getP(perfil);
  const resp=equipe.find(e=>e.id===obra.responsavelId);

  const toggleCheck=(id)=>{
    const u=checklist.map(c=>c.id===id?{...c,feito:!c.feito}:c);
    setChecklist(u);onUpdate({...obra,checklist:u});
  };
  const addItem=()=>{
    if(!novoItem.trim())return;
    const u=[...checklist,{id:Date.now(),item:novoItem,feito:false}];
    setChecklist(u);onUpdate({...obra,checklist:u});setNovoItem("");
  };
  const removeItem=(id)=>{
    const u=checklist.filter(c=>c.id!==id);
    setChecklist(u);onUpdate({...obra,checklist:u});
  };
  const addFotos=(files)=>{
    Array.from(files).forEach(file=>{
      const reader=new FileReader();
      reader.onload=(e)=>{
        setFotos(prev=>{
          const u=[...prev,{id:Date.now()+Math.random(),url:e.target.result,nome:file.name,data:new Date().toLocaleDateString("pt-BR")}];
          onUpdate({...obra,fotos:u,checklist,notas});
          return u;
        });
      };
      reader.readAsDataURL(file);
    });
  };
  const removeFoto=(id)=>{
    const u=fotos.filter(f=>f.id!==id);
    setFotos(u);onUpdate({...obra,fotos:u,checklist,notas});
  };

  const conc=checklist.filter(c=>c.feito).length;
  const prog=checklist.length?Math.round((conc/checklist.length)*100):0;

  const TABS=[
    {id:"info",label:"📋 Info"},
    {id:"checklist",label:"✅ Tarefas"},
    {id:"notas",label:"📝 Notas"},
    {id:"fotos",label:"📸 Fotos"+(fotos.length>0?" ("+fotos.length+")":"")},
    ...(p.gerenciar?[{id:"fornecedor",label:"📦 Fornecedor"}]:[]),
  ];

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",zIndex:1000,
      display:"flex",alignItems:"center",justifyContent:"center",padding:16}}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:20,width:"100%",
        maxWidth:580,maxHeight:"90vh",overflow:"hidden",display:"flex",flexDirection:"column",
        boxShadow:"0 25px 60px rgba(0,0,0,0.6)"}}>
        <div style={{padding:"18px 22px 0",borderBottom:"1px solid #1e293b"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
            <div>
              <div style={{fontSize:10,color:"#64748b",letterSpacing:1,marginBottom:3}}>
                #{String(obra.id).slice(-4).padStart(4,"0")} · {obra.dataCriacao}
              </div>
              <h2 style={{margin:0,fontSize:19,fontWeight:800,color:"#f1f5f9"}}>{obra.cliente}</h2>
              <div style={{fontSize:12,color:"#94a3b8",marginTop:2}}>{obra.tipo}</div>
            </div>
            <div style={{display:"flex",gap:8}}>
              {p.gerenciar&&<button onClick={()=>onDelete(obra.id)} style={{background:"#7f1d1d",border:"none",
                borderRadius:8,color:"#fca5a5",cursor:"pointer",padding:"6px 10px",fontSize:12}}>🗑️</button>}
              <button onClick={onClose} style={{background:"#1e293b",border:"none",borderRadius:8,color:"#94a3b8",cursor:"pointer",padding:"6px 10px"}}>✕</button>
            </div>
          </div>
          <div style={{display:"flex",gap:0,overflowX:"auto"}}>
            {TABS.map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)} style={{background:"transparent",border:"none",
                borderBottom:`2px solid ${tab===t.id?s.color:"transparent"}`,
                color:tab===t.id?s.color:"#64748b",cursor:"pointer",padding:"8px 14px",
                fontSize:12,fontWeight:700,whiteSpace:"nowrap"}}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{padding:22,overflowY:"auto",flex:1,display:"flex",flexDirection:"column",gap:12}}>

          {tab==="info"&&(
            <>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div style={{background:"#1e293b",borderRadius:12,padding:14,gridColumn:"span 2"}}>
                  <div style={{fontSize:10,color:"#64748b",letterSpacing:1,marginBottom:4}}>📍 ENDEREÇO</div>
                  <div style={{fontSize:13,color:"#e2e8f0",fontWeight:600}}>{obra.endereco||"—"}</div>
                </div>
                <div style={{background:"#1e293b",borderRadius:12,padding:14}}>
                  <div style={{fontSize:10,color:"#64748b",letterSpacing:1,marginBottom:4}}>📱 TELEFONE</div>
                  <div style={{fontSize:13,color:"#e2e8f0",fontWeight:600}}>{obra.telefone||"—"}</div>
                </div>
                <div style={{background:"#1e293b",borderRadius:12,padding:14}}>
                  <div style={{fontSize:10,color:"#64748b",letterSpacing:1,marginBottom:4}}>👷 RESPONSÁVEL</div>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginTop:4}}>
                    <Av nome={resp?.nome||"?"} cor={resp?.cor} size={24}/>
                    <div>
                      <div style={{fontSize:13,color:"#e2e8f0",fontWeight:600}}>{resp?.nome||"—"}</div>
                      <div style={{fontSize:10,color:"#64748b"}}>{resp?.funcao||""}</div>
                    </div>
                  </div>
                </div>
                {p.verValor&&(
                  <div style={{background:"linear-gradient(135deg,#14532d22,#052e1622)",
                    border:"1px solid #22c55e33",borderRadius:12,padding:14,gridColumn:"span 2"}}>
                    <div style={{fontSize:10,color:"#64748b",letterSpacing:1,marginBottom:4}}>💰 VALOR DA OBRA</div>
                    <div style={{fontSize:22,fontWeight:900,color:"#22c55e"}}>
                      R$ {(obra.valor||0).toLocaleString("pt-BR")}
                    </div>
                  </div>
                )}
              </div>
              <div style={{background:"#1e293b",borderRadius:12,padding:14}}>
                <div style={{fontSize:10,color:"#64748b",letterSpacing:1,marginBottom:8}}>STATUS</div>
                <Badge status={obra.status}/>
              </div>
              {p.gerenciar&&obra.status!=="finalizado"&&(
                <button onClick={()=>onUpdate({...obra,status:nextSt(obra.status)})} style={{
                  background:`linear-gradient(135deg,${s.color},${s.color}bb)`,border:"none",
                  borderRadius:12,color:"#fff",cursor:"pointer",padding:14,fontSize:14,fontWeight:800}}>
                  Avançar → {getSt(nextSt(obra.status)).label}
                </button>
              )}
              {p.gerenciar&&obra.status==="finalizado"&&(
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  <button onClick={()=>onUpdate({...obra,status:"pendente"})} style={{
                    background:"#450a0a",border:"1px solid #ef444433",borderRadius:12,color:"#fca5a5",
                    cursor:"pointer",padding:12,fontSize:13,fontWeight:700}}>
                    ⚠️ Marcar como Pendente / Precisa Revisão
                  </button>
                  <button onClick={()=>onUpdate({...obra,status:"execucao"})} style={{
                    background:"#1e293b",border:"1px solid #334155",borderRadius:12,color:"#94a3b8",
                    cursor:"pointer",padding:12,fontSize:13,fontWeight:700}}>
                    ↩️ Reabrir para Execução
                  </button>
                </div>
              )}
              {p.gerenciar&&obra.status==="pendente"&&(
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  <div style={{background:"#450a0a",border:"1px solid #ef444433",borderRadius:12,padding:14,
                    fontSize:13,color:"#fca5a5",fontWeight:600,lineHeight:1.5}}>
                    ⚠️ Obra marcada como Pendente — precisa de atenção antes de finalizar.
                  </div>
                  <button onClick={()=>onUpdate({...obra,status:"execucao"})} style={{
                    background:"linear-gradient(135deg,#f97316,#ea580c)",border:"none",borderRadius:12,
                    color:"#fff",cursor:"pointer",padding:12,fontSize:13,fontWeight:700}}>
                    🔧 Retornar para Execução
                  </button>
                  <button onClick={()=>onUpdate({...obra,status:"finalizado"})} style={{
                    background:"#14532d",border:"1px solid #22c55e44",borderRadius:12,color:"#86efac",
                    cursor:"pointer",padding:12,fontSize:13,fontWeight:700}}>
                    ✅ Resolver e Finalizar
                  </button>
                </div>
              )}
            </>
          )}

          {tab==="checklist"&&(
            <>
              <div style={{background:"#1e293b",borderRadius:8,overflow:"hidden"}}>
                <div style={{height:6,background:s.color,width:`${prog}%`,transition:"width .4s"}}/>
              </div>
              <div style={{fontSize:12,color:"#64748b",textAlign:"right"}}>
                {conc}/{checklist.length} concluídos ({prog}%)
              </div>
              {checklist.map(c=>(
                <div key={c.id} style={{display:"flex",alignItems:"center",gap:10,
                  background:c.feito?"#1e293b":"#0f172a",
                  border:`1px solid ${c.feito?"#22c55e33":"#1e293b"}`,
                  borderRadius:10,padding:"10px 14px"}}>
                  <div onClick={()=>toggleCheck(c.id)} style={{width:22,height:22,borderRadius:6,flexShrink:0,
                    background:c.feito?"#22c55e":"transparent",border:`2px solid ${c.feito?"#22c55e":"#334155"}`,
                    display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#fff",fontSize:13,fontWeight:800}}>
                    {c.feito?"✓":""}
                  </div>
                  <span style={{flex:1,fontSize:14,color:c.feito?"#64748b":"#e2e8f0",
                    textDecoration:c.feito?"line-through":"none"}}>{c.item}</span>
                  {p.gerenciar&&<button onClick={()=>removeItem(c.id)} style={{background:"transparent",
                    border:"none",color:"#475569",cursor:"pointer",fontSize:14,padding:"0 4px"}}>✕</button>}
                </div>
              ))}
              {checklist.length===0&&<div style={{textAlign:"center",color:"#475569",padding:24,fontSize:13}}>Nenhuma tarefa ainda</div>}
              {p.gerenciar&&(
                <div style={{display:"flex",gap:8}}>
                  <input value={novoItem} onChange={e=>setNovoItem(e.target.value)}
                    onKeyDown={e=>e.key==="Enter"&&addItem()} placeholder="Nova tarefa..." style={{...inp,flex:1}}/>
                  <button onClick={addItem} style={{background:s.color,border:"none",borderRadius:10,
                    color:"#fff",cursor:"pointer",padding:"10px 16px",fontWeight:800,fontSize:16}}>+</button>
                </div>
              )}
            </>
          )}

          {tab==="notas"&&(
            <>
              <textarea value={notas} onChange={e=>setNotas(e.target.value)} readOnly={!p.gerenciar}
                placeholder="Instruções para o técnico, observações, detalhes do serviço..."
                style={{...inp,minHeight:220,resize:"vertical"}}/>
              {p.gerenciar&&(
                <button onClick={()=>onUpdate({...obra,notas})} style={{
                  background:s.color,border:"none",borderRadius:10,color:"#fff",
                  cursor:"pointer",padding:"10px 20px",fontSize:14,fontWeight:700}}>
                  💾 Salvar Notas
                </button>
              )}
            </>
          )}

          {tab==="fotos"&&(
            <>
              {p.gerenciar&&(
                <label style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,
                  background:"#1e293b",border:"2px dashed #334155",borderRadius:14,padding:20,
                  cursor:"pointer",color:"#64748b",fontSize:14,fontWeight:600}}>
                  <input type="file" accept="image/*" multiple style={{display:"none"}}
                    onChange={e=>addFotos(e.target.files)}/>
                  📸 Toque para adicionar fotos
                </label>
              )}
              {fotos.length===0&&(
                <div style={{textAlign:"center",color:"#475569",padding:24,fontSize:13}}>
                  {p.gerenciar?"Nenhuma foto ainda — adicione acima":"Nenhuma foto cadastrada pelo responsável"}
                </div>
              )}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                {fotos.map(f=>(
                  <div key={f.id} style={{position:"relative",borderRadius:12,overflow:"hidden",
                    background:"#1e293b",aspectRatio:"4/3"}}>
                    <img src={f.url} alt={f.nome} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                    <div style={{position:"absolute",bottom:0,left:0,right:0,
                      background:"linear-gradient(transparent,rgba(0,0,0,0.7))",padding:"8px 10px"}}>
                      <div style={{fontSize:10,color:"#e2e8f0",fontWeight:600,
                        overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{f.nome}</div>
                      <div style={{fontSize:9,color:"#94a3b8"}}>{f.data}</div>
                    </div>
                    {p.gerenciar&&(
                      <button onClick={()=>removeFoto(f.id)} style={{position:"absolute",top:6,right:6,
                        background:"rgba(0,0,0,0.6)",border:"none",borderRadius:6,
                        color:"#fca5a5",cursor:"pointer",padding:"3px 7px",fontSize:12,fontWeight:700}}>✕</button>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {tab==="fornecedor"&&p.gerenciar&&(
            <>
              <div style={{background:obra.fornecedor.pendente?"#7c2d1222":"#14532d22",
                border:`1px solid ${obra.fornecedor.pendente?"#f9731644":"#22c55e44"}`,
                borderRadius:12,padding:16}}>
                <div style={{fontSize:13,fontWeight:700,color:obra.fornecedor.pendente?"#f97316":"#22c55e",
                  marginBottom:obra.fornecedor.pendente?12:0}}>
                  {obra.fornecedor.pendente?"⏳ Pendência de Fornecedor":"✅ Sem pendências de fornecedor"}
                </div>
                {obra.fornecedor.pendente&&(
                  <>
                    <div style={{fontSize:14,color:"#e2e8f0",marginBottom:6}}><b>Item:</b> {obra.fornecedor.item}</div>
                    <div style={{fontSize:14,color:"#e2e8f0"}}><b>Prazo:</b> {obra.fornecedor.prazo}</div>
                    <div style={{fontSize:11,color:"#64748b",marginTop:8}}>Prazo padrão: 10–12 dias úteis</div>
                  </>
                )}
              </div>
              {obra.fornecedor.pendente?(
                <button onClick={()=>onUpdate({...obra,fornecedor:{pendente:false,prazo:"",item:""}})} style={{
                  background:"#22c55e",border:"none",borderRadius:10,color:"#fff",
                  cursor:"pointer",padding:12,fontSize:14,fontWeight:700}}>
                  ✅ Material recebido — remover pendência
                </button>
              ):(
                <button onClick={()=>onUpdate({...obra,fornecedor:{pendente:true,prazo:"",item:""}})} style={{
                  background:"#1e293b",border:"1px solid #334155",borderRadius:10,color:"#94a3b8",
                  cursor:"pointer",padding:12,fontSize:13,fontWeight:700}}>
                  + Registrar pedido de fornecedor
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── FLUXO DO MEDIDOR ──────────────────────────────────────────────────────────
function novoItemVazio(){
  return {
    _key: Math.random().toString(36).slice(2),
    descricao:"", largura_mm:"", altura_mm:"",
    cor_aluminio: CORES_ALUMINIO[0], cor_vidro: CORES_VIDRO[0],
    observacoes:"", fotos:[], // fotos: [{file, preview}]
  };
}

function TelaMedicao({ tipos, onPedidoCriado }){
  const [pedido,setPedido]=useState({
    cliente_nome:"", cliente_telefone:"", endereco:"", bairro:"",
    ponto_referencia:"", tipo_servico: tipos[0]||"Box de Banheiro", observacoes:"",
  });
  const [itens,setItens]=useState([novoItemVazio()]);
  const [enviando,setEnviando]=useState(false);
  const [erro,setErro]=useState("");
  const [sucesso,setSucesso]=useState(null); // {numero}

  const sp=(k,v)=>setPedido(p=>({...p,[k]:v}));
  const setItem=(key,k,v)=>setItens(prev=>prev.map(i=>i._key===key?{...i,[k]:v}:i));
  const addItem=()=>setItens(prev=>[...prev,novoItemVazio()]);
  const rmItem=(key)=>setItens(prev=>prev.length>1?prev.filter(i=>i._key!==key):prev);

  const addFotos=(key,fileList)=>{
    const arr=Array.from(fileList).map(file=>({file,preview:URL.createObjectURL(file)}));
    setItens(prev=>prev.map(i=>i._key===key?{...i,fotos:[...i.fotos,...arr]}:i));
  };
  const rmFoto=(key,idx)=>{
    setItens(prev=>prev.map(i=>i._key===key?{...i,fotos:i.fotos.filter((_,ix)=>ix!==idx)}:i));
  };

  const validar=()=>{
    if(!pedido.cliente_nome.trim())return "Informe o nome do cliente";
    if(!pedido.endereco.trim())return "Informe o endereço";
    for(const it of itens){
      if(!it.descricao.trim())return "Descreva cada peça (ex: Box banheiro suíte)";
      if(!it.largura_mm||!it.altura_mm)return "Preencha largura e altura de cada peça";
    }
    return null;
  };

  const enviar=async()=>{
    const msg=validar();
    if(msg){setErro(msg);return;}
    setErro(""); setEnviando(true);
    try{
      // 1) cria o pedido
      const {data:pedidoRow, error:errPedido} = await supabase.from("pedidos").insert({
        cliente_nome: pedido.cliente_nome.trim(),
        cliente_telefone: pedido.cliente_telefone.trim()||null,
        endereco: pedido.endereco.trim(),
        bairro: pedido.bairro.trim()||null,
        ponto_referencia: pedido.ponto_referencia.trim()||null,
        tipo_servico: pedido.tipo_servico,
        observacoes: pedido.observacoes.trim()||null,
        status: "medicao",
      }).select().single();
      if(errPedido) throw errPedido;

      // 2) cria os itens medidos + sobe fotos
      for(const it of itens){
        const {data:itemRow, error:errItem} = await supabase.from("itens_pedido").insert({
          pedido_id: pedidoRow.id,
          descricao: it.descricao.trim(),
          largura_mm: Number(it.largura_mm),
          altura_mm: Number(it.altura_mm),
          cor_aluminio: it.cor_aluminio,
          cor_vidro: it.cor_vidro,
          observacoes: it.observacoes.trim()||null,
        }).select().single();
        if(errItem) throw errItem;

        for(const foto of it.fotos){
          const nomeArquivo=`${pedidoRow.id}/${itemRow.id}/${Date.now()}_${foto.file.name}`;
          const {error:errUpload} = await supabase.storage.from("pedidos").upload(nomeArquivo, foto.file);
          if(errUpload) throw errUpload;
          const {data:urlData} = supabase.storage.from("pedidos").getPublicUrl(nomeArquivo);
          const {error:errFoto} = await supabase.from("fotos_pedido").insert({
            pedido_id: pedidoRow.id, item_id: itemRow.id, url: urlData.publicUrl,
          });
          if(errFoto) throw errFoto;
        }
      }

      // 3) registra o primeiro passo do andamento
      await supabase.from("andamento_pedido").insert({
        pedido_id: pedidoRow.id, etapa: "medicao",
        descricao: "Medição realizada e pedido lançado no sistema.",
      });

      setSucesso({numero: pedidoRow.numero});
      setPedido({cliente_nome:"",cliente_telefone:"",endereco:"",bairro:"",ponto_referencia:"",tipo_servico:tipos[0]||"Box de Banheiro",observacoes:""});
      setItens([novoItemVazio()]);
      onPedidoCriado?.();
    }catch(e){
      setErro(e.message||"Erro ao enviar o pedido. Confira sua conexão e tente de novo.");
    }finally{
      setEnviando(false);
    }
  };

  if(sucesso){
    return (
      <div style={{padding:"14px 18px"}}>
        <div style={{background:"#0f172a",border:"1px solid #22c55e55",borderRadius:14,padding:24,textAlign:"center"}}>
          <div style={{fontSize:40,marginBottom:8}}>✅</div>
          <div style={{fontSize:16,fontWeight:800,color:"#f1f5f9"}}>Pedido #{sucesso.numero} lançado!</div>
          <div style={{fontSize:12,color:"#94a3b8",marginTop:6}}>O instalador já pode acompanhar esse pedido no app.</div>
          <button onClick={()=>setSucesso(null)} style={{marginTop:16,background:"linear-gradient(135deg,#f97316,#ea580c)",
            border:"none",borderRadius:10,color:"#fff",cursor:"pointer",padding:"10px 20px",fontSize:13,fontWeight:700}}>
            + Nova medição
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{padding:"14px 18px",display:"flex",flexDirection:"column",gap:16,paddingBottom:100}}>
      <div style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:14,padding:16,display:"flex",flexDirection:"column",gap:12}}>
        <div style={{fontSize:12,fontWeight:800,color:"#f97316",letterSpacing:1}}>📐 DADOS DO CLIENTE</div>
        <Lbl t="Nome do cliente"><input style={inp} value={pedido.cliente_nome} onChange={e=>sp("cliente_nome",e.target.value)} placeholder="Ex: Maria Silva"/></Lbl>
        <Lbl t="Telefone"><input style={inp} value={pedido.cliente_telefone} onChange={e=>sp("cliente_telefone",e.target.value)} placeholder="(11) 99999-9999"/></Lbl>
        <Lbl t="Endereço"><input style={inp} value={pedido.endereco} onChange={e=>sp("endereco",e.target.value)} placeholder="Rua, número"/></Lbl>
        <div style={{display:"flex",gap:10}}>
          <div style={{flex:1}}><Lbl t="Bairro"><input style={inp} value={pedido.bairro} onChange={e=>sp("bairro",e.target.value)}/></Lbl></div>
          <div style={{flex:1}}><Lbl t="Ponto de referência"><input style={inp} value={pedido.ponto_referencia} onChange={e=>sp("ponto_referencia",e.target.value)}/></Lbl></div>
        </div>
        <Lbl t="Tipo de serviço">
          <select style={inp} value={pedido.tipo_servico} onChange={e=>sp("tipo_servico",e.target.value)}>
            {tipos.map(t=><option key={t} value={t}>{t}</option>)}
          </select>
        </Lbl>
      </div>

      {itens.map((it,idx)=>(
        <div key={it._key} style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:14,padding:16,display:"flex",flexDirection:"column",gap:12}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{fontSize:12,fontWeight:800,color:"#f97316",letterSpacing:1}}>🪟 PEÇA {idx+1}</div>
            {itens.length>1&&<button onClick={()=>rmItem(it._key)} style={{background:"transparent",border:"none",color:"#ef4444",cursor:"pointer",fontSize:11,fontWeight:700}}>Remover</button>}
          </div>
          <Lbl t="Descrição"><input style={inp} value={it.descricao} onChange={e=>setItem(it._key,"descricao",e.target.value)} placeholder="Ex: Box banheiro suíte"/></Lbl>
          <div style={{display:"flex",gap:10}}>
            <div style={{flex:1}}><Lbl t="Largura (mm)"><input style={inp} type="number" value={it.largura_mm} onChange={e=>setItem(it._key,"largura_mm",e.target.value)} placeholder="1200"/></Lbl></div>
            <div style={{flex:1}}><Lbl t="Altura (mm)"><input style={inp} type="number" value={it.altura_mm} onChange={e=>setItem(it._key,"altura_mm",e.target.value)} placeholder="1900"/></Lbl></div>
          </div>
          <div style={{display:"flex",gap:10}}>
            <div style={{flex:1}}><Lbl t="Cor do alumínio">
              <select style={inp} value={it.cor_aluminio} onChange={e=>setItem(it._key,"cor_aluminio",e.target.value)}>
                {CORES_ALUMINIO.map(c=><option key={c} value={c}>{c}</option>)}
              </select>
            </Lbl></div>
            <div style={{flex:1}}><Lbl t="Cor do vidro">
              <select style={inp} value={it.cor_vidro} onChange={e=>setItem(it._key,"cor_vidro",e.target.value)}>
                {CORES_VIDRO.map(c=><option key={c} value={c}>{c}</option>)}
              </select>
            </Lbl></div>
          </div>
          <Lbl t="Observações da peça"><input style={inp} value={it.observacoes} onChange={e=>setItem(it._key,"observacoes",e.target.value)} placeholder="Opcional"/></Lbl>

          <Lbl t="Fotos">
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {it.fotos.map((f,fi)=>(
                <div key={fi} style={{position:"relative"}}>
                  <img src={f.preview} style={{width:64,height:64,objectFit:"cover",borderRadius:8,border:"1px solid #334155"}}/>
                  <button onClick={()=>rmFoto(it._key,fi)} style={{position:"absolute",top:-6,right:-6,width:20,height:20,borderRadius:"50%",
                    background:"#ef4444",border:"none",color:"#fff",fontSize:11,cursor:"pointer",lineHeight:"20px"}}>✕</button>
                </div>
              ))}
              <label style={{width:64,height:64,borderRadius:8,border:"1px dashed #334155",display:"flex",
                alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#64748b",fontSize:22}}>
                📷
                <input type="file" accept="image/*" capture="environment" multiple style={{display:"none"}}
                  onChange={e=>{addFotos(it._key,e.target.files);e.target.value="";}}/>
              </label>
            </div>
          </Lbl>
        </div>
      ))}

      <button onClick={addItem} style={{background:"#1e293b",border:"1px dashed #334155",borderRadius:12,
        color:"#94a3b8",cursor:"pointer",padding:"12px",fontSize:13,fontWeight:700}}>
        + Adicionar outra peça
      </button>

      {erro&&<div style={{background:"#7c2d1233",border:"1px solid #ef444455",borderRadius:10,padding:12,color:"#fca5a5",fontSize:12}}>{erro}</div>}

      <button onClick={enviar} disabled={enviando} style={{
        position:"sticky",bottom:14,background:enviando?"#475569":"linear-gradient(135deg,#f97316,#ea580c)",
        border:"none",borderRadius:14,color:"#fff",cursor:enviando?"default":"pointer",padding:"16px",
        fontSize:15,fontWeight:800,boxShadow:"0 8px 20px #f9731655"}}>
        {enviando?"Enviando...":"✅ Lançar pedido"}
      </button>
    </div>
  );
}

// ─── APP PRINCIPAL ────────────────────────────────────────────────────────────
export default function GTObras() {
  const [equipe,setEquipe]=useState(EQUIPE_INICIAL);
  const [tipos,setTipos]=useState(TIPOS_INICIAL);
  const [obras,setObras]=useState(OBRAS_INICIAL);
  const [perfil,setPerfil]=useState("admin");
  const [aba,setAba]=useState("obras");
  const [obraSel,setObraSel]=useState(null);
  const [modalNova,setModalNova]=useState(false);
  const [funcSel,setFuncSel]=useState(null);
  const [filtroSt,setFiltroSt]=useState("todos");
  const [busca,setBusca]=useState("");

  const p=getP(perfil);

  const minhasObras=(perfil==="admin"||perfil==="gestora")
    ? obras
    : obras.filter(o=>{
        const resp=equipe.find(e=>e.id===o.responsavelId);
        const eu=equipe.find(e=>e.perfil===perfil);
        return resp&&eu&&resp.id===eu.id;
      });

  const obrasFiltradas=minhasObras.filter(o=>{
    if(filtroSt!=="todos"&&o.status!==filtroSt)return false;
    if(busca&&!o.cliente.toLowerCase().includes(busca.toLowerCase())&&
       !o.endereco.toLowerCase().includes(busca.toLowerCase()))return false;
    return true;
  });

  const updateObra=(u)=>{setObras(prev=>prev.map(o=>o.id===u.id?u:o));if(obraSel?.id===u.id)setObraSel(u);};
  const deleteObra=(id)=>{setObras(prev=>prev.filter(o=>o.id!==id));setObraSel(null);};
  const saveFunc=(f)=>{setEquipe(prev=>prev.find(e=>e.id===f.id)?prev.map(e=>e.id===f.id?f:e):[...prev,f]);setFuncSel(null);};
  const deleteFunc=(id)=>{setEquipe(prev=>prev.filter(e=>e.id!==id));setFuncSel(null);};

  const rel={
    total:obras.length,
    finalizados:obras.filter(o=>o.status==="finalizado").length,
    andamento:obras.filter(o=>!["finalizado","lead"].includes(o.status)).length,
    fornecedor:obras.filter(o=>o.fornecedor?.pendente).length,
    receita:obras.filter(o=>o.status==="finalizado").reduce((a,o)=>a+o.valor,0),
    porPessoa:equipe.filter(e=>e.ativo).map(e=>({
      ...e,
      total:obras.filter(o=>o.responsavelId===e.id).length,
      fin:obras.filter(o=>o.responsavelId===e.id&&o.status==="finalizado").length,
    })).filter(e=>e.total>0),
  };

  const ABAS=[
    {id:"obras",label:"🔧 Obras"},
    {id:"medicao",label:"📐 Medição"},
    ...(p.verRelatorio?[{id:"relatorio",label:"📊 Relatório"}]:[]),
    ...(p.gerenciar?[{id:"equipe",label:"👥 Equipe"}]:[]),
  ];

  return (
    <div style={{fontFamily:"'Sora','Nunito',sans-serif",background:"#060f1e",minHeight:"100vh",color:"#e2e8f0"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&display=swap');
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:5px;height:5px}
        ::-webkit-scrollbar-track{background:#0f172a}
        ::-webkit-scrollbar-thumb{background:#334155;border-radius:3px}
        input,select,textarea{outline:none}
        input:focus,select:focus,textarea:focus{border-color:#f97316!important}
      `}</style>

      {/* HEADER */}
      <div style={{background:"linear-gradient(135deg,#0f172a 0%,#1a0a00 100%)",borderBottom:"1px solid #1e293b",
        padding:"14px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",
        position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#f97316,#ea580c)",
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:16,fontWeight:900,color:"#fff",boxShadow:"0 4px 12px #f9731655"}}>GT</div>
          <div>
            <div style={{fontSize:14,fontWeight:800,color:"#f1f5f9",lineHeight:1}}>GT Decorações</div>
            <div style={{fontSize:9,color:"#64748b",letterSpacing:1}}>GESTÃO DE OBRAS</div>
          </div>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <select value={perfil} onChange={e=>{setPerfil(e.target.value);setAba("obras");}} style={{
            background:"#1e293b",border:"1px solid #334155",borderRadius:8,
            color:"#e2e8f0",padding:"6px 10px",fontSize:11,cursor:"pointer"}}>
            {PERFIS.map(pr=><option key={pr.id} value={pr.id}>{pr.icon} {pr.label}</option>)}
          </select>
          {p.gerenciar&&(
            <button onClick={()=>setModalNova(true)} style={{
              background:"linear-gradient(135deg,#f97316,#ea580c)",border:"none",borderRadius:10,
              color:"#fff",cursor:"pointer",padding:"7px 14px",fontSize:12,fontWeight:700,
              boxShadow:"0 4px 12px #f9731655"}}>+ Obra</button>
          )}
        </div>
      </div>

      {/* ABAS */}
      <div style={{display:"flex",background:"#0f172a",borderBottom:"1px solid #1e293b",padding:"0 18px"}}>
        {ABAS.map(a=>(
          <button key={a.id} onClick={()=>setAba(a.id)} style={{background:"transparent",border:"none",
            borderBottom:`2px solid ${aba===a.id?"#f97316":"transparent"}`,
            color:aba===a.id?"#f97316":"#64748b",cursor:"pointer",
            padding:"11px 14px",fontSize:12,fontWeight:700,transition:"all .2s"}}>
            {a.label}
          </button>
        ))}
      </div>

      {/* ABA MEDIÇÃO */}
      {aba==="medicao"&&(
        <TelaMedicao tipos={tipos} onPedidoCriado={()=>{}}/>
      )}

      {/* ABA OBRAS */}
      {aba==="obras"&&(
        <div style={{padding:"14px 18px"}}>
          <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:14}}>
            <input value={busca} onChange={e=>setBusca(e.target.value)}
              placeholder="🔍  Buscar cliente ou endereço..." style={{...inp,borderRadius:12}}/>
            <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:2}}>
              <button onClick={()=>setFiltroSt("todos")} style={{
                background:filtroSt==="todos"?"#f97316":"#1e293b",border:"none",borderRadius:8,
                color:filtroSt==="todos"?"#fff":"#94a3b8",cursor:"pointer",
                padding:"5px 12px",fontSize:11,fontWeight:700,whiteSpace:"nowrap"}}>
                Todos ({minhasObras.length})
              </button>
              {STATUS_FLOW.map(s=>{
                const c=minhasObras.filter(o=>o.status===s.id).length;
                if(!c)return null;
                return(
                  <button key={s.id} onClick={()=>setFiltroSt(s.id)} style={{
                    background:filtroSt===s.id?s.color:"#1e293b",
                    border:`1px solid ${filtroSt===s.id?s.color:"#334155"}`,
                    borderRadius:8,color:filtroSt===s.id?"#fff":"#94a3b8",
                    cursor:"pointer",padding:"5px 12px",fontSize:11,fontWeight:700,whiteSpace:"nowrap"}}>
                    {s.icon} {s.label} ({c})
                  </button>
                );
              })}
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {obrasFiltradas.length===0&&(
              <div style={{textAlign:"center",color:"#475569",padding:40,fontSize:14}}>Nenhuma obra encontrada</div>
            )}
            {obrasFiltradas.map(obra=>{
              const s=getSt(obra.status);
              const resp=equipe.find(e=>e.id===obra.responsavelId);
              const conc=obra.checklist.filter(c=>c.feito).length;
              const prog=obra.checklist.length?Math.round((conc/obra.checklist.length)*100):0;
              return(
                <div key={obra.id} onClick={()=>setObraSel(obra)} style={{
                  background:"#0f172a",border:`1px solid ${obra.fornecedor?.pendente?"#f9731633":"#1e293b"}`,
                  borderLeft:`3px solid ${s.color}`,borderRadius:14,padding:14,cursor:"pointer",position:"relative"}}>
                  {obra.fornecedor?.pendente&&(
                    <div style={{position:"absolute",top:10,right:10,background:"#7c2d12",
                      borderRadius:6,padding:"2px 8px",fontSize:9,color:"#f97316",fontWeight:700}}>⏳ FORNECEDOR</div>
                  )}
                  <div style={{display:"flex",gap:12}}>
                    <Av nome={resp?.nome||"?"} cor={resp?.cor} size={40}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
                        <div>
                          <div style={{fontSize:15,fontWeight:800,color:"#f1f5f9"}}>{obra.cliente}</div>
                          <div style={{fontSize:11,color:"#64748b"}}>{obra.tipo} · {resp?.nome||"—"}</div>
                        </div>
                        <Badge status={obra.status}/>
                      </div>
                      <div style={{fontSize:11,color:"#475569",marginTop:5}}>
                        📍 {obra.endereco.length>44?obra.endereco.slice(0,44)+"…":obra.endereco}
                      </div>
                      {obra.checklist.length>0&&(
                        <div style={{marginTop:8}}>
                          <div style={{background:"#1e293b",borderRadius:4,height:4,overflow:"hidden"}}>
                            <div style={{height:"100%",background:s.color,width:`${prog}%`,borderRadius:4}}/>
                          </div>
                          <div style={{fontSize:10,color:"#475569",marginTop:3}}>
                            Tarefas: {conc}/{obra.checklist.length} ({prog}%)
                          </div>
                        </div>
                      )}
                      <div style={{display:"flex",justifyContent:"space-between",marginTop:8}}>
                        <span style={{fontSize:10,color:"#475569"}}>{obra.dataCriacao}</span>
                        {p.verValor&&(
                          <span style={{fontSize:13,fontWeight:700,color:"#22c55e"}}>
                            R$ {(obra.valor||0).toLocaleString("pt-BR")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ABA RELATÓRIO */}
      {aba==="relatorio"&&p.verRelatorio&&(
        <div style={{padding:"14px 18px",display:"flex",flexDirection:"column",gap:14}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {[["Total",rel.total,"#3b82f6","📋"],["Finalizados",rel.finalizados,"#22c55e","🏁"],
              ["Em Andamento",rel.andamento,"#f97316","🔧"],["Aguard. Fornecedor",rel.fornecedor,"#ec4899","📦"]
            ].map(([lbl,val,cor,icon])=>(
              <div key={lbl} style={{background:"#0f172a",border:`1px solid ${cor}33`,borderRadius:14,padding:16}}>
                <div style={{fontSize:20}}>{icon}</div>
                <div style={{fontSize:28,fontWeight:900,color:cor,lineHeight:1,margin:"6px 0 4px"}}>{val}</div>
                <div style={{fontSize:10,color:"#64748b",letterSpacing:0.5}}>{lbl}</div>
              </div>
            ))}
          </div>
          <div style={{background:"linear-gradient(135deg,#14532d22,#052e1622)",
            border:"1px solid #22c55e33",borderRadius:14,padding:18}}>
            <div style={{fontSize:10,color:"#64748b",letterSpacing:1,marginBottom:4}}>RECEITA FINALIZADA</div>
            <div style={{fontSize:30,fontWeight:900,color:"#22c55e"}}>R$ {rel.receita.toLocaleString("pt-BR")}</div>
          </div>
          <div style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:14,padding:18}}>
            <div style={{fontSize:10,color:"#64748b",letterSpacing:1,marginBottom:14}}>DESEMPENHO POR PESSOA</div>
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              {rel.porPessoa.map(e=>(
                <div key={e.id}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <Av nome={e.nome} cor={e.cor} size={28}/>
                      <div>
                        <div style={{fontSize:13,fontWeight:700,color:"#e2e8f0"}}>{e.nome}</div>
                        <div style={{fontSize:10,color:"#64748b"}}>{getP(e.perfil).icon} {e.funcao}</div>
                      </div>
                    </div>
                    <span style={{fontSize:12,color:"#94a3b8",alignSelf:"center"}}>{e.fin} fin. / {e.total}</span>
                  </div>
                  <div style={{background:"#1e293b",borderRadius:6,height:8,overflow:"hidden"}}>
                    <div style={{height:"100%",borderRadius:6,background:`linear-gradient(90deg,${e.cor},${e.cor}aa)`,
                      width:`${e.total?Math.round((e.fin/e.total)*100):0}%`}}/>
                  </div>
                </div>
              ))}
              {rel.porPessoa.length===0&&<div style={{textAlign:"center",color:"#475569",fontSize:13}}>Sem dados ainda</div>}
            </div>
          </div>
          <div style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:14,padding:18}}>
            <div style={{fontSize:10,color:"#64748b",letterSpacing:1,marginBottom:14}}>PIPELINE</div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {STATUS_FLOW.map(s=>{
                const c=obras.filter(o=>o.status===s.id).length;
                return(
                  <div key={s.id} style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:110,fontSize:11,color:"#64748b",flexShrink:0}}>{s.icon} {s.label}</div>
                    <div style={{flex:1,background:"#1e293b",borderRadius:6,height:18,overflow:"hidden"}}>
                      <div style={{height:"100%",background:s.color,borderRadius:6,
                        width:`${obras.length?(c/obras.length)*100:0}%`,
                        display:"flex",alignItems:"center",paddingLeft:c>0?6:0,
                        fontSize:10,color:"#fff",fontWeight:700}}>{c>0?c:""}</div>
                    </div>
                    <div style={{width:18,fontSize:12,fontWeight:700,color:"#e2e8f0",textAlign:"right"}}>{c}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ABA EQUIPE */}
      {aba==="equipe"&&p.gerenciar&&(
        <div style={{padding:"14px 18px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div style={{fontSize:12,color:"#64748b"}}>{equipe.filter(e=>e.ativo).length} pessoas ativas · {equipe.length} total</div>
            <button onClick={()=>setFuncSel("new")} style={{
              background:"linear-gradient(135deg,#f97316,#ea580c)",border:"none",borderRadius:10,
              color:"#fff",cursor:"pointer",padding:"8px 14px",fontSize:12,fontWeight:700}}>
              + Adicionar Pessoa
            </button>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {equipe.map(e=>(
              <div key={e.id} onClick={()=>setFuncSel(e)} style={{
                background:"#0f172a",border:"1px solid #1e293b",
                borderLeft:`3px solid ${e.ativo?e.cor:"#334155"}`,
                borderRadius:14,padding:14,cursor:"pointer",opacity:e.ativo?1:0.55,
                display:"flex",alignItems:"center",gap:14}}>
                <Av nome={e.nome} cor={e.cor} size={46}/>
                <div style={{flex:1}}>
                  <div style={{fontSize:15,fontWeight:800,color:"#f1f5f9"}}>{e.nome}</div>
                  <div style={{fontSize:12,color:"#64748b",marginTop:1}}>{e.funcao}</div>
                  <div style={{fontSize:11,color:"#94a3b8",marginTop:3}}>
                    {getP(e.perfil).icon} {getP(e.perfil).label}
                    {e.telefone&&` · ${e.telefone}`}
                  </div>
                </div>
                <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6}}>
                  <span style={{fontSize:10,background:e.ativo?"#22c55e22":"#ef444422",
                    color:e.ativo?"#22c55e":"#ef4444",border:`1px solid ${e.ativo?"#22c55e44":"#ef444444"}`,
                    borderRadius:20,padding:"2px 8px",fontWeight:700}}>
                    {e.ativo?"Ativo":"Inativo"}
                  </span>
                  <span style={{fontSize:10,color:"#475569"}}>
                    {obras.filter(o=>o.responsavelId===e.id).length} obras
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Gerenciar Tipos de Serviço */}
          <div style={{marginTop:24,background:"#0f172a",border:"1px solid #1e293b",borderRadius:16,padding:18}}>
            <div style={{fontSize:12,color:"#64748b",letterSpacing:1,marginBottom:14}}>⚙️ TIPOS DE SERVIÇO</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:14}}>
              {tipos.map((t,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:6,
                  background:"#1e293b",borderRadius:20,padding:"5px 12px"}}>
                  <span style={{fontSize:13,color:"#e2e8f0"}}>{t}</span>
                  {tipos.length>1&&(
                    <button onClick={()=>setTipos(prev=>prev.filter((_,idx)=>idx!==i))} style={{
                      background:"transparent",border:"none",color:"#475569",
                      cursor:"pointer",fontSize:12,padding:0,lineHeight:1}}>✕</button>
                  )}
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:8}}>
              <input
                id="novoTipoInput"
                placeholder="Ex: Película, Guarda-corpo, Porta..."
                style={{...inp,flex:1}}
                onKeyDown={e=>{
                  if(e.key==="Enter"&&e.target.value.trim()){
                    setTipos(prev=>[...prev,e.target.value.trim()]);
                    e.target.value="";
                  }
                }}/>
              <button onClick={()=>{
                const el=document.getElementById("novoTipoInput");
                if(el&&el.value.trim()){setTipos(prev=>[...prev,el.value.trim()]);el.value="";}
              }} style={{background:"linear-gradient(135deg,#f97316,#ea580c)",border:"none",
                borderRadius:10,color:"#fff",cursor:"pointer",padding:"10px 16px",fontWeight:800,fontSize:15}}>+</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAIS */}
      {obraSel&&<ModalObra obra={obraSel} onClose={()=>setObraSel(null)}
        onUpdate={updateObra} onDelete={deleteObra} equipe={equipe} perfil={perfil}/>}
      {modalNova&&<ModalNovaObra onClose={()=>setModalNova(false)}
        onCreate={nova=>setObras(prev=>[nova,...prev])} equipe={equipe} tipos={tipos} setTipos={setTipos}/>}
      {funcSel&&<ModalFunc func={funcSel==="new"?null:funcSel}
        onClose={()=>setFuncSel(null)} onSave={saveFunc} onDelete={deleteFunc}/>}
    </div>
  );
}
{
  "name": "gt-obras",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@supabase/supabase-js": "^2.45.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0"
  },
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://pgotzrpdarunkrfygwbg.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_kuF8i9IeV29P2VogR2SP7g_kXRzEWUq'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
{
  "name": "gt-obras",
  "version": "1.0.0",
  "lockfileVersion": 3,
  "requires": true,
  "packages": {
    "": {
      "name": "gt-obras",
      "version": "1.0.0",
      "dependencies": {
        "@supabase/supabase-js": "^2.45.0",
        "react": "^18.2.0",
        "react-dom": "^18.2.0"
      },
      "devDependencies": {
        "@vitejs/plugin-react": "^4.2.0",
        "vite": "^5.0.0"
      }
    },
    "node_modules/@babel/code-frame": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/code-frame/-/code-frame-7.29.7.tgz",
      "integrity": "sha512-Aup7aUOfpbAUg2ROOJN6Iw5f9DMBlzu0mIkm/malLQFN/YQgO48wCj0Kxa3sEHJvPVFg7siR+qRInwXd2qhQKw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-validator-identifier": "^7.29.7",
        "js-tokens": "^4.0.0",
        "picocolors": "^1.1.1"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/compat-data": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/compat-data/-/compat-data-7.29.7.tgz",
      "integrity": "sha512-locTkQyKvwIEgBzVrn8693ebc97F2U8ZHjbXwDXJ5Fn2TCpNwTlKcaKLkdHop5c/icOFE7qt7Q9JC5hnKNa6Gg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/core": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/core/-/core-7.29.7.tgz",
      "integrity": "sha512-RgHBCvtjbOK2gXSNBNIkNoEc9qoVEtau3hj8gEqKQuL3HZAibKarWFEI3Lfm6EYKkLalOh8eSrj9b+ch9H/VBA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/code-frame": "^7.29.7",
        "@babel/generator": "^7.29.7",
        "@babel/helper-compilation-targets": "^7.29.7",
        "@babel/helper-module-transforms": "^7.29.7",
        "@babel/helpers": "^7.29.7",
        "@babel/parser": "^7.29.7",
        "@babel/template": "^7.29.7",
        "@babel/traverse": "^7.29.7",
        "@babel/types": "^7.29.7",
        "@jridgewell/remapping": "^2.3.5",
        "convert-source-map": "^2.0.0",
        "debug": "^4.1.0",
        "gensync": "^1.0.0-beta.2",
        "json5": "^2.2.3",
        "semver": "^6.3.1"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/babel"
      }
    },
    "node_modules/@babel/generator": {
      "version": "7.29.8",
      "resolved": "https://registry.npmjs.org/@babel/generator/-/generator-7.29.8.tgz",
      "integrity": "sha512-gZbepsdh3WDtgZKWL+vTPh71LSBrm/Y4/QDZBVCcYfmeTEEuoOYwlSy+G1StfJg+/Zy550u/3TATbm7qDbbMtg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/parser": "^7.29.8",
        "@babel/types": "^7.29.8",
        "@jridgewell/gen-mapping": "^0.3.12",
        "@jridgewell/trace-mapping": "^0.3.28",
        "jsesc": "^3.0.2"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-compilation-targets": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/helper-compilation-targets/-/helper-compilation-targets-7.29.7.tgz",
      "integrity": "sha512-wem6WaBj4NaVYVdNhLPPVacES6ZJ+KBBfSkTMD3YZxbP3rm3Di85tJU5ljaUNhaOynt+Aj0xruhYuzQBt8n71g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/compat-data": "^7.29.7",
        "@babel/helper-validator-option": "^7.29.7",
        "browserslist": "^4.24.0",
        "lru-cache": "^5.1.1",
        "semver": "^6.3.1"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-globals": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/helper-globals/-/helper-globals-7.29.7.tgz",
      "integrity": "sha512-3nQVUAtvkKH9zahfWgw96Jc/uFOmjACE1kQz82E2lqWmHBgjzbNlsC22nuQTfahmWeQtTq5nQ/4Nnd2A1wj4zA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-module-imports": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/helper-module-imports/-/helper-module-imports-7.29.7.tgz",
      "integrity": "sha512-ejHwrQQYcm9xnTivShn2IDOlIzInN34AXskvq9QicvCtEzq1Vzclu/tKF8Jq1Cg8JG2GL6/EmjgsCT7lXepE3g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/traverse": "^7.29.7",
        "@babel/types": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-module-transforms": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/helper-module-transforms/-/helper-module-transforms-7.29.7.tgz",
      "integrity": "sha512-UPUVSyXbOh627KiCIGQSgwWzGeBKLkaJ9PJEdrngIwMSzxLR4jS4+f1f1jb7VzBbg8nFLaYotvVPFCTqdrmTAg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-module-imports": "^7.29.7",
        "@babel/helper-validator-identifier": "^7.29.7",
        "@babel/traverse": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0"
      }
    },
    "node_modules/@babel/helper-plugin-utils": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/helper-plugin-utils/-/helper-plugin-utils-7.29.7.tgz",
      "integrity": "sha512-G7sHYigPY17oO5SYWnfD/0MTBwVR781S/JI643e/JhUYgVgWE/61SoW3NH9KWUKyKq5LVh3npif99Wkt6j86Jw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-string-parser": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/helper-string-parser/-/helper-string-parser-7.29.7.tgz",
      "integrity": "sha512-Pb5ijPrZ89GDH8223L4UP8i6QApWxs04RbPQJTeWDV0/keR2E36MeKnyr6LYmUUvqRRI+Iv87SuF1W6ErINzYw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-validator-identifier": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/helper-validator-identifier/-/helper-validator-identifier-7.29.7.tgz",
      "integrity": "sha512-qehxGkRj55h/ff8EMaJ+cYhyaKlHIxqYDn682wQD7RNp9UujOQsHog2uS0r2vzr4pW+sXf90NeeayjcNaX3fFg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-validator-option": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/helper-validator-option/-/helper-validator-option-7.29.7.tgz",
      "integrity": "sha512-N9ZErrD+yW5geCDtBqnOoxmR8+tNKiGuxKlDpuJxfsqpa2dFcexaziGAE/qoHLiDDreVNMupxGmSoNlyvsA3gw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helpers": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/helpers/-/helpers-7.29.7.tgz",
      "integrity": "sha512-1k2lAGRMfHTcwuNYcCNUmaUffmQv8KWMfh2iJUUeRlwlwH4FdNG7mfPI10NPfLHJFThE4Tyr4mv7kTNZOiPuBg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/template": "^7.29.7",
        "@babel/types": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/parser": {
      "version": "7.29.8",
      "resolved": "https://registry.npmjs.org/@babel/parser/-/parser-7.29.8.tgz",
      "integrity": "sha512-E8lTAYNB1KW+FH+VGJuZM1ioAx2E6oVlvQFRrf5P8ZZmsiJXYAD9vTFV7yyEURNzgh1dFqMZuO6tUwcARbqFCA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/types": "^7.29.8"
      },
      "bin": {
        "parser": "bin/babel-parser.js"
      },
      "engines": {
        "node": ">=6.0.0"
      }
    },
    "node_modules/@babel/plugin-transform-react-jsx-self": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-react-jsx-self/-/plugin-transform-react-jsx-self-7.29.7.tgz",
      "integrity": "sha512-TL0hMc9xzy86VD31nUiwzd5otRAcyEPcsegCxolO0PvcXuH1v0kECe/UIznYFihpkvU5wg/jk4v0TTEFfm53fw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-transform-react-jsx-source": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-react-jsx-source/-/plugin-transform-react-jsx-source-7.29.7.tgz",
      "integrity": "sha512-06IyK09H3wi4cGbhDBwp5gUGo0IKtnYa8tyTiephirPCK6fbobVGiXMMI5zLQ4aKEYP3wZ3ArU44o+8KMrSG/Q==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/template": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/template/-/template-7.29.7.tgz",
      "integrity": "sha512-puq+Gf35oI24FeN11LkoUQFqv9uwNeWpxXZi/Ji3rRIoKAzKnxRaZ+Gkj0vKS9ZCiTESfng1N9LyOyXvo+m+Gg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/code-frame": "^7.29.7",
        "@babel/parser": "^7.29.7",
        "@babel/types": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/traverse": {
      "version": "7.29.8",
      "resolved": "https://registry.npmjs.org/@babel/traverse/-/traverse-7.29.8.tgz",
      "integrity": "sha512-I5z7H3bf/41ktsNVLtpN0wAa336HkqIHQ5BuPLEhTkt1jVSyZpeNKIzTgEWmlxjdg81R0IgUCcaE+Ok3NvrfZg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/code-frame": "^7.29.7",
        "@babel/generator": "^7.29.8",
        "@babel/helper-globals": "^7.29.7",
        "@babel/parser": "^7.29.8",
        "@babel/template": "^7.29.7",
        "@babel/types": "^7.29.8",
        "debug": "^4.3.1"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/types": {
      "version": "7.29.8",
      "resolved": "https://registry.npmjs.org/@babel/types/-/types-7.29.8.tgz",
      "integrity": "sha512-Vj1jF3cPfxg7OAfoI7QnVKLoILlm2JF9pnVHrX8qx7AHMiYWT+NDAA7jChlNgRS4WTLc/fD1lXLmPixluj+3Gg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-string-parser": "^7.29.7",
        "@babel/helper-validator-identifier": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@esbuild/aix-ppc64": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/aix-ppc64/-/aix-ppc64-0.21.5.tgz",
      "integrity": "sha512-1SDgH6ZSPTlggy1yI6+Dbkiz8xzpHJEVAlF/AM1tHPLsf5STom9rwtjE4hKAF20FfXXNTFqEYXyJNWh1GiZedQ==",
      "cpu": [
        "ppc64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "aix"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/android-arm": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/android-arm/-/android-arm-0.21.5.tgz",
      "integrity": "sha512-vCPvzSjpPHEi1siZdlvAlsPxXl7WbOVUBBAowWug4rJHb68Ox8KualB+1ocNvT5fjv6wpkX6o/iEpbDrf68zcg==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/android-arm64": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/android-arm64/-/android-arm64-0.21.5.tgz",
      "integrity": "sha512-c0uX9VAUBQ7dTDCjq+wdyGLowMdtR/GoC2U5IYk/7D1H1JYC0qseD7+11iMP2mRLN9RcCMRcjC4YMclCzGwS/A==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/android-x64": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/android-x64/-/android-x64-0.21.5.tgz",
      "integrity": "sha512-D7aPRUUNHRBwHxzxRvp856rjUHRFW1SdQATKXH2hqA0kAZb1hKmi02OpYRacl0TxIGz/ZmXWlbZgjwWYaCakTA==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/darwin-arm64": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/darwin-arm64/-/darwin-arm64-0.21.5.tgz",
      "integrity": "sha512-DwqXqZyuk5AiWWf3UfLiRDJ5EDd49zg6O9wclZ7kUMv2WRFr4HKjXp/5t8JZ11QbQfUS6/cRCKGwYhtNAY88kQ==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/darwin-x64": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/darwin-x64/-/darwin-x64-0.21.5.tgz",
      "integrity": "sha512-se/JjF8NlmKVG4kNIuyWMV/22ZaerB+qaSi5MdrXtd6R08kvs2qCN4C09miupktDitvh8jRFflwGFBQcxZRjbw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/freebsd-arm64": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/freebsd-arm64/-/freebsd-arm64-0.21.5.tgz",
      "integrity": "sha512-5JcRxxRDUJLX8JXp/wcBCy3pENnCgBR9bN6JsY4OmhfUtIHe3ZW0mawA7+RDAcMLrMIZaf03NlQiX9DGyB8h4g==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "freebsd"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/freebsd-x64": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/freebsd-x64/-/freebsd-x64-0.21.5.tgz",
      "integrity": "sha512-J95kNBj1zkbMXtHVH29bBriQygMXqoVQOQYA+ISs0/2l3T9/kj42ow2mpqerRBxDJnmkUDCaQT/dfNXWX/ZZCQ==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "freebsd"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/linux-arm": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-arm/-/linux-arm-0.21.5.tgz",
      "integrity": "sha512-bPb5AHZtbeNGjCKVZ9UGqGwo8EUu4cLq68E95A53KlxAPRmUyYv2D6F0uUI65XisGOL1hBP5mTronbgo+0bFcA==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/linux-arm64": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-arm64/-/linux-arm64-0.21.5.tgz",
      "integrity": "sha512-ibKvmyYzKsBeX8d8I7MH/TMfWDXBF3db4qM6sy+7re0YXya+K1cem3on9XgdT2EQGMu4hQyZhan7TeQ8XkGp4Q==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/linux-ia32": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-ia32/-/linux-ia32-0.21.5.tgz",
      "integrity": "sha512-YvjXDqLRqPDl2dvRODYmmhz4rPeVKYvppfGYKSNGdyZkA01046pLWyRKKI3ax8fbJoK5QbxblURkwK/MWY18Tg==",
      "cpu": [
        "ia32"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/linux-loong64": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-loong64/-/linux-loong64-0.21.5.tgz",
      "integrity": "sha512-uHf1BmMG8qEvzdrzAqg2SIG/02+4/DHB6a9Kbya0XDvwDEKCoC8ZRWI5JJvNdUjtciBGFQ5PuBlpEOXQj+JQSg==",
      "cpu": [
        "loong64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/linux-mips64el": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-mips64el/-/linux-mips64el-0.21.5.tgz",
      "integrity": "sha512-IajOmO+KJK23bj52dFSNCMsz1QP1DqM6cwLUv3W1QwyxkyIWecfafnI555fvSGqEKwjMXVLokcV5ygHW5b3Jbg==",
      "cpu": [
        "mips64el"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/linux-ppc64": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-ppc64/-/linux-ppc64-0.21.5.tgz",
      "integrity": "sha512-1hHV/Z4OEfMwpLO8rp7CvlhBDnjsC3CttJXIhBi+5Aj5r+MBvy4egg7wCbe//hSsT+RvDAG7s81tAvpL2XAE4w==",
      "cpu": [
        "ppc64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/linux-riscv64": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-riscv64/-/linux-riscv64-0.21.5.tgz",
      "integrity": "sha512-2HdXDMd9GMgTGrPWnJzP2ALSokE/0O5HhTUvWIbD3YdjME8JwvSCnNGBnTThKGEB91OZhzrJ4qIIxk/SBmyDDA==",
      "cpu": [
        "riscv64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/linux-s390x": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-s390x/-/linux-s390x-0.21.5.tgz",
      "integrity": "sha512-zus5sxzqBJD3eXxwvjN1yQkRepANgxE9lgOW2qLnmr8ikMTphkjgXu1HR01K4FJg8h1kEEDAqDcZQtbrRnB41A==",
      "cpu": [
        "s390x"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/linux-x64": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-x64/-/linux-x64-0.21.5.tgz",
      "integrity": "sha512-1rYdTpyv03iycF1+BhzrzQJCdOuAOtaqHTWJZCWvijKD2N5Xu0TtVC8/+1faWqcP9iBCWOmjmhoH94dH82BxPQ==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/netbsd-x64": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/netbsd-x64/-/netbsd-x64-0.21.5.tgz",
      "integrity": "sha512-Woi2MXzXjMULccIwMnLciyZH4nCIMpWQAs049KEeMvOcNADVxo0UBIQPfSmxB3CWKedngg7sWZdLvLczpe0tLg==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "netbsd"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/openbsd-x64": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/openbsd-x64/-/openbsd-x64-0.21.5.tgz",
      "integrity": "sha512-HLNNw99xsvx12lFBUwoT8EVCsSvRNDVxNpjZ7bPn947b8gJPzeHWyNVhFsaerc0n3TsbOINvRP2byTZ5LKezow==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "openbsd"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/sunos-x64": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/sunos-x64/-/sunos-x64-0.21.5.tgz",
      "integrity": "sha512-6+gjmFpfy0BHU5Tpptkuh8+uw3mnrvgs+dSPQXQOv3ekbordwnzTVEb4qnIvQcYXq6gzkyTnoZ9dZG+D4garKg==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "sunos"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/win32-arm64": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/win32-arm64/-/win32-arm64-0.21.5.tgz",
      "integrity": "sha512-Z0gOTd75VvXqyq7nsl93zwahcTROgqvuAcYDUr+vOv8uHhNSKROyU961kgtCD1e95IqPKSQKH7tBTslnS3tA8A==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/win32-ia32": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/win32-ia32/-/win32-ia32-0.21.5.tgz",
      "integrity": "sha512-SWXFF1CL2RVNMaVs+BBClwtfZSvDgtL//G/smwAc5oVK/UPu2Gu9tIaRgFmYFFKrmg3SyAjSrElf0TiJ1v8fYA==",
      "cpu": [
        "ia32"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/win32-x64": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/win32-x64/-/win32-x64-0.21.5.tgz",
      "integrity": "sha512-tQd/1efJuzPC6rCFwEvLtci/xNFcTZknmXs98FYDfGE4wP9ClFV98nyKrzJKVPMhdDnjzLhdUyMX4PsQAPjwIw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@jridgewell/gen-mapping": {
      "version": "0.3.13",
      "resolved": "https://registry.npmjs.org/@jridgewell/gen-mapping/-/gen-mapping-0.3.13.tgz",
      "integrity": "sha512-2kkt/7niJ6MgEPxF0bYdQ6etZaA+fQvDcLKckhy1yIQOzaoKjBBjSj63/aLVjYE3qhRt5dvM+uUyfCg6UKCBbA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@jridgewell/sourcemap-codec": "^1.5.0",
        "@jridgewell/trace-mapping": "^0.3.24"
      }
    },
    "node_modules/@jridgewell/remapping": {
      "version": "2.3.5",
      "resolved": "https://registry.npmjs.org/@jridgewell/remapping/-/remapping-2.3.5.tgz",
      "integrity": "sha512-LI9u/+laYG4Ds1TDKSJW2YPrIlcVYOwi2fUC6xB43lueCjgxV4lffOCZCtYFiH6TNOX+tQKXx97T4IKHbhyHEQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@jridgewell/gen-mapping": "^0.3.5",
        "@jridgewell/trace-mapping": "^0.3.24"
      }
    },
    "node_modules/@jridgewell/resolve-uri": {
      "version": "3.1.2",
      "resolved": "https://registry.npmjs.org/@jridgewell/resolve-uri/-/resolve-uri-3.1.2.tgz",
      "integrity": "sha512-bRISgCIjP20/tbWSPWMEi54QVPRZExkuD9lJL+UIxUKtwVJA8wW1Trb1jMs1RFXo1CBTNZ/5hpC9QvmKWdopKw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6.0.0"
      }
    },
    "node_modules/@jridgewell/sourcemap-codec": {
      "version": "1.5.5",
      "resolved": "https://registry.npmjs.org/@jridgewell/sourcemap-codec/-/sourcemap-codec-1.5.5.tgz",
      "integrity": "sha512-cYQ9310grqxueWbl+WuIUIaiUaDcj7WOq5fVhEljNVgRfOUhY9fy2zTvfoqWsnebh8Sl70VScFbICvJnLKB0Og==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@jridgewell/trace-mapping": {
      "version": "0.3.31",
      "resolved": "https://registry.npmjs.org/@jridgewell/trace-mapping/-/trace-mapping-0.3.31.tgz",
      "integrity": "sha512-zzNR+SdQSDJzc8joaeP8QQoCQr8NuYx2dIIytl1QeBEZHJ9uW6hebsrYgbz8hJwUQao3TWCMtmfV8Nu1twOLAw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@jridgewell/resolve-uri": "^3.1.0",
        "@jridgewell/sourcemap-codec": "^1.4.14"
      }
    },
    "node_modules/@napi-rs/lzma-linux-x64-gnu": {
      "version": "1.5.1",
      "resolved": "https://registry.npmjs.org/@napi-rs/lzma-linux-x64-gnu/-/lzma-linux-x64-gnu-1.5.1.tgz",
      "integrity": "sha512-oTXEIha4SsuXdTA4Iyskj0kpdx2yVXdhd75c2v3xGrHFfVMsbhTPZU/nMPL4sWKo4pBHm3aucLaqGlF696dTyQ==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^22.20 || ^24.12 || >=25"
      }
    },
    "node_modules/@rolldown/pluginutils": {
      "version": "1.0.0-beta.27",
      "resolved": "https://registry.npmjs.org/@rolldown/pluginutils/-/pluginutils-1.0.0-beta.27.tgz",
      "integrity": "sha512-+d0F4MKMCbeVUJwG96uQ4SgAznZNSq93I3V+9NHA4OpvqG8mRCpGdKmK8l/dl02h2CCDHwW2FqilnTyDcAnqjA==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@rollup/rollup-android-arm-eabi": {
      "version": "4.62.4",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-android-arm-eabi/-/rollup-android-arm-eabi-4.62.4.tgz",
      "integrity": "sha512-RrPokAb7dmbxFoeO3TloqHyOjgye8RkBhSqmp4aJMIex4c9r46ZstPnleDQOq1t46VOVjwIuwNogIqbodV1Vvg==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ]
    },
    "node_modules/@rollup/rollup-android-arm64": {
      "version": "4.62.4",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-android-arm64/-/rollup-android-arm64-4.62.4.tgz",
      "integrity": "sha512-JKuJc+pnpks2pjy7L/N3v/cAkZxYlnmuZoD840ldbMI5KDbC4iO9NKwPKYdjYFCMAIIlBzYSFHxIJVYzRo2/8A==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ]
    },
    "node_modules/@rollup/rollup-darwin-arm64": {
      "version": "4.62.4",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-darwin-arm64/-/rollup-darwin-arm64-4.62.4.tgz",
      "integrity": "sha512-krw5uS2STmvJ02x0uTXHbqQNuz+9eZ1iw+qXk9dmW2gvV4jV7O2hEoOnuhFrpOPiel1mBFtqbxYZZtC46hXLOw==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ]
    },
    "node_modules/@rollup/rollup-darwin-x64": {
      "version": "4.62.4",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-darwin-x64/-/rollup-darwin-x64-4.62.4.tgz",
      "integrity": "sha512-wsTxtgApb4PrOsNJIm0FZ1h3WvCC+k9uxLJ4ad75hgoS4NiRes2SoJFlDAyMwiUY8IssDqGcHbXuN0sx1tfF1A==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ]
    },
    "node_modules/@rollup/rollup-freebsd-arm64": {
      "version": "4.62.4",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-freebsd-arm64/-/rollup-freebsd-arm64-4.62.4.tgz",
      "integrity": "sha512-GUOnQlyZe3yAXhWOtOMsn5Qkrv5E5mZXa0thbARWi5Ei2szlVXJFQhddZ4HbAzh8q92w5twp+CQvs/eFanz9YQ==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "freebsd"
      ]
    },
    "node_modules/@rollup/rollup-freebsd-x64": {
      "version": "4.62.4",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-freebsd-x64/-/rollup-freebsd-x64-4.62.4.tgz",
      "integrity": "sha512-/Y7f3QuxjzPKsjA/rfEDa3+0vXqyjmJ50Ln8dPpCmWkKTrUoWHG1cWhTqaAMLob2m2nESWuC7yGrREz019Ztqg==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "freebsd"
      ]
    },
    "node_modules/@rollup/rollup-linux-arm-gnueabihf": {
      "version": "4.62.4",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-arm-gnueabihf/-/rollup-linux-arm-gnueabihf-4.62.4.tgz",
      "integrity": "sha512-81wiiX3v7aqy+T+bT61TJ78yJjRquqFFTTbAPt08imfQQzkPIW8t6aJbkTagtCCrXMNc9D66+geqlK7ydLPNqA==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-arm-musleabihf": {
      "version": "4.62.4",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-arm-musleabihf/-/rollup-linux-arm-musleabihf-4.62.4.tgz",
      "integrity": "sha512-9kmDIvNZqdoHOBZgNtpTBeLWYO/LVipM3H/j62P8848/l/VPEQL6N3uxU9pvP1oZAsXyC2MEnFP3ovRjo7WYNQ==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-arm64-gnu": {
      "version": "4.62.4",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-arm64-gnu/-/rollup-linux-arm64-gnu-4.62.4.tgz",
      "integrity": "sha512-CcnXHWnXg69g+DX5VWL3FHts3qMRN2uVEHX+BZvGLdd07/gXkn3ePjYtO1LDJvxkGKVHMclKBRa1QUTH+6toYQ==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-arm64-musl": {
      "version": "4.62.4",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-arm64-musl/-/rollup-linux-arm64-musl-4.62.4.tgz",
      "integrity": "sha512-iFOibiHnTRuhrWLlRsOQFdZJJIa7S8OwkneJr4ocALP16u5yk6lWLINFwhHaEqBFMsKDUZofLkGos7+CPzGB3g==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-loong64-gnu": {
      "version": "4.62.4",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-loong64-gnu/-/rollup-linux-loong64-gnu-4.62.4.tgz",
      "integrity": "sha512-XnWYMI7euHlb5a871xPja+Gm7DRCFU+FGRrtS2sMq9N8FvqtpagUy6gD4YOemC5MRk9xbh8+jYMEJbigFQwsgA==",
      "cpu": [
        "loong64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-loong64-musl": {
      "version": "4.62.4",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-loong64-musl/-/rollup-linux-loong64-musl-4.62.4.tgz",
      "integrity": "sha512-qGDAlO0U8xedCcsdRm9oaoQY8DAx/QT7uIxJWhCdx0ceIWX783UC9QSYkdpzAe29wNiVfp24+bZdQmn49o45SQ==",
      "cpu": [
        "loong64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-ppc64-gnu": {
      "version": "4.62.4",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-ppc64-gnu/-/rollup-linux-ppc64-gnu-4.62.4.tgz",
      "integrity": "sha512-ru4H6ezD7ysA5EiEK6qkkaEb4modH8CTej6kUy/gQi20u3kB3G7Zn8snXXkeJSCOFKG/rbPPtM/+9Wgas1961w==",
      "cpu": [
        "ppc64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-ppc64-musl": {
      "version": "4.62.4",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-ppc64-musl/-/rollup-linux-ppc64-musl-4.62.4.tgz",
      "integrity": "sha512-2W4MO5WQVJnbJaZdvDb9rhBDuFU1nKIepPFpJUBsTh2k1YY2g+ODViaWuyOAjQ5cOP7NvrvLzt3wvHOoiAvc7w==",
      "cpu": [
        "ppc64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-riscv64-gnu": {
      "version": "4.62.4",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-riscv64-gnu/-/rollup-linux-riscv64-gnu-4.62.4.tgz",
      "integrity": "sha512-+fxjfuoAmVMCYV5QyjoIpu0cp5DOiOTeqYFk1AVaxGr+/ravWLX89XfQmptsoWcaVy/TGf2hexzbUOrCQIL1CQ==",
      "cpu": [
        "riscv64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-riscv64-musl": {
      "version": "4.62.4",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-riscv64-musl/-/rollup-linux-riscv64-musl-4.62.4.tgz",
      "integrity": "sha512-jTn8JfHGL4djjFxPuM06LmNUJDsst2jeVlsd9OmIH6zc5sC9K6rIuO4YajXatLUpBmBKl6b35ro1QZocLi+tcA==",
      "cpu": [
        "riscv64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-s390x-gnu": {
      "version": "4.62.4",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-s390x-gnu/-/rollup-linux-s390x-gnu-4.62.4.tgz",
      "integrity": "sha512-oCJCJL4pXsoDcP2QZ+JVlPTIRc6266zsIaeJJsWImmF7HO0W8nb6HuSgZlMWxJwaPf8ehbSw8yo0EUw925hKsA==",
      "cpu": [
        "s390x"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-x64-gnu": {
      "version": "4.62.4",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-x64-gnu/-/rollup-linux-x64-gnu-4.62.4.tgz",
      "integrity": "sha512-W69hukhZ3KKNRCaMIEzKvcFye42hh0FE1+YoYaf5+Ikacuftoco6yO/xouz0hc5d5W/s3yBro5jRiuEE/Q5vUw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-x64-musl": {
      "version": "4.62.4",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-x64-musl/-/rollup-linux-x64-musl-4.62.4.tgz",
      "integrity": "sha512-qiXbGG2jkjXhzXpsFZSR2Xpb8DN/UaxYsbb/STbuR/6fpaDgRmmaq1B/LmtF2wQFOFOSsK2jdE0RZ3a0zHn4QA==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-openbsd-x64": {
      "version": "4.62.4",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-openbsd-x64/-/rollup-openbsd-x64-4.62.4.tgz",
      "integrity": "sha512-nWeM//hxv8mIo6jD7Hu4o48DVmV9pbV6gsKaWU+4NFyqHoPKwrkRiZGLKUhOBk8qNmDmpwFtPKg80Bo/Tn4xiQ==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "openbsd"
      ]
    },
    "node_modules/@rollup/rollup-openharmony-arm64": {
      "version": "4.62.4",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-openharmony-arm64/-/rollup-openharmony-arm64-4.62.4.tgz",
      "integrity": "sha512-s62SQ/vgsRSvMwDkOEfTqfgASF0f26ZNaQuTA6Aok5lrikf89yI2W0gFHvZb2Jpgc6N8JnOKZgCK2iciO3CsxQ==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "openharmony"
      ]
    },
    "node_modules/@rollup/rollup-win32-arm64-msvc": {
      "version": "4.62.4",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-win32-arm64-msvc/-/rollup-win32-arm64-msvc-4.62.4.tgz",
      "integrity": "sha512-J6wGf8TVGbXJq+HH+ttTvrcfNKPbuZecV6KT1B8I18BC5IURUh5kl4Yl5OEP5eFIUoI5BWxCsyYMhFsDx8kekw==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ]
    },
    "node_modules/@rollup/rollup-win32-ia32-msvc": {
      "version": "4.62.4",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-win32-ia32-msvc/-/rollup-win32-ia32-msvc-4.62.4.tgz",
      "integrity": "sha512-zmfrQd/0wu6oJs8Vq8KwY/YtsKSsLtKe/HwAP4Wqy8LhWjeT55fHRAkOhYQ12wI3ayS4Tt12d5CDRD7N96SAYQ==",
      "cpu": [
        "ia32"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ]
    },
    "node_modules/@rollup/rollup-win32-x64-gnu": {
      "version": "4.62.4",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-win32-x64-gnu/-/rollup-win32-x64-gnu-4.62.4.tgz",
      "integrity": "sha512-qPzHqdj9rfUD+w79dtE07zi/kFwKyCJqplp5K5ygeLTp7jLpAoc16OAH39HSmRC9UpozaecsleI8uAdEj6v2yw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ]
    },
    "node_modules/@rollup/rollup-win32-x64-msvc": {
      "version": "4.62.4",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-win32-x64-msvc/-/rollup-win32-x64-msvc-4.62.4.tgz",
      "integrity": "sha512-zD6NdeWEByGE9QF9vCrlJ5YQB4oq9q91kPZS37Jwj5hOkvR1lTBSpsKhKDw4IJtbQ35LsTS1HD9DZYGKIshU1Q==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ]
    },
    "node_modules/@supabase/auth-js": {
      "version": "2.112.3",
      "resolved": "https://registry.npmjs.org/@supabase/auth-js/-/auth-js-2.112.3.tgz",
      "integrity": "sha512-NA0rsgAlWZPvbhw8aUdmgfpHVgUAcd8zK5ov43l++o1bLIPXZhRiAlRobhwF5AatQuovpqxsMH50F4oyyV4XZw==",
      "license": "MIT",
      "dependencies": {
        "tslib": "2.8.1"
      },
      "engines": {
        "node": ">=22.0.0"
      }
    },
    "node_modules/@supabase/functions-js": {
      "version": "2.112.3",
      "resolved": "https://registry.npmjs.org/@supabase/functions-js/-/functions-js-2.112.3.tgz",
      "integrity": "sha512-gfv481mTOVWtZIJgXupxZpni2V2UWPf6jeF/jOK7HdMHdH+mt6sU0sHHwf0POsPip8ltlulu9OUHgwVzl5ddRw==",
      "license": "MIT",
      "dependencies": {
        "tslib": "2.8.1"
      },
      "engines": {
        "node": ">=22.0.0"
      }
    },
    "node_modules/@supabase/phoenix": {
      "version": "0.4.5",
      "resolved": "https://registry.npmjs.org/@supabase/phoenix/-/phoenix-0.4.5.tgz",
      "integrity": "sha512-aAn9H9ovVyeApKy11OWOrrOGq8DV68yWeH4ud2lN9fzn4aO8Zb5GLL9m1pUg9nLqIcT+ZDfAcsZe0E/nqdv2lw==",
      "license": "MIT"
    },
    "node_modules/@supabase/postgrest-js": {
      "version": "2.112.3",
      "resolved": "https://registry.npmjs.org/@supabase/postgrest-js/-/postgrest-js-2.112.3.tgz",
      "integrity": "sha512-+Mf6uCpzr00bqxwX8hTK2X2L9eAL/1vuOjdEjx6upz9ulb0RmQT16XeU/JkMUlVHw/B46ZnPa2busY4Kd9YCzw==",
      "license": "MIT",
      "dependencies": {
        "tslib": "2.8.1"
      },
      "engines": {
        "node": ">=22.0.0"
      }
    },
    "node_modules/@supabase/realtime-js": {
      "version": "2.112.3",
      "resolved": "https://registry.npmjs.org/@supabase/realtime-js/-/realtime-js-2.112.3.tgz",
      "integrity": "sha512-E6wljXWs7DUOloyIB69i3YFInWE6IyCvgTAbQ0KYxOHv26FdA1KzEXTuzxrYEdf70t406Z9BRwUlGyclGF2FXA==",
      "license": "MIT",
      "dependencies": {
        "@supabase/phoenix": "0.4.5",
        "tslib": "2.8.1"
      },
      "engines": {
        "node": ">=22.0.0"
      }
    },
    "node_modules/@supabase/storage-js": {
      "version": "2.112.3",
      "resolved": "https://registry.npmjs.org/@supabase/storage-js/-/storage-js-2.112.3.tgz",
      "integrity": "sha512-oSK61tzlUvg+BWPqpKQCu9qqonsO26btaoAR9D6Gest2aj7xUqToj9rKyaoYOJczkhg9BjqA1REbYy9tPI4bDA==",
      "license": "MIT",
      "dependencies": {
        "iceberg-js": "^0.8.1",
        "tslib": "2.8.1"
      },
      "engines": {
        "node": ">=22.0.0"
      }
    },
    "node_modules/@supabase/supabase-js": {
      "version": "2.112.3",
      "resolved": "https://registry.npmjs.org/@supabase/supabase-js/-/supabase-js-2.112.3.tgz",
      "integrity": "sha512-Jv1bxVQmEJNkjvPEhFaKjPzsh+Ozyew6lWGD+SoYcsclDEP1z7yEvKvfUQfzy0DkxRIQnZNxmmWtAzw5XLTQoA==",
      "license": "MIT",
      "dependencies": {
        "@supabase/auth-js": "2.112.3",
        "@supabase/functions-js": "2.112.3",
        "@supabase/postgrest-js": "2.112.3",
        "@supabase/realtime-js": "2.112.3",
        "@supabase/storage-js": "2.112.3"
      },
      "engines": {
        "node": ">=22.0.0"
      },
      "peerDependencies": {
        "@opentelemetry/api": ">=1.0.0"
      },
      "peerDependenciesMeta": {
        "@opentelemetry/api": {
          "optional": true
        }
      }
    },
    "node_modules/@types/babel__core": {
      "version": "7.20.5",
      "resolved": "https://registry.npmjs.org/@types/babel__core/-/babel__core-7.20.5.tgz",
      "integrity": "sha512-qoQprZvz5wQFJwMDqeseRXWv3rqMvhgpbXFfVyWhbx9X47POIA6i/+dXefEmZKoAgOaTdaIgNSMqMIU61yRyzA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/parser": "^7.20.7",
        "@babel/types": "^7.20.7",
        "@types/babel__generator": "*",
        "@types/babel__template": "*",
        "@types/babel__traverse": "*"
      }
    },
    "node_modules/@types/babel__generator": {
      "version": "7.27.0",
      "resolved": "https://registry.npmjs.org/@types/babel__generator/-/babel__generator-7.27.0.tgz",
      "integrity": "sha512-ufFd2Xi92OAVPYsy+P4n7/U7e68fex0+Ee8gSG9KX7eo084CWiQ4sdxktvdl0bOPupXtVJPY19zk6EwWqUQ8lg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/types": "^7.0.0"
      }
    },
    "node_modules/@types/babel__template": {
      "version": "7.4.4",
      "resolved": "https://registry.npmjs.org/@types/babel__template/-/babel__template-7.4.4.tgz",
      "integrity": "sha512-h/NUaSyG5EyxBIp8YRxo4RMe2/qQgvyowRwVMzhYhBCONbW8PUsg4lkFMrhgZhUe5z3L3MiLDuvyJ/CaPa2A8A==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/parser": "^7.1.0",
        "@babel/types": "^7.0.0"
      }
    },
    "node_modules/@types/babel__traverse": {
      "version": "7.28.0",
      "resolved": "https://registry.npmjs.org/@types/babel__traverse/-/babel__traverse-7.28.0.tgz",
      "integrity": "sha512-8PvcXf70gTDZBgt9ptxJ8elBeBjcLOAcOtoO/mPJjtji1+CdGbHgm77om1GrsPxsiE+uXIpNSK64UYaIwQXd4Q==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/types": "^7.28.2"
      }
    },
    "node_modules/@types/estree": {
      "version": "1.0.9",
      "resolved": "https://registry.npmjs.org/@types/estree/-/estree-1.0.9.tgz",
      "integrity": "sha512-GhdPgy1el4/ImP05X05Uw4cw2/M93BCUmnEvWZNStlCzEKME4Fkk+YpoA5OiHNQmoS7Cafb8Xa3Pya8m1Qrzeg==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@vitejs/plugin-react": {
      "version": "4.7.0",
      "resolved": "https://registry.npmjs.org/@vitejs/plugin-react/-/plugin-react-4.7.0.tgz",
      "integrity": "sha512-gUu9hwfWvvEDBBmgtAowQCojwZmJ5mcLn3aufeCsitijs3+f2NsrPtlAWIR6OPiqljl96GVCUbLe0HyqIpVaoA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/core": "^7.28.0",
        "@babel/plugin-transform-react-jsx-self": "^7.27.1",
        "@babel/plugin-transform-react-jsx-source": "^7.27.1",
        "@rolldown/pluginutils": "1.0.0-beta.27",
        "@types/babel__core": "^7.20.5",
        "react-refresh": "^0.17.0"
      },
      "engines": {
        "node": "^14.18.0 || >=16.0.0"
      },
      "peerDependencies": {
        "vite": "^4.2.0 || ^5.0.0 || ^6.0.0 || ^7.0.0"
      }
    },
    "node_modules/baseline-browser-mapping": {
      "version": "2.11.14",
      "resolved": "https://registry.npmjs.org/baseline-browser-mapping/-/baseline-browser-mapping-2.11.14.tgz",
      "integrity": "sha512-JyJ954WzuIR8/FFzX0o5krdSTrBAkcCSRfWSleRsIHSWV+cZe2FI1PKggVkFke1hBldRs+LRxUczzE9iPmgZww==",
      "dev": true,
      "license": "Apache-2.0",
      "bin": {
        "baseline-browser-mapping": "dist/cli.cjs"
      },
      "engines": {
        "node": ">=6.0.0"
      }
    },
    "node_modules/browserslist": {
      "version": "4.28.8",
      "resolved": "https://registry.npmjs.org/browserslist/-/browserslist-4.28.8.tgz",
      "integrity": "sha512-V2NpofLblG64mfOtSgDhOJESZEGogzDMBv/q+W6oc4LXWP/q75eOXoOaaOu1EOadB9U4Bwx/e0yzbvwKH8zalA==",
      "dev": true,
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/browserslist"
        },
        {
          "type": "tidelift",
          "url": "https://tidelift.com/funding/github/npm/browserslist"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "baseline-browser-mapping": "^2.11.12",
        "caniuse-lite": "^1.0.30001809",
        "electron-to-chromium": "^1.5.402",
        "node-releases": "^2.0.53",
        "update-browserslist-db": "^1.3.0"
      },
      "bin": {
        "browserslist": "cli.js"
      },
      "engines": {
        "node": "^6 || ^7 || ^8 || ^9 || ^10 || ^11 || ^12 || >=13.7"
      }
    },
    "node_modules/caniuse-lite": {
      "version": "1.0.30001809",
      "resolved": "https://registry.npmjs.org/caniuse-lite/-/caniuse-lite-1.0.30001809.tgz",
      "integrity": "sha512-xxWVywk6a6Arlk+hymeycyn/VgqEfLDxupvhH/xiY5SJ/18kmi9o6MiO320DCUzypORHLtvh0I4i04tUhCNHNQ==",
      "dev": true,
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/browserslist"
        },
        {
          "type": "tidelift",
          "url": "https://tidelift.com/funding/github/npm/caniuse-lite"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "CC-BY-4.0"
    },
    "node_modules/convert-source-map": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/convert-source-map/-/convert-source-map-2.0.0.tgz",
      "integrity": "sha512-Kvp459HrV2FEJ1CAsi1Ku+MY3kasH19TFykTz2xWmMeq6bk2NU3XXvfJ+Q61m0xktWwt+1HSYf3JZsTms3aRJg==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/debug": {
      "version": "4.4.3",
      "resolved": "https://registry.npmjs.org/debug/-/debug-4.4.3.tgz",
      "integrity": "sha512-RGwwWnwQvkVfavKVt22FGLw+xYSdzARwm0ru6DhTVA3umU5hZc28V3kO4stgYryrTlLpuvgI9GiijltAjNbcqA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "ms": "^2.1.3"
      },
      "engines": {
        "node": ">=6.0"
      },
      "peerDependenciesMeta": {
        "supports-color": {
          "optional": true
        }
      }
    },
    "node_modules/electron-to-chromium": {
      "version": "1.5.408",
      "resolved": "https://registry.npmjs.org/electron-to-chromium/-/electron-to-chromium-1.5.408.tgz",
      "integrity": "sha512-SLoprcYpJ/OH2v2ps0+N5biv9H4/KBT3+YmmDew64TwK5y9j2wv7pMOFY7IorVkyMtEyLSCRlXKLsNlakeAlPw==",
      "dev": true,
      "license": "ISC"
    },
    "node_modules/esbuild": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/esbuild/-/esbuild-0.21.5.tgz",
      "integrity": "sha512-mg3OPMV4hXywwpoDxu3Qda5xCKQi+vCTZq8S9J/EpkhB2HzKXq4SNFZE3+NK93JYxc8VMSep+lOUSC/RVKaBqw==",
      "dev": true,
      "hasInstallScript": true,
      "license": "MIT",
      "bin": {
        "esbuild": "bin/esbuild"
      },
      "engines": {
        "node": ">=12"
      },
      "optionalDependencies": {
        "@esbuild/aix-ppc64": "0.21.5",
        "@esbuild/android-arm": "0.21.5",
        "@esbuild/android-arm64": "0.21.5",
        "@esbuild/android-x64": "0.21.5",
        "@esbuild/darwin-arm64": "0.21.5",
        "@esbuild/darwin-x64": "0.21.5",
        "@esbuild/freebsd-arm64": "0.21.5",
        "@esbuild/freebsd-x64": "0.21.5",
        "@esbuild/linux-arm": "0.21.5",
        "@esbuild/linux-arm64": "0.21.5",
        "@esbuild/linux-ia32": "0.21.5",
        "@esbuild/linux-loong64": "0.21.5",
        "@esbuild/linux-mips64el": "0.21.5",
        "@esbuild/linux-ppc64": "0.21.5",
        "@esbuild/linux-riscv64": "0.21.5",
        "@esbuild/linux-s390x": "0.21.5",
        "@esbuild/linux-x64": "0.21.5",
        "@esbuild/netbsd-x64": "0.21.5",
        "@esbuild/openbsd-x64": "0.21.5",
        "@esbuild/sunos-x64": "0.21.5",
        "@esbuild/win32-arm64": "0.21.5",
        "@esbuild/win32-ia32": "0.21.5",
        "@esbuild/win32-x64": "0.21.5"
      }
    },
    "node_modules/escalade": {
      "version": "3.2.0",
      "resolved": "https://registry.npmjs.org/escalade/-/escalade-3.2.0.tgz",
      "integrity": "sha512-WUj2qlxaQtO4g6Pq5c29GTcWGDyd8itL8zTlipgECz3JesAiiOKotd8JU6otB3PACgG6xkJUyVhboMS+bje/jA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/fsevents": {
      "version": "2.3.3",
      "resolved": "https://registry.npmjs.org/fsevents/-/fsevents-2.3.3.tgz",
      "integrity": "sha512-5xoDfX+fL7faATnagmWPpbFtwh/R77WmMMqqHGS65C3vvB0YHrgF+B1YmZ3441tMj5n63k0212XNoJwzlhffQw==",
      "dev": true,
      "hasInstallScript": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": "^8.16.0 || ^10.6.0 || >=11.0.0"
      }
    },
    "node_modules/gensync": {
      "version": "1.0.0-beta.2",
      "resolved": "https://registry.npmjs.org/gensync/-/gensync-1.0.0-beta.2.tgz",
      "integrity": "sha512-3hN7NaskYvMDLQY55gnW3NQ+mesEAepTqlg+VEbj7zzqEMBVNhzcGYYeqFo/TlYz6eQiFcp1HcsCZO+nGgS8zg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/iceberg-js": {
      "version": "0.8.1",
      "resolved": "https://registry.npmjs.org/iceberg-js/-/iceberg-js-0.8.1.tgz",
      "integrity": "sha512-1dhVQZXhcHje7798IVM+xoo/1ZdVfzOMIc8/rgVSijRK38EDqOJoGula9N/8ZI5RD8QTxNQtK/Gozpr+qUqRRA==",
      "license": "MIT",
      "engines": {
        "node": ">=20.0.0"
      }
    },
    "node_modules/js-tokens": {
      "version": "4.0.0",
      "resolved": "https://registry.npmjs.org/js-tokens/-/js-tokens-4.0.0.tgz",
      "integrity": "sha512-RdJUflcE3cUzKiMqQgsCu06FPu9UdIJO0beYbPhHN4k6apgJtifcoCtT9bcxOpYBtpD2kCM6Sbzg4CausW/PKQ==",
      "license": "MIT"
    },
    "node_modules/jsesc": {
      "version": "3.1.0",
      "resolved": "https://registry.npmjs.org/jsesc/-/jsesc-3.1.0.tgz",
      "integrity": "sha512-/sM3dO2FOzXjKQhJuo0Q173wf2KOo8t4I8vHy6lF9poUp7bKT0/NHE8fPX23PwfhnykfqnC2xRxOnVw5XuGIaA==",
      "dev": true,
      "license": "MIT",
      "bin": {
        "jsesc": "bin/jsesc"
      },
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/json5": {
      "version": "2.2.3",
      "resolved": "https://registry.npmjs.org/json5/-/json5-2.2.3.tgz",
      "integrity": "sha512-XmOWe7eyHYH14cLdVPoyg+GOH3rYX++KpzrylJwSW98t3Nk+U8XOl8FWKOgwtzdb8lXGf6zYwDUzeHMWfxasyg==",
      "dev": true,
      "license": "MIT",
      "bin": {
        "json5": "lib/cli.js"
      },
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/loose-envify": {
      "version": "1.4.0",
      "resolved": "https://registry.npmjs.org/loose-envify/-/loose-envify-1.4.0.tgz",
      "integrity": "sha512-lyuxPGr/Wfhrlem2CL/UcnUc1zcqKAImBDzukY7Y5F/yQiNdko6+fRLevlw1HgMySw7f611UIY408EtxRSoK3Q==",
      "license": "MIT",
      "dependencies": {
        "js-tokens": "^3.0.0 || ^4.0.0"
      },
      "bin": {
        "loose-envify": "cli.js"
      }
    },
    "node_modules/lru-cache": {
      "version": "5.1.1",
      "resolved": "https://registry.npmjs.org/lru-cache/-/lru-cache-5.1.1.tgz",
      "integrity": "sha512-KpNARQA3Iwv+jTA0utUVVbrh+Jlrr1Fv0e56GGzAFOXN7dk/FviaDW8LHmK52DlcH4WP2n6gI8vN1aesBFgo9w==",
      "dev": true,
      "license": "ISC",
      "dependencies": {
        "yallist": "^3.0.2"
      }
    },
    "node_modules/ms": {
      "version": "2.1.3",
      "resolved": "https://registry.npmjs.org/ms/-/ms-2.1.3.tgz",
      "integrity": "sha512-6FlzubTLZG3J2a/NVCAleEhjzq5oxgHyaCU9yYXvcLsvoVaHJq/s5xXI6/XXP6tz7R9xAOtHnSO/tXtF3WRTlA==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/nanoid": {
      "version": "3.3.18",
      "resolved": "https://registry.npmjs.org/nanoid/-/nanoid-3.3.18.tgz",
      "integrity": "sha512-DTg4MJbGMWkfi6VZFdNt2/caMbQy4Ou+Op/hJQvGEWcnVfoA1QA+xzRKAzw9jD6+GVOOeYr/mIcuDSdug6F6+w==",
      "dev": true,
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "bin": {
        "nanoid": "bin/nanoid.cjs"
      },
      "engines": {
        "node": "^10 || ^12 || ^13.7 || ^14 || >=15.0.1"
      }
    },
    "node_modules/node-releases": {
      "version": "2.0.53",
      "resolved": "https://registry.npmjs.org/node-releases/-/node-releases-2.0.53.tgz",
      "integrity": "sha512-D9UOmYG3UH1V+ENW56t5QXBwJw1YEY18ruVeus89Rw+SyIgjPkCO84bRzO3uNIYosJbNwiabWVn48o3uJLjxFQ==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/picocolors": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/picocolors/-/picocolors-1.1.1.tgz",
      "integrity": "sha512-xceH2snhtb5M9liqDsmEw56le376mTZkEX/jEb/RxNFyegNul7eNslCXP9FDj/Lcu0X8KEyMceP2ntpaHrDEVA==",
      "dev": true,
      "license": "ISC"
    },
    "node_modules/postcss": {
      "version": "8.5.26",
      "resolved": "https://registry.npmjs.org/postcss/-/postcss-8.5.26.tgz",
      "integrity": "sha512-u82N74LFzG8ca+dD8puPnplTXoGH4fTPpVGuIbt36G3qvNlkvfD0lEAZSxaly3KX8TS/L1A1gsCEmvKmBcVbkQ==",
      "dev": true,
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/postcss/"
        },
        {
          "type": "tidelift",
          "url": "https://tidelift.com/funding/github/npm/postcss"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "nanoid": "^3.3.17",
        "picocolors": "^1.1.1",
        "source-map-js": "^1.2.1"
      },
      "engines": {
        "node": "^10 || ^12 || >=14"
      }
    },
    "node_modules/react": {
      "version": "18.3.1",
      "resolved": "https://registry.npmjs.org/react/-/react-18.3.1.tgz",
      "integrity": "sha512-wS+hAgJShR0KhEvPJArfuPVN1+Hz1t0Y6n5jLrGQbkb4urgPE/0Rve+1kMB1v/oWgHgm4WIcV+i7F2pTVj+2iQ==",
      "license": "MIT",
      "dependencies": {
        "loose-envify": "^1.1.0"
      },
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/react-dom": {
      "version": "18.3.1",
      "resolved": "https://registry.npmjs.org/react-dom/-/react-dom-18.3.1.tgz",
      "integrity": "sha512-5m4nQKp+rZRb09LNH59GM4BxTh9251/ylbKIbpe7TpGxfJ+9kv6BLkLBXIjjspbgbnIBNqlI23tRnTWT0snUIw==",
      "license": "MIT",
      "dependencies": {
        "loose-envify": "^1.1.0",
        "scheduler": "^0.23.2"
      },
      "peerDependencies": {
        "react": "^18.3.1"
      }
    },
    "node_modules/react-refresh": {
      "version": "0.17.0",
      "resolved": "https://registry.npmjs.org/react-refresh/-/react-refresh-0.17.0.tgz",
      "integrity": "sha512-z6F7K9bV85EfseRCp2bzrpyQ0Gkw1uLoCel9XBVWPg/TjRj94SkJzUTGfOa4bs7iJvBWtQG0Wq7wnI0syw3EBQ==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/rollup": {
      "version": "4.62.4",
      "resolved": "https://registry.npmjs.org/rollup/-/rollup-4.62.4.tgz",
      "integrity": "sha512-RXOqwaPsBGjMNMa4sQjDjHieHEZDFoj/Rdr46l2MU5DfEs16wHJPC2RPTPHWhNl+M3aI472LLqFkFKut4SblOg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@types/estree": "1.0.9"
      },
      "bin": {
        "rollup": "dist/bin/rollup"
      },
      "engines": {
        "node": ">=18.0.0",
        "npm": ">=8.0.0"
      },
      "optionalDependencies": {
        "@napi-rs/lzma-linux-x64-gnu": "1.5.1",
        "@rollup/rollup-android-arm-eabi": "4.62.4",
        "@rollup/rollup-android-arm64": "4.62.4",
        "@rollup/rollup-darwin-arm64": "4.62.4",
        "@rollup/rollup-darwin-x64": "4.62.4",
        "@rollup/rollup-freebsd-arm64": "4.62.4",
        "@rollup/rollup-freebsd-x64": "4.62.4",
        "@rollup/rollup-linux-arm-gnueabihf": "4.62.4",
        "@rollup/rollup-linux-arm-musleabihf": "4.62.4",
        "@rollup/rollup-linux-arm64-gnu": "4.62.4",
        "@rollup/rollup-linux-arm64-musl": "4.62.4",
        "@rollup/rollup-linux-loong64-gnu": "4.62.4",
        "@rollup/rollup-linux-loong64-musl": "4.62.4",
        "@rollup/rollup-linux-ppc64-gnu": "4.62.4",
        "@rollup/rollup-linux-ppc64-musl": "4.62.4",
        "@rollup/rollup-linux-riscv64-gnu": "4.62.4",
        "@rollup/rollup-linux-riscv64-musl": "4.62.4",
        "@rollup/rollup-linux-s390x-gnu": "4.62.4",
        "@rollup/rollup-linux-x64-gnu": "4.62.4",
        "@rollup/rollup-linux-x64-musl": "4.62.4",
        "@rollup/rollup-openbsd-x64": "4.62.4",
        "@rollup/rollup-openharmony-arm64": "4.62.4",
        "@rollup/rollup-win32-arm64-msvc": "4.62.4",
        "@rollup/rollup-win32-ia32-msvc": "4.62.4",
        "@rollup/rollup-win32-x64-gnu": "4.62.4",
        "@rollup/rollup-win32-x64-msvc": "4.62.4",
        "fsevents": "~2.3.2"
      }
    },
    "node_modules/scheduler": {
      "version": "0.23.2",
      "resolved": "https://registry.npmjs.org/scheduler/-/scheduler-0.23.2.tgz",
      "integrity": "sha512-UOShsPwz7NrMUqhR6t0hWjFduvOzbtv7toDH1/hIrfRNIDBnnBWd0CwJTGvTpngVlmwGCdP9/Zl/tVrDqcuYzQ==",
      "license": "MIT",
      "dependencies": {
        "loose-envify": "^1.1.0"
      }
    },
    "node_modules/semver": {
      "version": "6.3.1",
      "resolved": "https://registry.npmjs.org/semver/-/semver-6.3.1.tgz",
      "integrity": "sha512-BR7VvDCVHO+q2xBEWskxS6DJE1qRnb7DxzUrogb71CWoSficBxYsiAGd+Kl0mmq/MprG9yArRkyrQxTO6XjMzA==",
      "dev": true,
      "license": "ISC",
      "bin": {
        "semver": "bin/semver.js"
      }
    },
    "node_modules/source-map-js": {
      "version": "1.2.1",
      "resolved": "https://registry.npmjs.org/source-map-js/-/source-map-js-1.2.1.tgz",
      "integrity": "sha512-UXWMKhLOwVKb728IUtQPXxfYU+usdybtUrK/8uGE8CQMvrhOpwvzDBwj0QhSL7MQc7vIsISBG8VQ8+IDQxpfQA==",
      "dev": true,
      "license": "BSD-3-Clause",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/tslib": {
      "version": "2.8.1",
      "resolved": "https://registry.npmjs.org/tslib/-/tslib-2.8.1.tgz",
      "integrity": "sha512-oJFu94HQb+KVduSUQL7wnpmqnfmLsOA/nAh6b6EH0wCEoK0/mPeXU6c3wKDV83MkOuHPRHtSXKKU99IBazS/2w==",
      "license": "0BSD"
    },
    "node_modules/update-browserslist-db": {
      "version": "1.3.1",
      "resolved": "https://registry.npmjs.org/update-browserslist-db/-/update-browserslist-db-1.3.1.tgz",
      "integrity": "sha512-ZZ61DsRsOnakl74HAmp3oSN4aXUmEWXf+i/yv0h7tIBfICc3VdrFErQKUUKPgu3AMsTUMbcongALEN4l6GSUrQ==",
      "dev": true,
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/browserslist"
        },
        {
          "type": "tidelift",
          "url": "https://tidelift.com/funding/github/npm/browserslist"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "escalade": "^3.2.0",
        "picocolors": "^1.1.1"
      },
      "bin": {
        "update-browserslist-db": "cli.js"
      },
      "peerDependencies": {
        "browserslist": ">= 4.21.0"
      }
    },
    "node_modules/vite": {
      "version": "5.4.21",
      "resolved": "https://registry.npmjs.org/vite/-/vite-5.4.21.tgz",
      "integrity": "sha512-o5a9xKjbtuhY6Bi5S3+HvbRERmouabWbyUcpXXUA1u+GNUKoROi9byOJ8M0nHbHYHkYICiMlqxkg1KkYmm25Sw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "esbuild": "^0.21.3",
        "postcss": "^8.4.43",
        "rollup": "^4.20.0"
      },
      "bin": {
        "vite": "bin/vite.js"
      },
      "engines": {
        "node": "^18.0.0 || >=20.0.0"
      },
      "funding": {
        "url": "https://github.com/vitejs/vite?sponsor=1"
      },
      "optionalDependencies": {
        "fsevents": "~2.3.3"
      },
      "peerDependencies": {
        "@types/node": "^18.0.0 || >=20.0.0",
        "less": "*",
        "lightningcss": "^1.21.0",
        "sass": "*",
        "sass-embedded": "*",
        "stylus": "*",
        "sugarss": "*",
        "terser": "^5.4.0"
      },
      "peerDependenciesMeta": {
        "@types/node": {
          "optional": true
        },
        "less": {
          "optional": true
        },
        "lightningcss": {
          "optional": true
        },
        "sass": {
          "optional": true
        },
        "sass-embedded": {
          "optional": true
        },
        "stylus": {
          "optional": true
        },
        "sugarss": {
          "optional": true
        },
        "terser": {
          "optional": true
        }
      }
    },
    "node_modules/yallist": {
      "version": "3.1.1",
      "resolved": "https://registry.npmjs.org/yallist/-/yallist-3.1.1.tgz",
      "integrity": "sha512-a4UGQaWPH59mOXUYnAG2ewncQS4i4F43Tv3JoAM+s2VDAmS9NsK8GpDMLrCHPksFT7h3K6TOoUNn2pb7RoXx4g==",
      "dev": true,
      "license": "ISC"
    }
  }
}
