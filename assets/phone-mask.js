function initPhoneMask(field) {
  const template='+7 (___) ___-__-__';
  const slots=[4,5,6,9,10,11,13,14,16,17];
  let digits='',writing=false,history=[],future=[];
  function normalize(text){
    let value=text.replace(/\D/g,'');
    if(/^\s*\+7/.test(text)||(value.length>=11&&/^[78]/.test(value)))value=value.slice(1);
    return value.slice(0,10);
  }
  function index(position){return slots.filter(slot=>slot<position).length;}
  function validate(){
    field.setCustomValidity(digits.length===10?'':'Введите номер телефона полностью: +7 и 10 цифр.');
    return digits.length===10;
  }
  function render(caret){
    writing=true;
    let slot=0;
    field.value=digits||document.activeElement===field
      ?template.replace(/_/g,()=>digits[slot++]||'_'):'';
    validate();
    if(caret!==undefined)field.setSelectionRange(slots[Math.min(caret,9)]+(caret>=10?1:0),slots[Math.min(caret,9)]+(caret>=10?1:0));
    writing=false;
  }
  function commit(next,caret){
    history.push({digits,caret:index(field.selectionStart||0)});
    if(history.length>100)history.shift();
    future=[];digits=next;render(caret);
    writing=true;field.dispatchEvent(new Event('input',{bubbles:true}));writing=false;
  }
  function insert(text){
    const raw=text.replace(/\D/g,'');
    if(!raw)return;
    const start=index(field.selectionStart||0),end=index(field.selectionEnd||0);
    if(raw.length>=10||/^\s*\+7/.test(text)){
      const number=normalize(text);commit(number,number.length);return;
    }
    const result=(digits.slice(0,start)+raw+digits.slice(end)).slice(0,10);
    commit(result,Math.min(start+raw.length,10));
  }
  field.addEventListener('focus',()=>{
    digits=normalize(field.value);render(digits.length);
  });
  field.addEventListener('blur',()=>render());
  field.addEventListener('paste',event=>{
    event.preventDefault();insert(event.clipboardData.getData('text'));
  });
  field.addEventListener('beforeinput',event=>{
    if(!event.cancelable||event.isComposing)return;
    if(event.inputType.startsWith('insert')&&event.data!==null){
      event.preventDefault();insert(event.data);return;
    }
    if(!event.inputType.startsWith('delete'))return;
    event.preventDefault();
    let start=index(field.selectionStart||0),end=index(field.selectionEnd||0);
    if(start===end){
      if(event.inputType.includes('Backward'))start=Math.max(0,start-1);
      else if(event.inputType.includes('Forward'))end=Math.min(digits.length,end+1);
    }
    if(event.inputType==='deleteWordBackward')start=0;
    if(event.inputType==='deleteWordForward')end=digits.length;
    commit(digits.slice(0,start)+digits.slice(end),start);
  });
  function sync(){
    if(writing)return;
    const position=field.selectionStart||0;
    const caret=field.value.startsWith('+7 (')?index(position):normalize(field.value.slice(0,position)).length;
    digits=normalize(field.value);render(Math.min(caret,digits.length));
  }
  field.addEventListener('input',event=>{if(!event.isComposing)sync();});
  field.addEventListener('compositionend',sync);
  field.addEventListener('change',sync);
  field.addEventListener('keydown',event=>{
    if(!(event.ctrlKey||event.metaKey)||event.altKey)return;
    const key=event.key.toLowerCase();
    if(key!=='z'&&key!=='y')return;
    event.preventDefault();
    const undo=key==='z'&&!event.shiftKey;
    const from=undo?history:future,to=undo?future:history;
    const state=from.pop();if(!state)return;
    to.push({digits,caret:index(field.selectionStart||0)});
    digits=state.digits;render(state.caret);
  });
  digits=normalize(field.value);
  if(digits)render();
  return validate;
}
