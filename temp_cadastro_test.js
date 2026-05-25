const fs = require('fs');
const vm = require('vm');

function makeDoc(inputs) {
  const elems = {};
  Object.entries(inputs).forEach(([id, value]) => {
    elems[id] = { id, value: value, valueRaw: value, focus: () => {}, style: {}, classList: { add(){}, remove(){}, toggle(){}} };
    Object.defineProperty(elems[id], 'value', {
      get(){ return this.valueRaw; },
      set(v){ this.valueRaw = v; }
    });
  });
  return {
    getElementById: id => elems[id],
    querySelector: sel => {
      if (sel === '.branco button' || sel === '.voltar button') return { addEventListener: () => {} };
      return null;
    },
    querySelectorAll: sel => {
      if (sel === '.regras-senha li') return (inputs.rules || []).map(() => ({ classList: { add(){}, remove(){}, toggle(){}} }));
      return [];
    },
    addEventListener: (evt, cb) => { if (evt === 'DOMContentLoaded') cb(); },
  };
}

function makeWindow() {
  return { name: '', localStorage: new Map() };
}

function createContext(inputIds, sharedStorage) {
  const window = makeWindow();
  if (sharedStorage) window.localStorage = sharedStorage;
  const document = makeDoc(inputIds);
  const ctx = vm.createContext({
    window,
    document,
    console,
    localStorage: {
      getItem(k){ return window.localStorage.has(k) ? window.localStorage.get(k) : null; },
      setItem(k,v){ window.localStorage.set(k, String(v)); },
      removeItem(k){ window.localStorage.delete(k); }
    },
    JSON,
    alert: (msg)=>{ console.log('ALERT:', msg); },
    fetch: () => {},
    URL: {},
  });
  return ctx;
}

function evalScript(path, context) {
  const src = fs.readFileSync(path, 'utf8');
  const script = new vm.Script(src, { filename: path });
  script.runInContext(context);
}

function run() {
  let ctx1 = createContext({ email:'test@example.com', cpf:'11122233344', rm:'123456' });
  evalScript('./script/cadastro.js', ctx1);
  console.log('step1 valid', vm.runInContext('validarFormulario()', ctx1));
  vm.runInContext('saveCadastroStep1()', ctx1);
  console.log('stored step1', Array.from(ctx1.window.localStorage.entries()));

  let ctx2 = createContext({ nome:'Fulano', telefone:'11999999999', curso:'informatica' }, ctx1.window.localStorage);
  evalScript('./script/cadastro2.js', ctx2);
  console.log('step2 valid', vm.runInContext('validarFormulario()', ctx2));
  vm.runInContext('saveCadastroStep2()', ctx2);
  console.log('stored step2', Array.from(ctx2.window.localStorage.entries()));

  let ctx3 = createContext({ senha:'Senha@123', 'confirmar-senha':'Senha@123', rules:[1,2,3,4] }, ctx2.window.localStorage);
  evalScript('./script/cadastro3.js', ctx3);
  console.log('stored step3', Array.from(ctx3.window.localStorage.entries()));
  console.log('cadastro data', vm.runInContext('getCadastroData()', ctx3));
  console.log('valid form', vm.runInContext('validarFormulario()', ctx3));
}

run();
