const LOTOS=[
  {id:1,titre:"Grand Loto du Printemps",villePublique:"Lyon (69)",adresseExacte:"Salle des fêtes, 24 place Bellecour, 69002 Lyon",heureExacte:"14h30",date:"15 mars 2025",prixEntree:6,rayon:12,lots:[{nom:'Télévision Samsung 55"',valeur:800},{nom:"Bon d'achat Leclerc",valeur:200},{nom:"Machine à café",valeur:120},{nom:"Panier gourmand",valeur:60}]},
  {id:2,titre:"Loto de l'Association Amitié",villePublique:"Villeurbanne (69)",adresseExacte:"MJC Gratte-Ciel, 18 av. Henri Barbusse, 69100 Villeurbanne",heureExacte:"15h00",date:"22 mars 2025",prixEntree:5,rayon:8,lots:[{nom:"Aspirateur robot",valeur:350},{nom:"Tablette Amazon Fire",valeur:100},{nom:"Coffret bien-être",valeur:80}]},
  {id:3,titre:"Loto Seniors du Rhône",villePublique:"Bron (69)",adresseExacte:"Centre culturel, 7 rue Elsa Triolet, 69500 Bron",heureExacte:"10h00",date:"29 mars 2025",prixEntree:4,rayon:20,lots:[{nom:"Friteuse à air",valeur:150},{nom:"Bon restaurant",valeur:100},{nom:"Coffret vins",valeur:75},{nom:"Puzzle 1000 pièces",valeur:30}]},
  {id:4,titre:"Loto de Pâques",villePublique:"Caluire-et-Cuire (69)",adresseExacte:"Espace Culturel, 92 montée St-Laurent, 69300 Caluire",heureExacte:"14h00",date:"5 avril 2025",prixEntree:7,rayon:35,lots:[{nom:'Smart TV 65"',valeur:1200},{nom:"Console Nintendo Switch",valeur:280},{nom:"Bon d'achat Amazon 100€",valeur:100},{nom:"Chocolats artisanaux",valeur:45}]}
];

let isConnected=false,userRole=null,currentLotoId=null,pendingUnlock=false;
const unlockedLotos=new Set();

function showPage(n){
  const orgaPages=['organisateur','dashboard-orga'];
  if(orgaPages.includes(n)&&userRole!=='organisateur'){openAuthModal();return;}
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById('page-'+n).classList.add('active');
  window.scrollTo({top:0,behavior:'smooth'});
  if(n==='dashboard-joueur')renderDashboardJoueur();
  if(n==='dashboard-orga')renderDashboardOrga();
}

function searchLotos(){
  const rayon=parseInt(document.getElementById('searchRayon').value)||0;
  const err=document.getElementById('rayonError');
  if(rayon>200){err.style.display='block';return;}
  err.style.display='none';
  const grid=document.getElementById('lotoGrid');grid.innerHTML='';
  const matching=LOTOS.filter(l=>l.rayon<=rayon);
  document.getElementById('resultsCount').textContent=matching.length+' résultat'+(matching.length>1?'s':'');
  document.getElementById('resultsSection').style.display='block';
  if(!matching.length){grid.innerHTML='<div style="padding:2rem;color:var(--text-muted);font-size:.88rem;letter-spacing:.05em;background:var(--night2);">Aucun événement trouvé dans ce rayon.</div>';return;}
  matching.forEach((l,i)=>{
    const maxLot=Math.max(...l.lots.map(x=>x.valeur));
    const card=document.createElement('div');
    card.className='loto-card';
    card.onclick=()=>openDetail(l.id);
    card.innerHTML=`<div class="card-inner"><div class="card-top"><span class="card-date">${l.date}</span><span class="card-dist">${l.rayon} km</span></div><div class="card-title">${l.titre}</div><div class="card-ville">${l.villePublique}</div><div class="card-divider"></div><div class="card-prix"><span class="prix-val">${l.prixEntree} €</span><span class="prix-label">/ carton</span></div><div class="card-lots"><span class="lot-highlight">${l.lots.length} lots</span> · Plus gros : <span class="lot-highlight">${maxLot} €</span><br>${l.lots.slice(0,2).map(x=>x.nom).join(', ')}…</div><div class="card-lock-bar"><span class="lock-diamond"></span>Adresse &amp; heure masquées</div></div>`;
    grid.appendChild(card);
  });
}

function openDetail(id){
  currentLotoId=id;
  const l=LOTOS.find(x=>x.id===id);
  document.getElementById('detailTitle').textContent=l.titre;
  document.getElementById('detailVille').textContent='📅 '+l.date+' · '+l.villePublique;
  document.getElementById('detailPrix').textContent=l.prixEntree+' €';
  document.getElementById('detailNbLots').textContent=l.lots.length;
  document.getElementById('detailDist').textContent=l.rayon+' km';
  const list=document.getElementById('detailLotList');list.innerHTML='';
  l.lots.forEach(lot=>{const r=document.createElement('div');r.className='lot-row-d';r.innerHTML=`<span class="lot-name">${lot.nom}</span><span class="lot-val-d">${lot.valeur} €</span>`;list.appendChild(r);});
  if(unlockedLotos.has(id)){showUnlocked(l);}else{document.getElementById('lockedBlock').style.display='block';document.getElementById('unlockedBlock').style.display='none';}
  showPage('detail');
}

function showUnlocked(l){
  document.getElementById('lockedBlock').style.display='none';
  document.getElementById('unlockedBlock').style.display='block';
  document.getElementById('uAddr').textContent=l.adresseExacte;
  document.getElementById('uHeure').textContent=l.heureExacte;
}

function openUnlockModal(){
  if(!isConnected){openAuthModal(true);return;}
  const l=LOTOS.find(x=>x.id===currentLotoId);
  document.getElementById('payAmount').textContent=(l.prixEntree*0.10).toFixed(2)+' €';
  document.getElementById('payModal').classList.add('open');
}
function doPaiement(){unlockedLotos.add(currentLotoId);closeModal('payModal');showUnlocked(LOTOS.find(x=>x.id===currentLotoId));}

function openAuthModal(fu){pendingUnlock=!!fu;document.getElementById('authModal').classList.add('open');}

function loginAs(role){
  isConnected=true;
  userRole=role;
  const names={joueur:'Jean D.',organisateur:'Marie O.'};
  document.getElementById('userName').textContent=names[role];
  document.getElementById('authBtn').style.display='none';
  document.getElementById('logoutBtn').style.display='';
  document.getElementById('userBadge').style.display='flex';
  document.getElementById('dashJoueurLink').style.display=(role==='joueur')?'inline':'none';
  document.getElementById('dashOrgaLink').style.display=(role==='organisateur')?'inline':'none';
  document.getElementById('orgaLink').style.display=(role==='organisateur')?'inline':'none';
  closeModal('authModal');
  if(pendingUnlock){pendingUnlock=false;openUnlockModal();}
}

function doLogin(){loginAs('joueur');}

function logout(){
  isConnected=false;
  userRole=null;
  document.getElementById('authBtn').style.display='';
  document.getElementById('logoutBtn').style.display='none';
  document.getElementById('userBadge').style.display='none';
  document.getElementById('dashJoueurLink').style.display='none';
  document.getElementById('dashOrgaLink').style.display='none';
  document.getElementById('orgaLink').style.display='none';
  showPage('home');
}

function switchTab(n){document.querySelectorAll('.modal-tab').forEach((t,i)=>t.classList.toggle('active',n==='login'?i===0:i===1));document.getElementById('tab-login').classList.toggle('active',n==='login');document.getElementById('tab-register').classList.toggle('active',n==='register');}

function addLotRow(){const rows=document.getElementById('lotRows');const row=document.createElement('div');row.className='lot-input-row';row.innerHTML=`<input type="text" class="lot-name-in" placeholder="Nom du lot"><input type="number" class="lot-val-in" placeholder="Valeur €" oninput="updateCommission()">`;rows.appendChild(row);}
function updateCommission(){const vals=[...document.querySelectorAll('.lot-val-in')].map(i=>parseFloat(i.value)||0);const max=Math.max(...vals,0);const comm=max*0.10;document.getElementById('commAmt').textContent=comm.toFixed(2).replace('.',',')+' €';document.getElementById('commDetail').textContent=max>0?`Plus gros lot : ${max} € → commission : ${comm.toFixed(2)} €`:'Saisissez vos lots pour calculer';}
function publierLoto(){if(userRole!=='organisateur'){openAuthModal();return;}const vals=[...document.querySelectorAll('.lot-val-in')].map(i=>parseFloat(i.value)||0);const max=Math.max(...vals,0);if(!max){alert('Veuillez renseigner au moins un lot avec une valeur.');return;}document.getElementById('orgaPayAmt').textContent=(max*0.10).toFixed(2)+' €';document.getElementById('orgaPayModal').classList.add('open');}
function doOrgaPaiement(){closeModal('orgaPayModal');document.getElementById('successBanner').style.display='block';document.querySelector('.btn-publier').style.display='none';}

function closeModal(id){document.getElementById(id).classList.remove('open');}
document.querySelectorAll('.modal-overlay').forEach(m=>m.addEventListener('click',e=>{if(e.target===m)m.classList.remove('open');}));

// ── DASHBOARD JOUEUR ─────────────────────────────────────────
function renderDashboardJoueur(){
  const ids=[...unlockedLotos];
  document.getElementById('djStatUnlocked').textContent=ids.length;
  const spent=ids.reduce((s,id)=>{const l=LOTOS.find(x=>x.id===id);return s+(l?l.prixEntree*0.10:0);},0);
  document.getElementById('djStatSpent').textContent=spent.toFixed(2).replace('.',',')+' €';
  const nextDates=ids.map(id=>LOTOS.find(x=>x.id===id)).filter(Boolean);
  document.getElementById('djStatNext').textContent=nextDates.length?nextDates[0].date:'—';
  const list=document.getElementById('djUnlockedList');
  if(!ids.length){
    list.innerHTML='<div class="empty-state"><p>Vous n\'avez encore débloqué aucun loto.<br>Recherchez un événement et débloquez son adresse pour le voir apparaître ici.</p></div>';
    return;
  }
  list.innerHTML=ids.map(id=>{
    const l=LOTOS.find(x=>x.id===id);
    if(!l)return '';
    return `<div class="unlocked-event-card" onclick="openDetail(${l.id})">
      <div>
        <div class="uec-title">${l.titre}</div>
        <div class="uec-ville">${l.villePublique}</div>
        <div class="uec-meta">
          <span>Date : <strong>${l.date}</strong></span>
          <span>Heure : <strong>${l.heureExacte}</strong></span>
          <span>Carton : <strong>${l.prixEntree} €</strong></span>
        </div>
        <div class="uec-addr">Adresse : <strong>${l.adresseExacte}</strong></div>
      </div>
      <div class="uec-status">Débloqué</div>
    </div>`;
  }).join('');
}

function saveProfile(btn){
  btn.textContent='Sauvegardé';
  document.getElementById('profSavedMsg').style.display='inline';
  setTimeout(()=>{btn.textContent='Sauvegarder';document.getElementById('profSavedMsg').style.display='none';},2500);
}

// ── DASHBOARD ORGANISATEUR ───────────────────────────────────
const ANNONCES_ORGA=[
  {titre:"Loto du Printemps 2025",date:"15 mars 2025",statut:"publiee",vues:187},
  {titre:"Loto d'Été Associatif",date:"20 juin 2025",statut:"attente",vues:0},
  {titre:"Grand Loto de Noël",date:"24 décembre 2025",statut:"brouillon",vues:0}
];
const STATUS_LABELS={brouillon:'Brouillon',attente:'En attente de paiement',publiee:'Publiée'};

function renderDashboardOrga(){
  const list=document.getElementById('orgaAnnonceList');
  list.innerHTML=ANNONCES_ORGA.map((a,i)=>`
    <div class="annonce-row">
      <div><div class="ar-title">${a.titre}</div><div class="ar-date">${a.date}</div></div>
      <div><span class="status-badge ${a.statut}">${STATUS_LABELS[a.statut]}</span></div>
      <div><div class="ar-vues">${a.vues}</div><div class="ar-vues-label">vues</div></div>
      <div><span class="ar-action" onclick="handleAnnonceAction(${i})">Gérer</span></div>
    </div>`).join('');
}

function handleAnnonceAction(i){
  const a=ANNONCES_ORGA[i];
  if(a.statut==='brouillon'){showPage('organisateur');}
  else if(a.statut==='attente'){document.getElementById('orgaPayAmt').textContent='120,00 €';document.getElementById('orgaPayModal').classList.add('open');}
  else{alert('Annonce publiée — '+a.vues+' consultations.');}
}

searchLotos();
