// Individueel gerecht vervangen zonder het volledige weekmenu te wijzigen.
let singleReplacements=(()=>{try{const v=JSON.parse(localStorage.singleReplacements||'{}');return v&&typeof v==='object'?v:{}}catch{return {}}})();
const baseChosen=chosen;
chosen=function(){
  const base=baseChosen();
  const pool=filteredRecipes();
  const used=new Set();
  return base.map((fallback,pos)=>{
    const wanted=pool.find(r=>r.id===singleReplacements[pos]);
    const pick=wanted&&!used.has(wanted.id)?wanted:fallback;
    used.add(pick.id);
    return pick;
  });
};
function saveSingleReplacements(){
  localStorage.singleReplacements=JSON.stringify(singleReplacements);
}
function replaceOneRecipe(pos){
  const pool=filteredRecipes();
  const current=chosen();
  if(pool.length<=1||!current[pos]) return;
  const used=new Set(current.filter((_,i)=>i!==pos).map(r=>r.id));
  const start=pool.findIndex(r=>r.id===current[pos].id);
  for(let step=1;step<=pool.length;step++){
    const candidate=pool[(Math.max(start,0)+step)%pool.length];
    if(!used.has(candidate.id)){
      singleReplacements[pos]=candidate.id;
      saveSingleReplacements();
      render();
      return;
    }
  }
}
function decorateRecipeSwapButtons(){
  $$('#recipeGrid .recipe').forEach((el,pos)=>{
    const body=el.querySelector('.rb');
    if(!body||body.querySelector('[data-swap-one]')) return;
    const btn=document.createElement('button');
    btn.type='button';
    btn.className='swap';
    btn.dataset.swapOne=String(pos);
    btn.textContent='Vervang ↻';
    btn.onclick=e=>{e.stopPropagation();replaceOneRecipe(pos)};
    body.appendChild(btn);
  });
}
const baseRender=render;
render=function(){
  baseRender();
  decorateRecipeSwapButtons();
};
const oldDishes=dishes.oninput;
dishes.oninput=e=>{singleReplacements={};saveSingleReplacements();oldDishes(e)};
const oldGenerate=generate.onclick;
generate.onclick=refresh.onclick=e=>{singleReplacements={};saveSingleReplacements();oldGenerate(e)};
$$('.chip').forEach(c=>{
  const old=c.onclick;
  c.onclick=e=>{singleReplacements={};saveSingleReplacements();old(e)};
});
render();