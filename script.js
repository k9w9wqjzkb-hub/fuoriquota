// =======================
// DATI
// =======================
let concerti = JSON.parse(localStorage.getItem("concerti") || "[]");
let spese = JSON.parse(localStorage.getItem("spese") || "[]");

let editingConcertoIndex = null;
let editingSpesaIndex = null;


// =======================
// NAVIGAZIONE
// =======================
function showTab(tab){
  ["home","concerti","acquisti","report"].forEach(t=>{
    document.getElementById(t).style.display="none";
  });

  document.getElementById(tab).style.display="block";

  ["btnHome","btnConcerti","btnAcquisti","btnReport"].forEach(b=>{
    document.getElementById(b).classList.remove("active");
  });

  if(tab=="home") btnHome.classList.add("active");
  if(tab=="concerti") btnConcerti.classList.add("active");
  if(tab=="acquisti") btnAcquisti.classList.add("active");
  if(tab=="report") btnReport.classList.add("active");

  render();
}


// =======================
// MODALI
// =======================
function openModal(id){
  document.getElementById(id).style.display="flex";
}

function closeModal(id){
  document.getElementById(id).style.display="none";
  render();
}


// =======================
// CONCERTI
// =======================
function openModalConcerto(index=null){
  editingConcertoIndex = index;

  if(index !== null){
    let c = concerti[index];
    c_data.value = c.data;
    c_paese.value = c.paese;
    c_via.value = c.via;
    c_locale.value = c.locale;
    c_incasso.value = c.incasso;
  } else {
    c_data.value = "";
    c_paese.value = "";
    c_via.value = "";
    c_locale.value = "";
    c_incasso.value = "";
  }

  openModal("modalConcerto");
}

function saveConcerto(){
  let obj = {
    data: c_data.value,
    paese: c_paese.value,
    via: c_via.value,
    locale: c_locale.value,
    incasso: Number(c_incasso.value)
  };

  if(editingConcertoIndex !== null){
    concerti[editingConcertoIndex] = obj;
  } else {
    concerti.push(obj);
  }

  closeModal("modalConcerto");
  save();
}

function deleteConcertoModal(){
  if(editingConcertoIndex !== null){
    concerti.splice(editingConcertoIndex,1);
  }
  closeModal("modalConcerto");
  save();
}


// =======================
// SPESE (SEMPRE NEGATIVE)
// =======================
function openModalSpesa(index=null){
  editingSpesaIndex = index;

  if(index !== null){
    let s = spese[index];
    s_data.value = s.data;
    s_desc.value = s.desc;
    s_note.value = s.note;
    s_importo.value = Math.abs(s.importo);
  } else {
    s_data.value = "";
    s_desc.value = "";
    s_note.value = "";
    s_importo.value = "";
  }

  openModal("modalSpesa");
}

function saveSpesa(){
  let importo = Number(s_importo.value);
  if(importo > 0) importo = -importo;   // forza valore negativo

  let obj = {
    data: s_data.value,
    desc: s_desc.value,
    note: s_note.value,
    importo: importo
  };

  if(editingSpesaIndex !== null){
    spese[editingSpesaIndex] = obj;
  } else {
    spese.push(obj);
  }

  closeModal("modalSpesa");
  save();
}

function deleteSpesaModal(){
  if(editingSpesaIndex !== null){
    spese.splice(editingSpesaIndex,1);
  }
  closeModal("modalSpesa");
  save();
}


// =======================
// RENDER TABELLE
// =======================
function renderConcerti(){
  let ordinati = [...concerti].sort((a,b)=> new Date(b.data) - new Date(a.data));

  let html="<tr><th>Data</th><th>Paese</th><th>Locale</th><th class='importo'>Incasso</th></tr>";
  ordinati.forEach(c=>{ 
    let i = concerti.indexOf(c);
    html+=`<tr onclick="openModalConcerto(${i})">
      <td>${c.data}</td>
      <td>${c.paese}</td>
      <td>${c.locale}</td>
      <td class="importo">${Number(c.incasso).toFixed(2)} €</td>
    </tr>`; 
  });

  concertiTable.innerHTML=html;
}

function renderSpese(){
  let ordinati = [...spese].sort((a,b)=> new Date(b.data) - new Date(a.data));

  let html="<tr><th>Data</th><th>Descrizione</th><th class='importo'>Importo</th></tr>";
  ordinati.forEach(s=>{ 
    let i = spese.indexOf(s);
    html+=`<tr onclick="openModalSpesa(${i})">
      <td>${s.data}</td>
      <td>${s.desc}</td>
      <td class="importo">${Number(s.importo).toFixed(2)} €</td>
    </tr>`; 
  });

  speseTable.innerHTML=html;
}


// =======================
// REPORT
// =======================
function renderReport(){
  let incassi = concerti.reduce((sum,c)=>sum + c.incasso,0);
  let uscite  = spese.reduce((sum,s)=>sum + s.importo,0);
  let saldo   = incassi + uscite;

  totIncassi.innerText = "Totale Entrate: " + incassi.toFixed(2) + " €";
  totSpese.innerText  = "Totale Spese: " + uscite.toFixed(2) + " €";
  totUtile.innerText  = "Saldo Netto: " + saldo.toFixed(2) + " €";

  // Riepilogo concerti per anno
  let map = {};
  concerti.forEach(c=>{
    let anno = new Date(c.data).getFullYear();
    if(!map[anno]) map[anno] = 0;
    map[anno]++;
  });

  let html = "<h4>Concerti per anno</h4>";
  Object.keys(map).sort().forEach(a=>{
    html += `<div>${a}: ${map[a]} concerti</div>`;
  });

  riepilogoConcertiAnno.innerHTML = html;
}


// =======================
// SALVATAGGIO
// =======================
function save(){
  localStorage.setItem("concerti", JSON.stringify(concerti));
  localStorage.setItem("spese", JSON.stringify(spese));
  render();
}

function render(){
  renderConcerti();
  renderSpese();
  renderReport();
}

render();


// =======================
// EXPORT EXCEL
// =======================
function exportExcel(){
  let rows = [["Data","Tipo","Descrizione","Luogo/Note","Importo"]];

  concerti.forEach(c=>{
    rows.push([c.data,"Concerto",c.locale,c.paese+" "+c.via,c.incasso.toFixed(2)]);
  });

  spese.forEach(s=>{
    rows.push([s.data,"Spesa",s.desc,s.note,s.importo.toFixed(2)]);
  });

  rows.sort((a,b)=> new Date(a[0]) - new Date(b[0]));

  let csv = rows.map(r=>r.join(";")).join("\n");
  let blob = new Blob([csv],{type:"text/csv"});
  let url = URL.createObjectURL(blob);

  let a = document.createElement("a");
  a.href = url;
  a.download = "fuoriQuota.xlsx";
  a.click();
}


// =======================
// EXPORT PDF
// =======================
async function exportPDF(){
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("fuoriQuota - Report",105,15,{align:"center"});

  let y = 30;
  doc.setFontSize(10);

  let rows = [];

  concerti.forEach(c=>{
    rows.push([c.data,"Concerto",c.locale,c.paese+" "+c.via,c.incasso.toFixed(2)+" €"]);
  });

  spese.forEach(s=>{
    rows.push([s.data,"Spesa",s.desc,s.note,s.importo.toFixed(2)+" €"]);
  });

  rows.sort((a,b)=> new Date(a[0]) - new Date(b[0]));

  rows.forEach(r=>{
    if(y > 280){
      doc.addPage();
      y = 20;
    }
    doc.text(r.join(" | "),10,y);
    y += 7;
  });

  doc.save("fuoriQuota_report.pdf");
}
// =======================
// BACKUP DATI
// =======================
function backupDati(){
  const dati = {
    concerti: concerti,
    spese: spese
  };
  const blob = new Blob([JSON.stringify(dati,null,2)], {type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "fuoriQuota_backup.json";
  a.click();
  URL.revokeObjectURL(url);
}
// =======================
// RIPRISTINO DATI
// =======================
function ripristinaDati(){
  const fileInput = document.getElementById("fileInput");
  fileInput.click();
  fileInput.onchange = ()=>{
    const file = fileInput.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = (e)=>{
      try {
        const dati = JSON.parse(e.target.result);
        concerti = dati.concerti || [];
        spese = dati.spese || [];
        save();
        alert("Dati ripristinati con successo!");
      } catch(err){
        alert("Errore nel ripristino dei dati: file non valido.");
      }
    };
    reader.readAsText(file);
    fileInput.value = ""; // reset
  };
}