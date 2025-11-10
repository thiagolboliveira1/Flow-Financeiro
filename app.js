
const LS={ entradas:"flow:v9_2:entradas",despesas:"flow:v9_2:despesas",parcelas:"flow:v9_2:parcelas",metas:"flow:v9_2:metas",cfg:"flow:v9_2:cfg" };
const qs=(s,el=document)=>el.querySelector(s); const qsa=(s,el=document)=>[...el.querySelectorAll(s)];
const cfg=Object.assign({dizimo:10, autoApply:false, alloc:{}}, JSON.parse(localStorage.getItem(LS.cfg)||"{}"));
let entradas=JSON.parse(localStorage.getItem(LS.entradas)||"[]");
let despesas=JSON.parse(localStorage.getItem(LS.despesas)||"[]");
let parcelas=JSON.parse(localStorage.getItem(LS.parcelas)||"[]");
let metas=JSON.parse(localStorage.getItem(LS.metas)||"[]");

function save(){ localStorage.setItem(LS.entradas,JSON.stringify(entradas)); localStorage.setItem(LS.despesas,JSON.stringify(despesas)); localStorage.setItem(LS.parcelas,JSON.stringify(parcelas)); localStorage.setItem(LS.metas,JSON.stringify(metas)); localStorage.setItem(LS.cfg,JSON.stringify(cfg)); }
function uid(){ return Math.random().toString(36).slice(2,9); }
function money(n){ return Number(n||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'}); }
function curMonth(){ return (qs('#filterMonth').value || new Date().toISOString().slice(0,7)); }
function monthFilter(arr, key){ const m=curMonth(); return arr.filter(x=>(x[key]||'').startsWith(m)); }

(function seedOnce(){
  if(!localStorage.getItem(LS.parcelas)){
    parcelas=[
      {id:uid(),nome:"Ailos (acordo — não conta corrente)",parcela:196.63,total:24,pagas:2,vencDia:20},
      {id:uid(),nome:"Carro",parcela:767.32,total:48,pagas:22,vencDia:15}
    ];
  }
  if(!localStorage.getItem(LS.metas)){
    metas=[
      {id:uid(),nome:"Serasa — Thiago (Claro)",alvo:325.52,pago:0},
      {id:uid(),nome:"Serasa — Thiago (Shopee)",alvo:173.59,pago:0},
      {id:uid(),nome:"Serasa — Adriele",alvo:3000.00,pago:0},
      {id:uid(),nome:"Acordo Andrey",alvo:3000.00,pago:0},
      {id:uid(),nome:"Acordo Gabriel",alvo:2000.00,pago:0},
      {id:uid(),nome:"Manutenção preventiva carro",alvo:2300.00,pago:0},
      {id:uid(),nome:"DPVAT + Multa",alvo:232.50,pago:0},
      {id:uid(),nome:"13º Thiago",alvo:5000.00,pago:0},
      {id:uid(),nome:"Viagem",alvo:2500.00,pago:0},
      {id:uid(),nome:"Reserva",alvo:3000.00,pago:0}
    ];
  }
  if(!localStorage.getItem(LS.despesas)){
    const ym = new Date().toISOString().slice(0,7);
    const d=(day)=>{ const [y,m]=ym.split('-'); return `${y}-${m}-${String(day).padStart(2,'0')}`; };
    despesas=[
      {id:uid(),date:d(1),categoria:"Aluguel",kind:"fixa",valor:1600.00, due:d(10), obs:"Fixa"},
      {id:uid(),date:d(1),categoria:"Luz",kind:"variavel",valor:278.96, due:d(10), obs:"Valor variável"},
      {id:uid(),date:d(1),categoria:"Água",kind:"variavel",valor:253.88, due:d(12), obs:"Valor variável"},
      {id:uid(),date:d(1),categoria:"Mercado",kind:"variavel",valor:500.00, due:d(5), obs:"Estimado"},
      {id:uid(),date:d(1),categoria:"Internet/Telefone",kind:"fixa",valor:128.99, due:d(15), obs:"Fixa"},
      {id:uid(),date:d(1),categoria:"Carro (parcela fixa)",kind:"fixa",valor:767.32, due:`${ym}-15`, obs:"22/48 pagas"},
      {id:uid(),date:d(1),categoria:"Cartão Nubank",kind:"variavel",valor:232.78, due:d(20), obs:"Fatura"},
      {id:uid(),date:d(1),categoria:"Ailos (acordo)",kind:"fixa",valor:196.63, due:`${ym}-20`, obs:"3/24"},
      {id:uid(),date:d(1),categoria:"Internet TIM móvel",kind:"fixa",valor:48.99, due:d(10), obs:"Fixa"},
      {id:uid(),date:d(1),categoria:"Cartão Gabriel Sofá",kind:"fixa",valor:250.00, due:d(25), obs:"Fixa"},
      {id:uid(),date:d(1),categoria:"Lazer",kind:"variavel",valor:150.00, due:d(30), obs:"Orçado"},
      {id:uid(),date:d(1),categoria:"Delivery",kind:"variavel",valor:0.00, due:d(30), obs:"Variável"},
      {id:uid(),date:d(1),categoria:"Farmácia",kind:"variavel",valor:150.00, due:d(30), obs:"Este mês"},
      {id:uid(),date:d(1),categoria:"Gasolina",kind:"variavel",valor:250.00, due:d(30), obs:"Variável"},
      {id:uid(),date:d(1),categoria:"Empréstimo Jeitto",kind:"fixa",valor:221.10, due:d(10), obs:"Venc. 10/11"},
      {id:uid(),date:d(1),categoria:"Empréstimo W (2x)",kind:"fixa",valor:300.00, due:d(28), obs:"2x"},
      {id:uid(),date:d(1),categoria:"MEI",kind:"fixa",valor:100.00, due:d(20), obs:"Regularizar"},
      {id:uid(),date:d(1),categoria:"Shopee (controle)",kind:"variavel",valor:0.00, due:d(30), obs:"Gastos Shopee do mês"},
      {id:uid(),date:d(1),categoria:"DPVAT + Multa",kind:"fixa",valor:232.50, due:`${ym}-10`, obs:"DPVAT 94,61 + Multa 137,89"},
      {id:uid(),date:d(1),categoria:"Manutenção preventiva carro",kind:"variavel",valor:2300.00, due:d(30), obs:"Pode parcelar"}
    ];
  }
  save();
})();

function totals(){ const e=monthFilter(entradas,'date'), d=monthFilter(despesas,'date'); const rate=cfg.dizimo/100; let bruto=0,diz=0,liq=0; e.forEach(x=>{ bruto+=x.entrada; const dz=x.entrada*rate; diz+=dz; liq+=(x.entrada-dz); }); const dTot=d.reduce((s,x)=>s+x.valor,0); return {bruto,diz,liq,desp:dTot,saldo:liq-dTot}; }

function renderResumo(){ const t=totals(); const k=qs('#kpis'); if(k){ k.innerHTML=`<span class='badge'>Bruto: <b>${money(t.bruto)}</b></span><span class='badge'>Dízimo: <b>${money(t.diz)}</b></span><span class='badge'>Líquido: <b>${money(t.liq)}</b></span><span class='badge'>Despesas: <b>${money(t.desp)}</b></span><span class='badge'>Saldo: <b>${money(t.saldo)}</b></span>`;} drawChart(); renderAlerts(); }

function renderEntradas(){ const wrap=qs('#listaEntradas'); if(!wrap) return; wrap.innerHTML=""; const rate=cfg.dizimo/100;
  monthFilter(entradas,'date').sort((a,b)=>a.date.localeCompare(b.date)).forEach(e=>{
    const dz=+(e.entrada*rate).toFixed(2), lq=+(e.entrada-dz).toFixed(2), rest=Math.max(0,+(e.total-e.entrada).toFixed(2)), pct=e.total>0?Math.round((e.entrada/e.total)*100):0;
    const el=document.createElement('div'); el.className='item';
    el.innerHTML=`<div class='top'><strong>${e.owner} — ${e.cliente}</strong><div><button class='mini del' style='padding:6px 10px;border-radius:10px;border:1px solid #e5b'>Excluir</button></div></div>
    <div class='meta'><span class='badge'>${e.date}</span><span class='badge'>${e.forma}</span></div>
    <div class='meta'><span>Total: <b>${money(e.total)}</b></span><span>Entrada: <b>${money(e.entrada)}</b></span><span>Resta: <b>${money(rest)}</b></span><span>Recebido: <b>${pct}%</b></span></div>
    <div class='meta'><span>Dízimo (${cfg.dizimo}%): <b>${money(dz)}</b></span><span>Líquido: <b>${money(lq)}</b></span></div>`;
    el.querySelector('.del').onclick=()=>{ entradas=entradas.filter(x=>x.id!==e.id); save(); renderAll(); };
    wrap.appendChild(el);
  });
}

function renderDespesas(){ const wrap=qs('#listaDespesas'); if(!wrap) return; wrap.innerHTML="";
  monthFilter(despesas,'date').sort((a,b)=>a.date.localeCompare(b.date)).forEach(d=>{
    const el=document.createElement('div'); el.className='item';
    el.innerHTML=`<div class='top'><strong>${d.categoria}</strong><div><button class='mini del' style='padding:6px 10px;border:1px solid #e5b;border-radius:10px'>Excluir</button></div></div>
    <div class='meta'><span class='badge'>${d.kind==='fixa'?'Fixa':'Variável'}</span>${d.due?`<span class='badge'>Venc.: ${d.due}</span>`:''}</div>
    <div class='meta'><span><b>${money(d.valor)}</b></span><span>${d.obs||''}</span></div>`;
    el.querySelector('.del').onclick=()=>{ despesas=despesas.filter(x=>x.id!==d.id); save(); renderAll(); };
    wrap.appendChild(el);
  });
}

function renderParcelas(){ const wrap=qs('#listaParcelas'); if(!wrap) return; wrap.innerHTML="";
  parcelas.forEach(p=>{
    const total=+(p.parcela*p.total).toFixed(2), pago=+(p.parcela*(p.pagas||0)).toFixed(2), rest=Math.max(0, +(total-pago).toFixed(2)), left=Math.max(0,(p.total-(p.pagas||0))), pct=p.total>0?Math.round(((p.pagas||0)/p.total)*100):0;
    const el=document.createElement('div'); el.className='item';
    el.innerHTML=`<div class='top'><strong contenteditable='true' data-field='nome'>${p.nome}</strong>
      <div><button class='mini undo' style='padding:8px 10px;border-radius:10px;border:1px solid #fcc'>-1 desfazer</button>
      <button class='mini pay' style='padding:8px 12px;border-radius:10px;border:1px solid #9cf'>+1 paga</button></div></div>
      <div class='meta'>
        <span class='badge'>Parcela: <input data-field='parcela' type='number' step='0.01' value='${p.parcela}' style='width:110px'></span>
        <span class='badge'>Total: <input data-field='total' type='number' step='1' min='1' value='${p.total}' style='width:70px'></span>
        <span class='badge'>Pagas: <input data-field='pagas' type='number' step='1' min='0' value='${p.pagas||0}' style='width:70px'></span>
        <span class='badge'>Venc. dia <input data-field='vencDia' type='number' step='1' min='1' max='31' value='${p.vencDia||""}' style='width:60px'></span>
        <button class='mini saveParc' style='padding:6px 10px;border:1px solid #9dd;border-radius:10px'>Salvar</button>
      </div>
      <div class='meta'><span>Total: <b>${money(total)}</b></span><span>Pago: <b>${money(pago)}</b></span><span>Restante: <b>${money(rest)}</b></span><span>Restantes: <b>${left}x</b></span></div>
      <div class='progress'><div class='bar' style='width:${pct}%'></div></div>`;
    el.querySelector('.pay').onclick=()=>{ p.pagas=Math.min(p.total,(p.pagas||0)+1); save(); renderAll(); };
    el.querySelector('.undo').onclick=()=>{ p.pagas=Math.max(0,(p.pagas||0)-1); save(); renderAll(); };
    el.querySelector('.saveParc').onclick=()=>{
      const get=(name)=>el.querySelector(`[data-field='${name}']`);
      p.nome = el.querySelector("[data-field='nome']").textContent.trim();
      p.parcela = Number(get('parcela').value||0);
      p.total = parseInt(get('total').value||'1');
      p.pagas = parseInt(get('pagas').value||'0')||0;
      const vd = parseInt(get('vencDia').value||'0'); p.vencDia = vd>0?vd:undefined;
      save(); renderAll();
    };
    wrap.appendChild(el);
  });
}

function renderMetas(){ const wrap=qs('#metas'); if(!wrap) return; wrap.innerHTML="";
  metas.forEach(m=>{
    const pct=m.alvo>0?Math.round(((m.pago||0)/m.alvo)*100):0; const id=m.id;
    const el=document.createElement('div'); el.className='item';
    el.innerHTML=`<div class='top'><strong contenteditable='true' data-field='nome'>${m.nome}</strong><span class='badge'>Progresso: ${pct}%</span></div>
      <div class='meta'><span class='badge'>Alvo: <input data-field='alvo' type='number' step='0.01' value='${m.alvo}' style='width:120px'></span>
      <span class='badge'>Acumulado: ${money(m.pago||0)}</span>
      <button class='mini saveMeta' style='padding:6px 10px;border:1px solid #9dd;border-radius:10px'>Salvar</button></div>
      <div class='progress'><div class='bar' style='width:${pct}%'></div></div>
      <div class='top'><label>Valor (R$): <input type='number' step='0.01' inputmode='decimal' id='dep_${id}' style='width:140px'></label>
        <div><button class='primary' id='btnAdd_${id}'>Depositar</button> <button id='btnSub_${id}'>Retirar</button></div>
      </div>`;
    el.querySelector(`#btnAdd_${id}`).onclick=()=>{ const val=Number(qs(`#dep_${id}`).value||0); if(val>0){ m.pago=(m.pago||0)+val; save(); renderAll(); } };
    el.querySelector(`#btnSub_${id}`).onclick=()=>{ const val=Number(qs(`#dep_${id}`).value||0); if(val>0){ m.pago=Math.max(0,(m.pago||0)-val); save(); renderAll(); } };
    el.querySelector('.saveMeta').onclick=()=>{ m.nome=el.querySelector("[data-field='nome']").textContent.trim(); m.alvo=Number(el.querySelector("[data-field='alvo']").value||0); save(); renderAll(); };
    wrap.appendChild(el);
  });
  const al=qs('#alocacoes'); al.innerHTML='';
  metas.forEach(m=>{ const val=(cfg.alloc[m.id]??0); const row=document.createElement('div'); row.className='top'; row.innerHTML=`<div>${m.nome}</div><label><input type='number' min='0' max='100' step='1' value='${val}' id='alloc_${m.id}'> %</label>`; al.appendChild(row); });
  qs('#autoApply').checked=!!cfg.autoApply;
  renderDistribuicao();
}

function renderDistribuicao(){
  const dist=qs('#distSug'); if(!dist) return; dist.innerHTML='';
  const s=totals();
  const pctMes=Math.max(0, Math.min(60, Number(qs('#pctMes').value||0)));
  const investir=(pctMes/100)*Math.max(0, s.liq - s.desp);
  qs('#saldoDisp').textContent='Saldo disp.: '+money(Math.max(0, s.liq - s.desp));
  if(investir<=0){ dist.innerHTML='<div class="meta">Sem saldo disponível para investir neste mês.</div>'; return; }
  const sumAlloc=Object.values(cfg.alloc).reduce((a,b)=>a+Number(b||0),0)||0;
  let weights={};
  if(sumAlloc>0){ metas.forEach(m=>weights[m.id]=(cfg.alloc[m.id]||0)/sumAlloc); }
  else { metas.forEach(m=>{ const n=m.nome.toLowerCase(); weights[m.id]= n.includes('serasa')?0.4: n.includes('reserva')?0.25: n.includes('13')?0.2:0.15; }); }
  const totalW=Object.values(weights).reduce((a,b)=>a+b,0)||1;
  metas.forEach(m=>{
    const need=Math.max(0,(m.alvo||0)-(m.pago||0));
    const share=investir*(weights[m.id]/totalW);
    const aplicar=Math.min(need||share, share);
    const row=document.createElement('div'); row.className='top'; row.innerHTML=`<div>${m.nome}</div><strong>${money(aplicar)}</strong>`; row.dataset.metaId=m.id; row.dataset.valor=aplicar; dist.appendChild(row);
  });
}

function aplicarDistribuicao(){ qsa('#distSug .top').forEach(row=>{ const id=row.dataset.metaId; const val=Number(row.dataset.valor||0); const m=metas.find(x=>x.id===id); if(!m) return; m.pago=(m.pago||0)+val; }); save(); renderAll(); }

function renderAlerts(){
  const wrap=qs('#alerts'); if(!wrap) return; wrap.innerHTML="";
  const now=new Date(); const soon=7*24*60*60*1000;
  monthFilter(despesas,'date').forEach(d=>{
    if(!d.due) return;
    const due=new Date(d.due+"T00:00:00"); const diff=due - now;
    if(diff < -86400000){
      const el=document.createElement('div'); el.className='item'; el.innerHTML=`<div class='top'><strong>${d.categoria}</strong><span class='badge' style='border-color:#fcd34d;background:#fffbeb'>ATRASADA</span></div><div class='meta'><span>Venc.: ${d.due}</span><span>Valor: <b>${money(d.valor)}</b></span></div>`; wrap.appendChild(el);
    } else if(diff <= soon){
      const el=document.createElement('div'); el.className='item'; el.innerHTML=`<div class='top'><strong>${d.categoria}</strong><span class='badge' style='border-color:#fcd34d;background:#fffbeb'>vence em breve</span></div><div class='meta'><span>Venc.: ${d.due}</span><span>Valor: <b>${money(d.valor)}</b></span></div>`; wrap.appendChild(el);
    }
  });
  if(!wrap.children.length){ wrap.innerHTML="<div class='meta'>Sem avisos por enquanto ✅</div>"; }
}

function drawChart(){
  const c=qs('#chart'); if(!c) return; const ctx=c.getContext('2d');
  ctx.clearRect(0,0,c.width,c.height);
  const data=metas.map(m=>({nome:m.nome, pct: (m.alvo>0?((m.pago||0)/m.alvo):0)})).sort((a,b)=>b.pct-a.pct).slice(0,8);
  const barW=28, gap=14; const left=220, top=30;
  ctx.font="16px system-ui"; ctx.fillStyle="#0F1A3A"; ctx.fillText("Progresso (%) — Top 8 metas", 20, 22);
  data.forEach((d,i)=>{
    const y=top + i*(barW+gap);
    ctx.fillStyle="#0F1A3A"; ctx.textAlign="left"; ctx.fillText(d.nome, 20, y+20);
    ctx.fillStyle="#eef3ff"; ctx.fillRect(left, y, c.width-left-40, barW);
    ctx.strokeStyle="#CDD9F5"; ctx.strokeRect(left, y, c.width-left-40, barW);
    const w=(c.width-left-40)*Math.max(0,Math.min(1,d.pct));
    ctx.fillStyle="#3F7DFF"; ctx.fillRect(left, y, w, barW);
    ctx.fillStyle="#0F1A3A"; ctx.textAlign="right"; ctx.fillText(Math.round(d.pct*100)+"%", c.width-40, y+20);
  });
}

function renderAll(){ renderResumo(); renderEntradas(); renderDespesas(); renderParcelas(); renderMetas(); }

document.addEventListener('submit', (ev)=>{
  const id=ev.target.id;
  if(id==='formQuick'){
    ev.preventDefault();
    const e={id:uid(), owner:qs('#qOwner').value, cliente:qs('#qCliente').value.trim(), forma:qs('#qForma').value.trim(), date:qs('#qDate').value, total:Number(qs('#qTotal').value||0), entrada:Number(qs('#qEntrada').value||0)};
    const rate=cfg.dizimo/100; const liquido=e.entrada - (e.entrada*rate);
    if(cfg.autoApply){
      const sum=Object.values(cfg.alloc).reduce((a,b)=>a+Number(b||0),0)||1;
      metas.forEach(m=>{ const peso=(cfg.alloc[m.id]||0)/sum; const val=liquido*peso*0.3; m.pago=(m.pago||0)+val; });
    }
    entradas.push(e); save(); ev.target.reset(); qs('#qDate').valueAsDate=new Date(); renderAll();
  }
  if(id==='formDesp'){
    ev.preventDefault();
    const d={id:uid(), date:qs('#dDate').value, categoria:qs('#dCategoria').value.trim(), kind:qs('#dKind').value, valor:Number(qs('#dValor').value||0), due:qs('#dVenc').value, obs:qs('#dObs').value.trim()};
    despesas.push(d); save(); ev.target.reset(); qs('#dDate').valueAsDate=new Date(); renderAll();
  }
  if(id==='formMeta'){
    ev.preventDefault();
    const m={id:uid(), nome:qs('#mNome').value.trim(), alvo:Number(qs('#mAlvo').value||0), prazo:qs('#mPrazo').value, pago:0};
    metas.push(m); save(); ev.target.reset(); renderAll();
  }
  if(id==='formParc'){
    ev.preventDefault();
    const p={id:uid(), nome:qs('#pNome').value.trim(), parcela:Number(qs('#pParcela').value||0), total:parseInt(qs('#pTotal').value||'1'), pagas:parseInt(qs('#pPagas').value||'0')||0, vencDia:parseInt(qs('#pVencDia').value||'0')||undefined};
    parcelas.push(p); save(); ev.target.reset(); renderAll();
  }
});

let _drawer,_overlay,_btn;
function go(tab){ const sec=document.getElementById('tab-'+tab); if(sec){ sec.scrollIntoView({behavior:'smooth',block:'start'}); } closeDrawer(); }
function closeDrawer(){ _drawer.classList.remove('show'); _overlay.classList.remove('show'); _btn.setAttribute('aria-expanded','false'); _drawer.setAttribute('aria-hidden','true'); }

function setup(){
  qs('#filterMonth').value=new Date().toISOString().slice(0,7);
  ['qDate','dDate'].forEach(id=>{ const el=qs('#'+id); if(el) el.valueAsDate=new Date(); });
  renderAll();
  _drawer=qs('#drawer'); _overlay=qs('#drawerOverlay'); _btn=qs('#btnMenu');
  _btn.addEventListener('click', ()=>{ _drawer.classList.add('show'); _overlay.classList.add('show'); });
  _overlay.addEventListener('click', closeDrawer);
  qsa('.drawer nav [data-go]').forEach(a=> a.addEventListener('click',(e)=>{ e.preventDefault(); go(a.dataset.go); }));
  qs('#btnPDF').addEventListener('click', ()=>{ document.title='FLOW — Relatório '+curMonth(); window.print(); });
  qs('#goPDF')?.addEventListener('click', (e)=>{ e.preventDefault(); document.title='FLOW — Relatório '+curMonth(); window.print(); });
  qs('#saveAlloc').addEventListener('click', ()=>{ metas.forEach(m=> cfg.alloc[m.id]=Number(qs('#alloc_'+m.id).value||0)); cfg.autoApply = qs('#autoApply').checked; save(); renderDistribuicao(); alert('Alocação salva.'); });
  qs('#pctMes').addEventListener('input', renderDistribuicao);
  qs('#btnAplicarDist').addEventListener('click', aplicarDistribuicao);
}
window.addEventListener('load', setup);
