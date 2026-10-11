
(function(){
"use strict";
var rec=Array.isArray(window.WEEKMENU_RECIPES)?window.WEEKMENU_RECIPES:[];
var soup=window.WEEKMENU_SOUP||{title:"Tomatensoep",price4:4.60,ingredients:[]};
var cats=[["vlees","🥩 Vlees"],["vis","🐟 Vis"],["vega","🥦 Vegetarisch"],["kids","👨‍👩‍👧 Kindvriendelijk"]];
var aisles=["Groenten & fruit","Aardappelen","Beenhouwerij","Vis","Zuivel & kaas","Diepvries","Droge voeding","Conserven","Wereldkeuken","Sauzen","Overig"];
var old={};try{old=JSON.parse(localStorage.getItem("mijn-weekmenu-v3")||"{}")||{}}catch(e){}
function num(n,f){if(n===null||n===undefined||n==='')return f;n=+n;return Number.isFinite(n)?n:f}
function clamp(n,lo,hi){return Math.min(hi,Math.max(lo,n))}
var s={
 p:clamp(num(old.p,num(localStorage.getItem("p"),4)),1,8),
 b:clamp(num(old.b,num(localStorage.getItem("b"),65)),30,180),
 counts:old.counts||{vlees:1,vis:1,vega:1,kids:1},
 meat:old.meat||["Rund","Varken","Kip","Gevogelte"],
 soup:typeof old.soup==="boolean"?old.soup:localStorage.getItem("soup")==="1",
 seed:num(old.seed,0),plan:Array.isArray(old.plan)?old.plan:[],
 done:Array.isArray(old.done)?old.done:[],stock:Array.isArray(old.stock)?old.stock:[],
 extra:Array.isArray(old.extra)?old.extra:[],tab:"menu",filter:"alles",search:""
};
function save(){try{localStorage.setItem("mijn-weekmenu-v3",JSON.stringify({p:s.p,b:s.b,counts:s.counts,meat:s.meat,soup:s.soup,seed:s.seed,plan:s.plan,done:s.done,stock:s.stock,extra:s.extra}))}catch(e){}}
function html(t){return String(t==null?"":t).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function url(t){return typeof t==="string"&&/^https:\/\/[a-z0-9.-]+\//i.test(t)?t:""}
function money(x){return "€ "+x.toFixed(2).replace(".",",")}
function find(id){return rec.find(function(x){return x.id===id})}
function belongs(r,cat){
 var ts=r.tags||[];
 if(cat==="vis")return ts.includes("Vis");
 if(cat==="vega")return ts.includes("Vegetarisch");
 if(cat==="kids")return ts.includes("Kids");
 if(cat==="vlees"){
  if(!ts.some(function(x){return ["Vlees","Kip","Rund","Varken","Gevogelte"].includes(x)}))return false;
  var types=r.meatTypes||(ts.includes("Kip")?["Kip","Gevogelte"]:ts.includes("Rund")?["Rund"]:ts.includes("Varken")?["Varken"]:["Rund","Varken"]);
  return types.some(function(t){return s.meat.includes(t)});
 }
 return true;
}
function count(){return cats.reduce(function(a,c){return a+num(s.counts[c[0]],0)},0)}
function generate(){
 var used=new Set();s.plan=[];
 cats.forEach(function(c){
  var pool=rec.filter(function(r){return belongs(r,c[0])});
  for(var j=0;j<num(s.counts[c[0]],0);j++){
   var fresh=pool.filter(function(r){return !used.has(r.id)});
   fresh.sort(function(x,y){return Number(!!y.image)-Number(!!x.image)||rec.indexOf(x)-rec.indexOf(y)});
   var preferred=fresh.filter(function(r){return !!r.image});
   var choices=preferred.length&&s.seed%3!==2?preferred:fresh;
   var pick=choices.length?choices[(s.seed+j)%choices.length]:null;
   if(!pick)pick=rec.find(function(r){return !used.has(r.id)});
   if(pick){used.add(pick.id);s.plan.push(pick.id)}
  }
 });
 save();
}
function valid(){return s.plan.length===count()&&s.plan.every(function(id){return !!find(id)})&&new Set(s.plan).size===s.plan.length}
if(!valid())generate();
function dishes(){return s.plan.map(find).filter(Boolean)}
function aName(a){return a==="Conserven & sauzen"?"Conserven":aisles.includes(a)?a:"Overig"}
function storage(x){return x.storage||"Voorraad"}
function key(x){return [x.name,x.unit,storage(x)].join("|").toLowerCase()}
function list(){
 var m=new Map();
 dishes().concat(s.soup?[soup]:[]).forEach(function(r){(r.ingredients||[]).forEach(function(x){
  var k=key(x),q=num(x.qty,0)*s.p/4;
  if(m.has(k))m.get(k).amount+=q;
  else m.set(k,{name:x.name,unit:x.unit||"st.",storage:storage(x),aisle:aName(x.aisle),amount:q,id:k});
 })});
 s.extra.forEach(function(x){if(!x.name)return;var k="extra:"+key(x);if(m.has(k))m.get(k).amount+=num(x.qty,1);
 else m.set(k,{name:x.name,unit:x.unit||"st.",storage:storage(x),aisle:aName(x.aisle),amount:num(x.qty,1),id:k,extra:true})});
 return [...m.values()].sort(function(a,b){return aisles.indexOf(a.aisle)-aisles.indexOf(b.aisle)||a.name.localeCompare(b.name,"nl")});
}
function quantity(q,unit,shopping){
 if(shopping&&["st.","st","bos","zak","pak","pot","blik","blokje","fles"].includes(unit))q=Math.ceil(q-0.00001);
 var n=unit==="g"||unit==="ml"?Math.round(q):Math.round(q*10)/10;
 return String(n).replace(".",",")+" "+unit;
}
function source(r,short){
 return url(r.sourceUrl)?'<a href="'+html(r.sourceUrl)+'" target="_blank" rel="noopener noreferrer">'+(short?"Bron ↗":"Open origineel recept ↗")+"</a>":'<span class="subtle">Eigen recept</span>';
}
function photo(r){
 return '<div class="photo"><span class="emoji">'+html(r.icon||"🍴")+'</span>'+
 (url(r.image)?'<img src="'+html(r.image)+'" loading="lazy" alt="Foto van '+html(r.title)+'" onerror="this.parentNode.classList.add(&quot;is-missing&quot;);this.remove()"><span class="missing" style="display:none">Foto nog niet beschikbaar</span>':'<span class="missing">Foto nog niet beschikbaar</span>')+"</div>";
}
function meal(r,i,library){
 return '<article class="meal">'+photo(r)+'<div class="meal-body"><span class="badge">'+html(r.time||30)+' min</span>'+
 (r.tags||[]).slice(0,2).map(function(t){return '<span class="badge">'+html(t)+"</span>"}).join("")+
 '<h4>'+html(r.title)+'</h4><div class="meta">'+html(r.source||"Eigen recept")+' · '+s.p+' personen</div>'+
 '<div class="cost">± '+money(num(r.price4,0)*s.p/4)+'</div><div class="actions">'+
 '<button data-detail="'+html(r.id)+'">Ingrediënten</button>'+
 (library?'<button data-addrecipe="'+html(r.id)+'">Kies</button>':'<button data-swap="'+i+'">Vervang ↻</button>')+
 source(r,true)+'</div></div></article>';
}
function row(x){
 var done=s.done.includes(x.id),stock=s.stock.includes(x.id);
 return '<div class="item'+(done?" done":"")+(stock?" done":"")+'">'+
 '<input type="checkbox" data-done="'+html(x.id)+'" '+(done?"checked ":"")+(stock?"disabled ":"")+'aria-label="'+html(x.name)+' afvinken">'+
 '<div class="itemtext"><div class="itemname">'+html(x.name)+'</div><div class="itemsmall">'+html(x.storage)+' · '+(x.extra?"Extra toegevoegd":"Collect&Go zoekterm: "+html(x.name))+'</div></div>'+
 '<span class="qty">'+html(quantity(x.amount,x.unit,true))+'</span>'+
 '<button class="stock" data-stock="'+html(x.id)+'">'+(stock?"Terug":"In huis")+'</button>'+
 (x.extra?'<button class="stock" data-delete="'+html(x.id)+'">×</button>':"")+"</div>";
}
function shoppingHTML(preview){
 var items=list();
 if(preview){var visible=items.filter(function(x){return !s.stock.includes(x.id)});
 return visible.length?'<div class="list-group">'+visible.slice(0,5).map(row).join("")+'</div><p class="tiny">'+visible.length+' ingrediënten nodig, hoeveelheden voor '+s.p+' personen.</p>':'<div class="empty">Alles in huis.</div>'}
 var content="";aisles.forEach(function(a){var group=items.filter(function(x){return x.aisle===a});
 if(group.length)content+='<section class="list-group"><h4>'+html(a)+'</h4>'+group.map(row).join("")+"</section>"});
 return content||'<div class="empty">Nog geen boodschappen.</div>';
}
function renderMenu(){
 document.getElementById("menu-meals").innerHTML=dishes().map(function(r,i){return meal(r,i,false)}).join("")||'<div class="empty">Geen recepten gevonden</div>';
 var total=dishes().reduce(function(a,r){return a+num(r.price4,0)*s.p/4},0)+(s.soup?num(soup.price4,0)*s.p/4:0);
 document.getElementById("estimated").textContent=money(total);
 document.getElementById("budgetsummary").innerHTML='Richtbudget '+money(s.b)+(total>s.b?' · <span class="warn">geschat boven budget</span>':" · geschat binnen budget");
 document.getElementById("preview").innerHTML=shoppingHTML(true);
 document.getElementById("daycount").textContent=count()+" gerechten";
 document.querySelectorAll("[data-count]").forEach(function(e){e.textContent=s.counts[e.dataset.count]||0});
 document.querySelectorAll("[data-meat]").forEach(function(e){e.classList.toggle("on",s.meat.includes(e.dataset.meat))});
 document.getElementById("persons").value=s.p;document.getElementById("personsval").textContent=s.p+" personen";
 document.getElementById("budget").value=s.b;document.getElementById("budgetval").textContent="€ "+s.b;
 document.getElementById("soupbtn").classList.toggle("on",s.soup);
 document.getElementById("soupbtn").setAttribute("aria-pressed",String(s.soup));
}
function renderList(){
 var active=list().filter(function(x){return !s.stock.includes(x.id)});
 document.getElementById("listcount").textContent=active.filter(function(x){return s.done.includes(x.id)}).length+" van "+active.length+" afgevinkt";
 document.getElementById("fulllist").innerHTML=shoppingHTML(false);
}
function renderLibrary(){
 var matches=rec.filter(function(r){return (s.filter==="alles"||belongs(r,s.filter))&&r.title.toLowerCase().includes(s.search.toLowerCase())});
 document.getElementById("library").innerHTML=matches.map(function(r){return meal(r,0,true)}).join("")||'<div class="empty">Geen recepten gevonden.</div>';
 document.querySelectorAll("[data-filter]").forEach(function(e){e.classList.toggle("on",e.dataset.filter===s.filter)});
}
function render(){
 renderMenu();renderList();renderLibrary();
 document.querySelectorAll(".tabs").forEach(function(e){e.classList.toggle("active",e.dataset.view===s.tab)});
 document.querySelectorAll(".nav button").forEach(function(e){e.classList.toggle("on",e.dataset.go===s.tab)});
 save();
}
function openModal(content){document.getElementById("modal-body").innerHTML=content;document.getElementById("modal").classList.add("on")}
function closeModal(){document.getElementById("modal").classList.remove("on")}
function detail(id){
 var r=find(id);if(!r)return;
 openModal('<h3>'+html(r.title)+'</h3>'+
 (url(r.image)?'<img src="'+html(r.image)+'" alt="'+html(r.title)+'" class="detailphoto">':"")+
 '<p class="tiny">'+html(r.time||30)+' min · '+s.p+' personen</p><h4>Ingrediënten</h4><ul>'+
 (r.ingredients||[]).map(function(x){return '<li style="margin:8px 0">'+html(x.name)+' — '+html(quantity(num(x.qty,0)*s.p/4,x.unit,false))+"</li>"}).join("")+
 '</ul><p>'+source(r,false)+'</p><p class="note">De ingrediëntenlijst is samengesteld in deze app. Controleer de originele receptpagina voor de volledige bereidingswijze en hoeveelheden.</p>');
}
function picker(pos){
 var used=new Set(s.plan.filter(function(_,i){return i!==pos}));
 var available=rec.filter(function(r){return !used.has(r.id)});
 openModal('<h3>Gerecht '+(pos+1)+' vervangen</h3><p class="note">Kies een ander gerecht. De rest van je menu blijft behouden.</p>'+
 available.map(function(r){return '<div class="picker"><div><strong>'+html(r.title)+'</strong><small>'+html(r.source||"Eigen recept")+' · '+html((r.tags||[]).join(", "))+'</small></div><button class="secondary" data-pick="'+html(r.id)+'" data-slot="'+pos+'">Kies</button></div>'}).join(""));
}
function assign(id){
 if(!s.plan.length){s.counts.kids=1;generate()}
 var choices=s.plan.map(function(r,i){return '<button class="secondary wide" style="margin:5px 0" data-assignto="'+i+'" data-recipe="'+html(id)+'">Gerecht '+(i+1)+': '+html(find(r).title)+"</button>"}).join("");
 openModal('<h3>Welk gerecht vervangen?</h3><p class="note">Kies de plaats in je weekmenu voor '+html(find(id).title)+'.</p>'+choices);
}
function change(cat,delta){
 var next=clamp(num(s.counts[cat],0)+delta,0,7),newtotal=count()+next-num(s.counts[cat],0);
 if(newtotal<1||newtotal>7)return;
 s.counts[cat]=next;s.seed++;generate();render();
}
function copyValue(){
 return "Boodschappenlijst voor "+s.p+" personen\n"+list().filter(function(x){return !s.stock.includes(x.id)}).map(function(x){
 return (s.done.includes(x.id)?"✓ ":"☐ ")+x.name+" — "+quantity(x.amount,x.unit,true)+" ("+x.aisle+" · "+x.storage+")";
 }).join("\n");
}
function fallbackCopy(txt){
 var t=document.createElement("textarea");t.value=txt;document.body.appendChild(t);t.select();
 try{document.execCommand("copy");notice("Lijst gekopieerd.")}catch(e){notice("Kopiëren is niet gelukt.")}t.remove();
}
function notice(t){document.getElementById("notice").textContent=t}
function setup(){
 document.querySelector(".app").innerHTML=[
 '<header class="header"><div class="mark">🍽️</div><div><h1>Mijn Weekmenu</h1><small>Slim plannen · eenvoudig boodschappen doen</small></div></header>',
 '<section class="tabs active" data-view="menu"><div class="hero"><h2>Wat eten we deze week?</h2><p>Kies je gerechten, vervang wat je niet wilt en laat je lijst automatisch berekenen.</p></div>',
 '<div class="panel"><div class="field"><div class="split"><label for="persons">Aantal personen</label><span class="value" id="personsval"></span></div><input id="persons" type="range" min="1" max="8"></div>',
 '<div class="field"><div class="split"><label for="budget">Richtbudget</label><span class="value" id="budgetval"></span></div><input id="budget" type="range" min="30" max="180" step="5"></div>',
 '<div class="split"><span class="heading">Aantal gerechten per soort</span><span class="value" id="daycount"></span></div><p class="tiny">Stel 1 tot 7 gerechten samen. Kies zelf hoeveel vlees, vis, vegetarisch en kindvriendelijk.</p>',
 '<div class="counts">'+cats.map(function(c){return '<div class="count"><span class="name">'+c[1]+'</span><span class="stepper"><button data-adjust="'+c[0]+'" data-delta="-1" aria-label="Minder '+c[1]+'">−</button><strong data-count="'+c[0]+'">0</strong><button data-adjust="'+c[0]+'" data-delta="1" aria-label="Meer '+c[1]+'">+</button></span></div>'}).join("")+'</div>',
 '<div class="heading">Voorkeur vleessoort</div><div class="pills">'+["Rund","Varken","Kip","Gevogelte"].map(function(m){return '<button class="pill" data-meat="'+m+'">'+m+"</button>"}).join("")+'</div><button class="primary wide" id="regen">Maak nieuw weekmenu ↻</button></div>',
 '<div class="section"><h3>Jouw gerechten</h3><button class="linkbtn" data-go="recipes">Alle recepten</button></div><div class="meals" id="menu-meals"></div>',
 '<div class="total"><div class="split"><div><small>Geschatte kost</small><div><strong id="estimated"></strong></div></div><span style="font-size:27px">🛒</span></div><small id="budgetsummary"></small></div>',
 '<div class="soup"><div><strong>🥣 Soep toevoegen?</strong><div class="tiny">Tomatensoep, extra ingrediënten</div></div><button class="switch" id="soupbtn" aria-label="Soep toevoegen" aria-pressed="false"><span></span></button></div>',
 '<div class="section"><h3>Boodschappenlijst</h3><button class="linkbtn" data-go="list">Alles bekijken →</button></div><div id="preview"></div></section>',
 '<section class="tabs" data-view="recipes"><div class="hero"><h2>Recepten kiezen</h2><p>Bekijk gerechten, ingrediënten en de link naar het oorspronkelijke recept.</p></div><input class="search" id="recipe-search" type="search" placeholder="Zoek een gerecht"><div class="pills"><button class="pill on" data-filter="alles">Alles</button>'+cats.map(function(c){return '<button class="pill" data-filter="'+c[0]+'">'+c[1]+"</button>"}).join("")+'</div><div id="library" class="library"></div></section>',
 '<section class="tabs" data-view="list"><div class="hero"><h2>Boodschappenlijst</h2><p id="listcount"></p></div><div class="buttons"><button id="copy" class="primary">Kopieer lijst</button><button id="print" class="secondary">Print / PDF</button></div>',
 '<div class="info"><p>De ingrediënten zijn samengevoegd per product voor het juiste aantal personen. De hoeveelheid van hele stuks wordt naar boven afgerond. Markeer wat je al in huis hebt.</p></div><div id="fulllist"></div>',
 '<div class="info"><h3>Zelf iets toevoegen</h3><div class="add"><input id="extra-name" placeholder="Product"><input id="extra-qty" type="number" min="0.1" step="0.1" value="1"><select id="extra-unit"><option>st.</option><option>g</option><option>ml</option><option>pak</option><option>fles</option></select></div><button class="secondary wide" id="add" style="margin-top:10px">Voeg toe aan lijst</button></div>',
 '<a href="https://www.collectandgo.be/nl/online-boodschappen-colruyt-webshop" target="_blank" rel="noopener noreferrer" class="primary wide" style="display:block;text-align:center;text-decoration:none">Open Collect&Go ↗</a><p class="note">Je kunt de lijst kopiëren. Rechtstreekse synchronisatie met het Collect&Go-winkelmandje is niet beschikbaar.</p></section>',
 '<section class="tabs" data-view="settings"><div class="hero"><h2>Instellingen</h2><p>Je keuzes worden lokaal op dit toestel opgeslagen.</p></div><div class="info"><h3>Recepten en foto’s</h3><p>De app bevat Colruyt-recepten met bronlinks en enkele eigen recepten. Wanneer er geen foto beschikbaar is, wordt dat duidelijk aangegeven. Prijzen zijn schattingen, geen actuele Collect&Go-prijzen.</p></div><div class="info"><h3>Op iPhone installeren</h3><p>Open de website in Safari, tik op Delen en vervolgens op Zet op beginscherm.</p></div><div class="info"><h3>Lijst opnieuw instellen</h3><button id="reset" class="secondary">Vinkjes en voorraad wissen</button></div></section>',
 '<div id="notice" role="status" aria-live="polite" class="tiny"></div>'
 ].join("");
 var nav=document.querySelector("nav.nav");
 nav.innerHTML='<button data-go="menu" class="on"><i>⌂</i>Menu</button><button data-go="recipes"><i>♡</i>Recepten</button><button data-go="list"><i>☑</i>Lijst</button><button data-go="settings"><i>⚙</i>Instellingen</button>';
 document.getElementById("modal").innerHTML='<div class="sheet"><button class="secondary" id="close" style="float:right">Sluiten ✕</button><div style="clear:both"></div><div id="modal-body"></div></div>';
}
setup();
document.addEventListener("click",function(e){
 var b=e.target.closest("button");if(!b)return;
 if(b.dataset.go){s.tab=b.dataset.go;render();window.scrollTo(0,0)}
 else if(b.dataset.adjust)change(b.dataset.adjust,num(b.dataset.delta,0));
 else if(b.dataset.meat){var m=b.dataset.meat;if(s.meat.length===1&&s.meat.includes(m)&&s.counts.vlees>0){notice("Kies minstens één vleessoort of zet het aantal vleesgerechten op nul.");return}s.meat=s.meat.includes(m)?s.meat.filter(function(x){return x!==m}):s.meat.concat(m);s.seed++;generate();render()}
 else if(b.id==="regen"){s.seed++;generate();render()}
 else if(b.id==="soupbtn"){s.soup=!s.soup;render()}
 else if(b.dataset.swap!==undefined)picker(+b.dataset.swap);
 else if(b.dataset.detail)detail(b.dataset.detail);
 else if(b.dataset.addrecipe)assign(b.dataset.addrecipe);
 else if(b.dataset.pick){s.plan[+b.dataset.slot]=b.dataset.pick;closeModal();render()}
 else if(b.dataset.assignto){if(!s.plan.some(function(id,i){return id===b.dataset.recipe&&i!==+b.dataset.assignto})){s.plan[+b.dataset.assignto]=b.dataset.recipe;closeModal();render()}else notice("Dit gerecht staat al op je menu.")}
 else if(b.dataset.filter){s.filter=b.dataset.filter;renderLibrary()}
 else if(b.dataset.stock){var k=b.dataset.stock;s.stock=s.stock.includes(k)?s.stock.filter(function(x){return x!==k}):s.stock.concat(k);s.done=s.done.filter(function(x){return x!==k});render()}
 else if(b.dataset.delete){s.extra=s.extra.filter(function(x){return "extra:"+key(x)!==b.dataset.delete});render()}
 else if(b.id==="add"){var name=document.getElementById("extra-name").value.trim(),n=+document.getElementById("extra-qty").value;if(!name||!(n>0)){notice("Vul een product met een geldige hoeveelheid in.");return}s.extra.push({name:name,qty:n,unit:document.getElementById("extra-unit").value,aisle:"Overig",storage:"Voorraad"});document.getElementById("extra-name").value="";render()}
 else if(b.id==="copy"){var txt=copyValue();if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(txt).then(function(){notice("Lijst gekopieerd.")}).catch(function(){fallbackCopy(txt)});else fallbackCopy(txt)}
 else if(b.id==="print")window.print();
 else if(b.id==="reset"){if(confirm("Alle vinkjes en producten in voorraad wissen?")){s.done=[];s.stock=[];render()}}
 else if(b.id==="close")closeModal();
});
document.addEventListener("change",function(e){if(e.target.dataset.done){var k=e.target.dataset.done;s.done=e.target.checked?s.done.filter(function(x){return x!==k}).concat(k):s.done.filter(function(x){return x!==k});render()}});
document.getElementById("persons").addEventListener("input",function(e){s.p=+e.target.value;render()});
document.getElementById("budget").addEventListener("input",function(e){s.b=+e.target.value;render()});
document.getElementById("recipe-search").addEventListener("input",function(e){s.search=e.target.value;renderLibrary()});
document.getElementById("modal").addEventListener("click",function(e){if(e.target.id==="modal")closeModal()});
document.addEventListener("keydown",function(e){if(e.key==="Escape")closeModal()});
render();
if("serviceWorker" in navigator)window.addEventListener("load",function(){navigator.serviceWorker.register("./sw.js").catch(function(){})});
})();
