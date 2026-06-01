(async () => {
  const base = process.env.API_BASE || 'http://localhost:3000';
  const t = Date.now();
  const seller = { email: `seller.${t}@example.com`, password: 'Password1!', name: 'Seller Test', rm: 1000, curso: 'Engenharia', telNumero: '999999999' };
  const buyer = { email: `buyer.${t}@example.com`, password: 'Password1!', name: 'Buyer Test', rm: 2000, curso: 'Design', telNumero: '888888888' };
  const fetchJson = async (url, opts) => {
    const res = await fetch(url, opts);
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch { data = text; }
    return { status: res.status, ok: res.ok, data };
  };

  console.log('API_BASE=', base);

  console.log('\n1) Criando seller...');
  const r1 = await fetchJson(`${base}/cadastro`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(seller)
  });
  console.log(r1.status, JSON.stringify(r1.data));
  const sellerId = r1.data && r1.data.user ? r1.data.user.id : r1.data && r1.data.id;

  console.log('\n2) Criando buyer...');
  const r2 = await fetchJson(`${base}/cadastro`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(buyer)
  });
  console.log(r2.status, JSON.stringify(r2.data));
  const buyerId = r2.data && r2.data.user ? r2.data.user.id : r2.data && r2.data.id;

  console.log('\n3) Criando produto (sellerId=' + sellerId + ')');
  const productPayload = {
    userId: Number(sellerId), name: 'Teste Produto Node', categoria: 'Geral', preco: 9.9, condicao: '8', imagem: ['data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA'], descricao: 'Produto de teste', disponibilidade: true, local: ['Campus'], horario: ['Tarde']
  };
  const r3 = await fetchJson(`${base}/produtos`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(productPayload)
  });
  console.log(r3.status, JSON.stringify(r3.data));
  const produtoId = r3.data && r3.data.produto ? r3.data.produto.id : r3.data && r3.data.id;

  console.log('\n4) Registrando interesse (buyerId=' + buyerId + ', produtoId=' + produtoId + ')');
  const interestPayload = { userId: Number(buyerId), produtoId: Number(produtoId), local: ['Campus'], horario: ['Tarde'] };
  const r4 = await fetchJson(`${base}/produtos/interesse`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(interestPayload)
  });
  console.log(r4.status, JSON.stringify(r4.data));

  console.log('\n5) GET /produtos (verificando produto criado)');
  const r5 = await fetchJson(`${base}/produtos/${produtoId}`);
  console.log(r5.status, JSON.stringify(r5.data));

})();
