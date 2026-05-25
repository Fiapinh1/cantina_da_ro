const SUPABASE_URL = "https://hxqcejkoqmivlqffjqzq.supabase.co";
    const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4cWNlamtvcW1pdmxxZmZqcXpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NzkwNDksImV4cCI6MjA5NDI1NTA0OX0.oHXgXmjJuM8SqH2nwIOzsJH5HEQnM9ApbRom2SqTwLA";
    const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    lucide.createIcons();

    let allOrders = [];
    let currentOrder = null;
    let validationHistory = JSON.parse(localStorage.getItem('validationHistory') || '[]');

    // Carregar pedidos
    async function loadOrders(){
      console.log('Carregando pedidos...');
      
      // Mostrar loading
      document.getElementById('statTotal').textContent = '...';
      document.getElementById('statValidated').textContent = '...';
      document.getElementById('statPending').textContent = '...';
      document.getElementById('statPaid').textContent = '...';
      
      try {
        const { data, error } = await supabaseClient
          .from('pedidos')
          .select('*');
        
        if(error) throw error;
        
        allOrders = data || [];
        console.log('Pedidos carregados:', allOrders.length);
        
        updateStats();
      } catch(error){
        console.error('Erro ao carregar pedidos:', error);
        showToast('Erro ao carregar pedidos. Verifique a conexão.', 'error');
        
        // Mostrar 0 nos stats com erro
        document.getElementById('statTotal').textContent = '0';
        document.getElementById('statValidated').textContent = '0';
        document.getElementById('statPending').textContent = '0';
        document.getElementById('statPaid').textContent = '0';
      }
    }

    // Atualizar estatísticas
    function updateStats(){
      console.log('Atualizando stats. Total de pedidos:', allOrders.length);
      
      // MOSTRAR TODOS OS PEDIDOS (removido filtro de data)
      const todayOrders = allOrders.filter(o => o.status !== 'cancelado');
      
      console.log('Pedidos válidos (não cancelados):', todayOrders.length);
      
      const validated = todayOrders.filter(o => o.status === 'entregue').length;
      const pending = todayOrders.filter(o => o.status === 'pendente').length;
      const paid = todayOrders.filter(o => o.pagamento === 'pago').length;

      console.log('Stats:', { total: todayOrders.length, validated, pending, paid });

      document.getElementById('statTotal').textContent = todayOrders.length;
      document.getElementById('statValidated').textContent = validated;
      document.getElementById('statPending').textContent = pending;
      document.getElementById('statPaid').textContent = paid;
    }

    // Buscar e validar token
    async function searchToken(){
      const token = document.getElementById('tokenInput').value.trim().toUpperCase();
      
      if(!token){
        showToast('Digite um token válido!', 'error');
        return;
      }

      // Buscar pedido
      const order = allOrders.find(o => o.token.toUpperCase() === token);

      if(!order){
        showResult('error', '❌', 'Token Não Encontrado', `Token ${token} não existe`);
        return;
      }

      currentOrder = order;

      // Verificar se já foi entregue
      if(order.status === 'entregue'){
        showResult('warning', '⚠️', 'Já Foi Entregue!', 'Este pedido já foi validado');
        fillDetails(order, false);
        return;
      }

      // Verificar se foi cancelado
      if(order.status === 'cancelado'){
        showResult('error', '❌', 'Pedido Cancelado', 'Este pedido foi cancelado');
        fillDetails(order, false);
        return;
      }

      // VERIFICAR PAGAMENTO
      if(order.pagamento === 'aguardando'){
        showResult('warning', '⚠️', 'Pagamento Pendente!', 'Cliente precisa pagar antes');
        fillDetails(order, false, true);
        return;
      }

      // TUDO OK - PODE ENTREGAR
      showResult('success', '✓', 'Pedido Válido!', 'Pronto para entrega');
      fillDetails(order, true);
    }

    // Mostrar resultado
    function showResult(type, icon, title, subtitle){
      const result = document.getElementById('result');
      result.className = `result active ${type}`;
      
      document.getElementById('resultIcon').textContent = icon;
      document.getElementById('resultTitle').textContent = title;
      document.getElementById('resultSubtitle').textContent = subtitle;
      
      lucide.createIcons();
    }

    // Preencher detalhes
    function fillDetails(order, canDeliver, needsPayment = false){
      const grid = document.getElementById('detailsGrid');
      const warningBox = document.getElementById('paymentWarningBox');
      const actionsBox = document.getElementById('actionButtons');

      // DETALHES
      grid.innerHTML = `
        <div class="detail-row">
          <div class="detail-icon">
            <i data-lucide="user"></i>
          </div>
          <div class="detail-content">
            <p class="detail-label">Cliente</p>
            <p class="detail-value">${order.nome}</p>
          </div>
        </div>

        <div class="detail-row">
          <div class="detail-icon">
            <i data-lucide="phone"></i>
          </div>
          <div class="detail-content">
            <p class="detail-label">Contato</p>
            <p class="detail-value">${order.contato}</p>
          </div>
        </div>

        <div class="detail-row">
          <div class="detail-icon">
            <i data-lucide="shopping-bag"></i>
          </div>
          <div class="detail-content">
            <p class="detail-label">Quantidade</p>
            <p class="detail-value">${order.quantidade} porção${order.quantidade > 1 ? 's' : ''}</p>
          </div>
        </div>

        <div class="detail-row">
          <div class="detail-icon">
            <i data-lucide="dollar-sign"></i>
          </div>
          <div class="detail-content">
            <p class="detail-label">Valor</p>
            <p class="detail-value">${order.valor}</p>
          </div>
        </div>

        <div class="detail-row">
          <div class="detail-icon">
            <i data-lucide="credit-card"></i>
          </div>
          <div class="detail-content">
            <p class="detail-label">Pagamento</p>
            <div class="payment-status ${order.pagamento === 'pago' ? 'paid' : 'pending'}">
              <i data-lucide="${order.pagamento === 'pago' ? 'check-circle' : 'clock'}"></i>
              ${order.pagamento === 'pago' ? '✓ Pago' : '⏳ Aguardando'}
            </div>
          </div>
        </div>

        <div class="detail-row">
          <div class="detail-icon">
            <i data-lucide="package"></i>
          </div>
          <div class="detail-content">
            <p class="detail-label">Itens</p>
            <p class="detail-value">${order.itens || 'Galinhada, Vinagrete'}</p>
          </div>
        </div>
      `;

      // AVISO DE PAGAMENTO
      if(needsPayment){
        warningBox.innerHTML = `
          <div class="payment-warning">
            <div class="payment-warning-icon">⚠️</div>
            <div class="payment-warning-text">
              <p class="payment-warning-title">Pagamento Pendente</p>
              <p class="payment-warning-desc">O cliente precisa pagar antes de retirar (${order.valor})</p>
            </div>
          </div>
        `;
      } else {
        warningBox.innerHTML = '';
      }

      // BOTÕES DE AÇÃO
      if(canDeliver){
        actionsBox.innerHTML = `
          <button class="action-btn btn-confirm" onclick="confirmDelivery()">
            <i data-lucide="check-circle"></i>
            Confirmar Entrega
          </button>
          <button class="action-btn btn-new" onclick="newSearch()">
            <i data-lucide="rotate-ccw"></i>
            Nova Busca
          </button>
        `;
      } else if(needsPayment){
        actionsBox.innerHTML = `
          <button class="action-btn btn-payment" onclick="confirmPaymentAndDeliver()">
            <i data-lucide="dollar-sign"></i>
            Cliente Pagou Agora
          </button>
          <button class="action-btn btn-new" onclick="newSearch()">
            <i data-lucide="x-circle"></i>
            Cancelar (Cliente Não Pagou)
          </button>
        `;
      } else {
        actionsBox.innerHTML = `
          <button class="action-btn btn-new" onclick="newSearch()">
            <i data-lucide="rotate-ccw"></i>
            Nova Busca
          </button>
        `;
      }

      lucide.createIcons();
    }

    // Confirmar entrega (pagamento OK)
    async function confirmDelivery(){
      if(!currentOrder) return;

      try {
        const { error } = await supabaseClient
          .from('pedidos')
          .update({ status: 'entregue' })
          .eq('id', currentOrder.id);

        if(error) throw error;

        addToHistory(currentOrder);
        showToast(`✓ Pedido de ${currentOrder.nome} entregue!`);
        
        setTimeout(() => {
          newSearch();
          loadOrders();
        }, 1500);

      } catch(error){
        console.error('Erro:', error);
        showToast('Erro ao confirmar entrega', 'error');
      }
    }

    // Confirmar pagamento E entregar
    async function confirmPaymentAndDeliver(){
      if(!currentOrder) return;

      try {
        // 1. Marcar como pago e entregue
        const { error } = await supabaseClient
          .from('pedidos')
          .update({ pagamento: 'pago', status: 'entregue' })
          .eq('id', currentOrder.id);

        if(error) throw error;

        addToHistory(currentOrder);
        showToast(`✓ Pagamento recebido! Pedido de ${currentOrder.nome} entregue!`);
        
        setTimeout(() => {
          newSearch();
          loadOrders();
        }, 1500);

      } catch(error){
        console.error('Erro:', error);
        showToast('Erro ao processar', 'error');
      }
    }

    // Nova busca
    function newSearch(){
      document.getElementById('result').classList.remove('active');
      document.getElementById('tokenInput').value = '';
      document.getElementById('tokenInput').focus();
      currentOrder = null;
    }

    // Adicionar ao histórico
    function addToHistory(order){
      const item = {
        nome: order.nome,
        token: order.token,
        valor: order.valor,
        quantidade: order.quantidade,
        pagamento: order.pagamento,
        timestamp: new Date().toLocaleTimeString('pt-BR')
      };

      validationHistory.unshift(item);
      if(validationHistory.length > 10) validationHistory.pop();
      
      localStorage.setItem('validationHistory', JSON.stringify(validationHistory));
      renderHistory();
    }

    // Renderizar histórico
    function renderHistory(){
      const list = document.getElementById('historyList');
      
      if(validationHistory.length === 0){
        list.innerHTML = `
          <div class="empty-history">
            <i data-lucide="inbox" style="width:48px;height:48px;opacity:.3;margin-bottom:12px;"></i>
            <p>Nenhuma validação ainda</p>
          </div>
        `;
        lucide.createIcons();
        return;
      }

      list.innerHTML = validationHistory.map(item => `
        <div class="history-item">
          <p class="history-name">${item.nome}</p>
          <p class="history-details">
            <span>🔑 ${item.token}</span>
            <span>💰 ${item.valor}</span>
            <span>${item.quantidade} porção${item.quantidade > 1 ? 's' : ''}</span>
            <span>${item.pagamento === 'pago' ? '✅ Pago' : '⏳ Pendente'}</span>
            <span>🕐 ${item.timestamp}</span>
          </p>
        </div>
      `).join('');
    }

    // Toast notification
    function showToast(message, type = 'success'){
      const toast = document.createElement('div');
      toast.className = `toast ${type}`;
      toast.innerHTML = `
        <i data-lucide="${type === 'success' ? 'check-circle' : 'alert-circle'}"></i>
        <span>${message}</span>
      `;
      
      document.body.appendChild(toast);
      lucide.createIcons();
      
      setTimeout(() => toast.remove(), 3000);
    }

    // Event listeners
    document.getElementById('searchBtn').addEventListener('click', searchToken);
    document.getElementById('tokenInput').addEventListener('keypress', (e) => {
      if(e.key === 'Enter') searchToken();
    });

    // Auto-focus no input após validação
    document.getElementById('tokenInput').addEventListener('input', (e) => {
      e.target.value = e.target.value.toUpperCase();
    });

    // Carregar dados
    loadOrders();
    renderHistory();
    setInterval(loadOrders, 30000); // Atualizar a cada 30s

