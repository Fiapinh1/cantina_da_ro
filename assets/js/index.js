(function(){
      const navbar = document.querySelector('.navbar');
      const menu = document.querySelector('.navbar-menu');

      function positionMobileMenu(){
        if(!navbar || !menu) return;
        if(window.innerWidth <= 767){
          if(menu.parentElement !== document.body){
            document.body.appendChild(menu);
          }
        }else if(menu.parentElement !== navbar){
          navbar.appendChild(menu);
        }
      }

      positionMobileMenu();
      window.addEventListener('resize', positionMobileMenu);
    })();

const SUPABASE_URL = "https://hxqcejkoqmivlqffjqzq.supabase.co";
    const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4cWNlamtvcW1pdmxxZmZqcXpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NzkwNDksImV4cCI6MjA5NDI1NTA0OX0.oHXgXmjJuM8SqH2nwIOzsJH5HEQnM9ApbRom2SqTwLA";
    const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    lucide.createIcons();

    let allOrders = [];
    let currentOrder = null;

    // Sistema de notificações Toast
    function showToast(message, type = 'success'){
      // Remover toasts antigos
      document.querySelectorAll('.toast').forEach(t => t.remove());

      const toast = document.createElement('div');
      toast.className = `toast ${type}`;
      
      const icon = type === 'success' ? 'check-circle' : 'alert-circle';
      
      toast.innerHTML = `
        <i data-lucide="${icon}" class="toast-icon"></i>
        <span class="toast-message">${message}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">
          <i data-lucide="x"></i>
        </button>
      `;
      
      document.body.appendChild(toast);
      lucide.createIcons();
      
      // Auto remover após 4 segundos
      setTimeout(() => {
        toast.classList.add('hiding');
        setTimeout(() => toast.remove(), 300);
      }, 4000);
    }

    // Carregar pedidos
    async function loadOrders(){
      const loadingEl = document.getElementById('loadingState');
      const emptyEl = document.getElementById('emptyState');
      const listEl = document.getElementById('ordersList');

      loadingEl.style.display = 'block';
      emptyEl.style.display = 'none';
      listEl.innerHTML = '';

      try {
        const { data, error } = await supabaseClient
          .from('pedidos')
          .select('*')
          .order('timestamp', { ascending: false });

        if(error) throw error;
        
        allOrders = data || [];
        
        if(allOrders.length === 0){
          loadingEl.style.display = 'none';
          emptyEl.style.display = 'block';
          updateStats();
        } else {
          loadingEl.style.display = 'none';
          renderOrders();
          updateStats();
        }

      } catch(error){
        console.error('Erro:', error);
        loadingEl.innerHTML = '<p style="color:var(--danger)">❌ Erro ao carregar</p>';
      }
    }

    // Renderizar pedidos
    function renderOrders(){
      const listEl = document.getElementById('ordersList');
      const filterName = document.getElementById('filterName').value.toLowerCase();
      const filterStatus = document.getElementById('filterStatus').value;
      const filterPayment = document.getElementById('filterPayment').value;

      let filtered = allOrders.filter(order => {
        const matchName = order.nome.toLowerCase().includes(filterName);
        const matchStatus = !filterStatus || order.status === filterStatus;
        const matchPayment = !filterPayment || order.pagamento === filterPayment;
        return matchName && matchStatus && matchPayment;
      });

      listEl.innerHTML = '';

      if(filtered.length === 0){
        listEl.innerHTML = '<div class="empty-state"><i data-lucide="inbox"></i><h3>Nenhum pedido encontrado</h3></div>';
        lucide.createIcons();
        return;
      }

      filtered.forEach(order => {
        const card = document.createElement('div');
        card.className = 'order-card';
        
        const statusClass = order.status === 'entregue' ? 'delivered' : order.status === 'cancelado' ? 'cancelled' : 'pending';
        const statusText = order.status === 'entregue' ? 'Entregue' : order.status === 'cancelado' ? 'Cancelado' : 'Pendente';
        
        card.innerHTML = `
          <div class="order-header">
            <div class="order-client">
              <p class="order-name">${order.nome}</p>
              <p class="order-date">${new Date(order.timestamp).toLocaleString('pt-BR')}</p>
            </div>
            <span class="status-badge ${statusClass}">${statusText}</span>
          </div>

          <div class="order-info">
            <div class="order-row">
              <i data-lucide="phone"></i>
              <strong>Contato:</strong>
              <span>${order.contato}</span>
            </div>
            <div class="order-row">
              <i data-lucide="shopping-bag"></i>
              <strong>Quantidade:</strong>
              <span>${order.quantidade} porção${order.quantidade > 1 ? 's' : ''}</span>
            </div>
            <div class="order-row">
              <i data-lucide="utensils"></i>
              <strong>Produtos:</strong>
              <span>${order.itens || '-'}</span>
            </div>
            <div class="order-row">
              <i data-lucide="dollar-sign"></i>
              <strong>Valor:</strong>
              <span>${order.valor}</span>
            </div>
            <div class="order-row">
              <i data-lucide="credit-card"></i>
              <strong>Pagamento:</strong>
              <span class="status-badge ${order.pagamento === 'pago' ? 'delivered' : 'pending'}">
                ${order.pagamento === 'pago' ? '✅ Pago' : '⏳ Aguardando'}
              </span>
            </div>
          </div>

          <div class="order-token">
            <p class="order-token-label">🔑 Token</p>
            <p class="order-token-value">${order.token}</p>
          </div>

          <div class="order-actions" style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;">
            <button class="action-btn" onclick="openEditModal(allOrders.find(o => o.id === ${order.id}))" style="background:rgba(59,130,246,.15);color:#3b82f6;border:2px solid #3b82f6;">
              <i data-lucide="edit-3"></i> Editar
            </button>
            ${order.status === 'pendente' ? `
              <button class="action-btn primary" onclick="openValidateModal(${order.id})">
                <i data-lucide="check"></i> Validar
              </button>
            ` : `
              <button class="action-btn secondary" onclick="openChangeStatusModal(${order.id})">
                <i data-lucide="sliders"></i> Status
              </button>
            `}
            <button class="action-btn" onclick="reprintVoucher(${order.id})" style="background:rgba(168,85,247,.15);color:#a855f7;border:2px solid #a855f7;grid-column:span 2;">
              <i data-lucide="printer"></i> Reimprimir Vale
            </button>
            <button class="action-btn danger subtle" onclick="openDeleteModal(${order.id})" style="grid-column:span 2;">
              <i data-lucide="trash-2"></i> Excluir Pedido
            </button>
          </div>
        `;

        listEl.appendChild(card);
      });

      lucide.createIcons();
    }

    // Atualizar estatísticas
    function updateStats(){
      // Filtrar apenas pedidos NÃO cancelados
      const activeOrders = allOrders.filter(o => o.status !== 'cancelado');
      
      const total = activeOrders.length;
      const pending = activeOrders.filter(o => o.status === 'pendente' || !o.status || o.status === '').length;
      const delivered = activeOrders.filter(o => o.status === 'entregue').length;
      
      // Calcular receita total (vendido)
      const revenue = activeOrders.reduce((sum, order) => {
        try {
          const valorStr = (order.valor || 'R$ 0,00').toString();
          const value = parseFloat(valorStr.replace('R$', '').replace('.', '').replace(',', '.').trim());
          return sum + (isNaN(value) ? 0 : value);
        } catch(e) {
          return sum;
        }
      }, 0);
      
      // Calcular valores PAGOS vs PENDENTES
      const paidRevenue = activeOrders
        .filter(o => o.pagamento === 'pago')
        .reduce((sum, order) => {
          try {
            const valorStr = (order.valor || 'R$ 0,00').toString();
            const value = parseFloat(valorStr.replace('R$', '').replace('.', '').replace(',', '.').trim());
            return sum + (isNaN(value) ? 0 : value);
          } catch(e) {
            return sum;
          }
        }, 0);
      
      const pendingRevenue = activeOrders
        .filter(o => o.pagamento !== 'pago')
        .reduce((sum, order) => {
          try {
            const valorStr = (order.valor || 'R$ 0,00').toString();
            const value = parseFloat(valorStr.replace('R$', '').replace('.', '').replace(',', '.').trim());
            return sum + (isNaN(value) ? 0 : value);
          } catch(e) {
            return sum;
          }
        }, 0);

      // Atualizar cards
      document.getElementById('statTotal').textContent = total;
      document.getElementById('statPending').textContent = pending;
      document.getElementById('statDelivered').textContent = delivered;
      document.getElementById('statRevenue').textContent = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(revenue);
      
      // Novos cards de pagamento
      document.getElementById('statPaid').textContent = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(paidRevenue);
      
      document.getElementById('statPendingPayment').textContent = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(pendingRevenue);
    }

    // Modais
    // Reimprimir vale
    async function reprintVoucher(id){
      const order = allOrders.find(o => o.id === id);
      if(!order) return;

      showToast('Gerando vale...', 'success');

      // Criar vale HTML
      const voucherHTML = `
        <div style="width:400px;background:#fff;padding:0;border-radius:20px;box-shadow:0 10px 40px rgba(0,0,0,.2);overflow:hidden;font-family:'Poppins',sans-serif;">
          <div style="background:linear-gradient(135deg,#ff6b35 0%,#f77f00 100%);padding:24px;text-align:center;">
            <div style="font-size:28px;font-weight:900;color:#fff;margin:0 0 8px 0;">🥣 VALE CALDOS</div>
            <div style="font-size:13px;font-weight:600;color:rgba(255,255,255,.9);text-transform:uppercase;letter-spacing:1px;margin:0;">Cantina da Rô</div>
          </div>

          <div style="background:#f5f3f0;padding:16px;text-align:center;border-bottom:2px dashed #d9b99a;">
            <div style="font-size:12px;font-weight:700;color:#b8a89a;text-transform:uppercase;margin:0 0 4px 0;">Data de Retirada</div>
            <div style="font-size:22px;font-weight:900;color:#3d2a23;margin:0;">06/06</div>
          </div>

          <div style="background:#fff;padding:24px;">
            <div style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:2px solid rgba(61,42,35,.1);">
              <div style="width:40px;height:40px;background:linear-gradient(135deg,#ff6b35,#f77f00);border-radius:12px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:20px;">👤</div>
              <div style="flex:1;">
                <div style="font-size:11px;font-weight:700;color:#b8a89a;text-transform:uppercase;margin:0 0 2px 0;">Cliente</div>
                <div style="font-size:16px;font-weight:700;color:#3d2a23;margin:0;">${order.nome}</div>
              </div>
            </div>

            <div style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:2px solid rgba(61,42,35,.1);">
              <div style="width:40px;height:40px;background:linear-gradient(135deg,#ff6b35,#f77f00);border-radius:12px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:16px;">📞</div>
              <div style="flex:1;">
                <div style="font-size:11px;font-weight:700;color:#b8a89a;text-transform:uppercase;margin:0 0 2px 0;">Contato</div>
                <div style="font-size:16px;font-weight:700;color:#3d2a23;margin:0;">${order.contato}</div>
              </div>
            </div>

            <div style="display:flex;align-items:center;gap:12px;padding:12px 0;">
              <div style="width:40px;height:40px;background:linear-gradient(135deg,#ff6b35,#f77f00);border-radius:12px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:16px;">🛍️</div>
              <div style="flex:1;">
                <div style="font-size:11px;font-weight:700;color:#b8a89a;text-transform:uppercase;margin:0 0 2px 0;">Quantidade & Valor</div>
                <div style="font-size:16px;font-weight:700;color:#3d2a23;margin:0;">${String(order.quantidade).padStart(2,'0')} marmita${order.quantidade > 1 ? 's' : ''} - ${order.valor}</div>
              </div>
            </div>

            <div style="display:flex;align-items:center;gap:12px;padding:12px 0;">
              <div style="width:40px;height:40px;background:linear-gradient(135deg,#ff6b35,#f77f00);border-radius:12px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:16px;">📍</div>
              <div style="flex:1;">
                <div style="font-size:11px;font-weight:700;color:#b8a89a;text-transform:uppercase;margin:0 0 2px 0;">Endereço de Retirada</div>
                <div style="font-size:15px;font-weight:700;color:#3d2a23;margin:0;">R. Yolanda Motta Leite, 1439</div>
              </div>
            </div>
          </div>

          <div style="background:rgba(255,107,53,.15);padding:18px;border-bottom:2px solid rgba(61,42,35,.1);">
            <div style="font-size:16px;font-weight:900;color:#3d2a23;text-align:center;text-transform:uppercase;margin:0 0 12px 0;">📋 Resumo do Pedido</div>
            <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;">
              ${(order.itens || 'Galinhada, Vinagrete').split(',').map(item => 
                `<span style="background:#fff;color:#3d2a23;padding:10px 20px;border-radius:30px;font-weight:700;font-size:15px;border:2px solid #ff6b35;">${item.trim()}</span>`
              ).join('')}
            </div>
          </div>

          <div style="background:#fff;padding:16px;border-radius:16px;text-align:center;border:2px dashed #ff6b35;margin:16px;">
            <div style="font-size:11px;font-weight:700;color:#b8a89a;text-transform:uppercase;margin:0 0 6px 0;">🔑 Token de Retirada</div>
            <div style="font-size:28px;font-weight:900;color:#ff6b35;font-family:'Courier New',monospace;letter-spacing:3px;margin:0;">${order.token}</div>
          </div>

          <div style="background:linear-gradient(135deg,#4ade80,#22c55e);padding:16px 20px;display:flex;align-items:center;justify-content:center;gap:12px;color:#fff;font-weight:700;font-size:14px;text-align:center;">
            <span style="font-size:24px;">✓</span>
            <span>Apresente este vale no dia da retirada</span>
          </div>
        </div>
      `;

      // Criar elemento temporário fora da tela
      const tempDiv = document.createElement('div');
      tempDiv.style.cssText = 'position:fixed;left:-9999px;top:0;';
      tempDiv.innerHTML = voucherHTML;
      document.body.appendChild(tempDiv);

      // Aguardar um frame para garantir renderização
      await new Promise(resolve => setTimeout(resolve, 100));

      try {
        // Gerar imagem com html2canvas
        const canvas = await html2canvas(tempDiv.firstElementChild, {
          backgroundColor: '#ffffff',
          scale: 2.5,
          useCORS: true,
          logging: false,
          width: 400,
          height: null
        });

        // Converter para download
        canvas.toBlob(function(blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          const fileName = `vale-${order.token}-${order.nome.replace(/\s+/g, '-')}.png`;
          link.download = fileName;
          link.href = url;
          link.click();
          URL.revokeObjectURL(url);
          
          showToast(`Vale de ${order.nome} baixado!`);
        }, 'image/png', 1.0);

      } catch(error){
        console.error('Erro ao gerar vale:', error);
        showToast('Erro ao gerar vale. Tente novamente.', 'error');
      } finally {
        // Remover elemento temporário
        document.body.removeChild(tempDiv);
      }
    }

    function openDeleteModal(id){
      currentOrder = allOrders.find(o => o.id === id);
      if(!currentOrder) return;

      document.getElementById('modalDeleteClientName').textContent = currentOrder.nome;
      document.getElementById('deleteModal').classList.add('active');
      lucide.createIcons();
    }

    async function confirmDelete(){
      if(!currentOrder) return;

      try {
        const { error } = await supabaseClient
          .from('pedidos')
          .delete()
          .eq('id', currentOrder.id);

        if(error) throw error;

        showToast(`Pedido de ${currentOrder.nome} excluído com sucesso!`);
        closeModal();
        loadOrders();

      } catch(error){
        console.error('Erro:', error);
        showToast('Erro ao excluir pedido. Tente novamente.', 'error');
      }
    }

    function openValidateModal(id){
      currentOrder = allOrders.find(o => o.id === id);
      if(!currentOrder) return;
      
      document.getElementById('modalClientName').textContent = currentOrder.nome;
      document.getElementById('modalCorrectToken').textContent = currentOrder.token;
      document.getElementById('tokenInput').value = '';
      document.getElementById('validateModal').classList.add('active');
      document.getElementById('tokenInput').focus();
      lucide.createIcons();
    }

    async function confirmDelivery(){
      const inputToken = document.getElementById('tokenInput').value.trim().toUpperCase();
      
      if(!inputToken){
        showToast('Digite o token!', 'error');
        return;
      }

      if(inputToken !== currentOrder.token.toUpperCase()){
        showToast('Token incorreto! Verifique e tente novamente.', 'error');
        return;
      }

      // VERIFICAR PAGAMENTO ANTES DE ENTREGAR
      if(currentOrder.pagamento === 'aguardando'){
        // Mostrar aviso de pagamento pendente
        const modalPagamento = document.getElementById('validateModal');
        const originalContent = modalPagamento.querySelector('.modal-content').innerHTML;
        
        modalPagamento.querySelector('.modal-content').innerHTML = `
          <h3 style="margin:0 0 20px 0;font-size:20px;display:flex;align-items:center;gap:8px;color:#f59e0b;">
            <i data-lucide="alert-triangle"></i>
            Pagamento Pendente
          </h3>
          <div style="background:rgba(245,158,11,.1);border:2px solid #f59e0b;border-radius:10px;padding:16px;margin-bottom:20px;">
            <p style="margin:0 0 10px 0;font-size:15px;font-weight:600;color:var(--text);">
              Cliente: ${currentOrder.nome}
            </p>
            <p style="margin:0;font-size:14px;color:var(--muted);">
              ⚠️ Este pedido está com pagamento <strong style="color:#f59e0b;">aguardando</strong>
            </p>
          </div>
          <p style="font-size:15px;margin-bottom:20px;color:var(--text);text-align:center;">
            O cliente pagou agora na retirada?
          </p>
          <div style="display:flex;gap:10px;">
            <button 
              onclick="cancelarValidacao()" 
              style="flex:1;padding:14px;border-radius:8px;border:2px solid rgba(255,107,53,.3);background:transparent;color:var(--text);font-weight:600;cursor:pointer;font-family:'Poppins',sans-serif;font-size:15px;"
            >
              Não, Cancelar
            </button>
            <button 
              onclick="confirmarPagamentoEEntregar()" 
              style="flex:1;padding:14px;border-radius:8px;border:none;background:linear-gradient(135deg, #4ade80, #22c55e);color:#000;font-weight:700;cursor:pointer;font-family:'Poppins',sans-serif;font-size:15px;"
            >
              ✓ Sim, Cliente Pagou
            </button>
          </div>
        `;
        
        lucide.createIcons();
        return;
      }

      // PAGAMENTO OK - ENTREGAR NORMALMENTE
      try {
        const { error } = await supabaseClient
          .from('pedidos')
          .update({ status: 'entregue' })
          .eq('id', currentOrder.id);

        if(error) throw error;

        showToast(`Pedido de ${currentOrder.nome} marcado como entregue!`);
        closeModal();
        loadOrders();

      } catch(error){
        console.error('Erro:', error);
        showToast('Erro ao marcar como entregue. Tente novamente.', 'error');
      }
    }

    // Cancelar validação quando pagamento pendente
    function cancelarValidacao(){
      closeModal();
      showToast('Validação cancelada. Solicite o pagamento ao cliente.', 'error');
    }

    // Marcar como pago E entregar
    async function confirmarPagamentoEEntregar(){
      try {
        // 1. Atualizar pagamento para "pago" e status para "entregue"
        const { error } = await supabaseClient
          .from('pedidos')
          .update({ pagamento: 'pago', status: 'entregue' })
          .eq('id', currentOrder.id);

        if(error) throw error;

        showToast(`✓ Pagamento recebido! Pedido de ${currentOrder.nome} entregue!`);
        closeModal();
        loadOrders();

      } catch(error){
        console.error('Erro:', error);
        showToast('Erro ao processar. Tente novamente.', 'error');
      }
    }

    function openChangeStatusModal(id){
      currentOrder = allOrders.find(o => o.id === id);
      if(!currentOrder) return;
      
      document.getElementById('modalStatusClientName').textContent = currentOrder.nome;
      document.getElementById('newStatusSelect').value = currentOrder.status || 'pendente';
      document.getElementById('changeStatusModal').classList.add('active');
      lucide.createIcons();
    }

    async function confirmChangeStatus(){
      const newStatus = document.getElementById('newStatusSelect').value;

      try {
        const { error } = await supabaseClient
          .from('pedidos')
          .update({ status: newStatus })
          .eq('id', currentOrder.id);

        if(error) throw error;

        showToast(`Status alterado para: ${newStatus}`);
        closeModal();
        loadOrders();

      } catch(error){
        console.error('Erro:', error);
        showToast('Erro ao alterar status.', 'error');
      }
    }

    function closeModal(){
      document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
      currentOrder = null;
    }

    // Editar contato
    function parseOrderItemsForEdit(itemsText){
      const result = { Costela: 0, Frango: 0 };
      const text = (itemsText || '').toString();

      text.split(',').forEach(rawItem => {
        const item = rawItem.trim();
        if(!item) return;

        const match = item.match(/^(\d+)x\s+(.+)$/i);
        const qty = match ? parseInt(match[1], 10) : 1;
        const label = (match ? match[2] : item).trim().toLowerCase();

        if(label.includes('costela')){
          result.Costela += isNaN(qty) ? 0 : qty;
        }

        if(label.includes('frango')){
          result.Frango += isNaN(qty) ? 0 : qty;
        }
      });

      return result;
    }

    function getEditProductItems(){
      const costela = parseInt(document.getElementById('editQtyCostela').value || '0', 10) || 0;
      const frango = parseInt(document.getElementById('editQtyFrango').value || '0', 10) || 0;
      const items = [];

      if(costela > 0) items.push({ label:'Costela', qty:costela });
      if(frango > 0) items.push({ label:'Frango', qty:frango });

      return items;
    }

    function updateEditProductSummary(){
      ['editQtyCostela', 'editQtyFrango'].forEach(id => {
        const input = document.getElementById(id);
        if(!input) return;
        const value = Math.max(0, parseInt(input.value || '0', 10) || 0);
        input.value = value;
      });

      const items = getEditProductItems();
      const quantity = items.reduce((sum, item) => sum + item.qty, 0);
      const total = quantity * 20;

      document.getElementById('editQtyInput').value = quantity || '';
      document.getElementById('editTotalHint').textContent = `Valor recalcula automático: R$ ${total.toFixed(2).replace('.', ',')} (${quantity} porção${quantity !== 1 ? 's' : ''})`;
    }

    function adjustEditProductQty(id, delta){
      const input = document.getElementById(id);
      if(!input) return;
      const nextValue = Math.max(0, (parseInt(input.value || '0', 10) || 0) + delta);
      input.value = nextValue;
      updateEditProductSummary();
    }

    function openEditModal(order){
      currentOrder = order;
      const items = parseOrderItemsForEdit(order.itens);
      document.getElementById('editNameInput').value = order.nome || '';
      document.getElementById('editContactInput').value = order.contato || '';
      document.getElementById('editQtyCostela').value = items.Costela;
      document.getElementById('editQtyFrango').value = items.Frango;
      document.getElementById('editPaymentInput').value = order.pagamento || 'aguardando';
      updateEditProductSummary();
      document.getElementById('editModal').classList.add('active');
      lucide.createIcons();
    }

    async function confirmEdit(){
      const nome = document.getElementById('editNameInput').value.trim();
      const contato = document.getElementById('editContactInput').value.trim();
      const editItems = getEditProductItems();
      const quantidade = editItems.reduce((sum, item) => sum + item.qty, 0);
      const itens = editItems.map(item => `${item.qty}x ${item.label}`).join(', ');
      const valor = `R$ ${(quantidade * 20).toFixed(2).replace('.', ',')}`;
      const pagamento = document.getElementById('editPaymentInput').value;

      if(!nome || !contato || !quantidade){
        showToast('Informe o cliente e pelo menos um produto.', 'error');
        return;
      }

      try {
        const { error } = await supabaseClient
          .from('pedidos')
          .update({ 
            nome: nome, 
            contato: contato, 
            quantidade: quantidade, 
            valor: valor,
            itens: itens, 
            pagamento: pagamento 
          })
          .eq('id', currentOrder.id);

        if(error) throw error;

        showToast('Pedido atualizado com sucesso!');
        closeModal();
        loadOrders();

      } catch(error){
        console.error('Erro:', error);
        showToast('Erro ao atualizar pedido. Tente novamente.', 'error');
      }
    }

    // Manter função antiga para compatibilidade
    async function confirmEditContact(){
      const newContact = document.getElementById('editContactInput').value.trim();
      if(!newContact){
        showToast('Digite um telefone válido!', 'error');
        return;
      }
      try {
        await fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'editContact',
            rowIndex: currentOrder.rowIndex,
            newContact: newContact
          })
        });
        ;
        closeModal();
        loadOrders();
      } catch(error){
        console.error('Erro:', error);
        ;
      }
    }

    // Filtros
    document.getElementById('filterName').addEventListener('input', renderOrders);
    document.getElementById('filterStatus').addEventListener('change', renderOrders);
    document.getElementById('filterPayment').addEventListener('change', renderOrders);

    // Fechar modal ao clicar fora
    document.querySelectorAll('.modal').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if(e.target === modal){
          closeModal();
        }
      });
    });

    // Carregar ao iniciar
    loadOrders();

    // Registrar Service Worker (PWA) - apenas em HTTPS
    if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
          .then(registration => {
            console.log('Service Worker registrado:', registration);
          })
          .catch(error => {
            console.log('Erro ao registrar Service Worker:', error);
          });
      });
    }

    // Prompt de instalação PWA
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      
      // Mostrar banner de instalação (opcional)
      const installBanner = document.createElement('div');
      installBanner.style.cssText = `
        position:fixed;
        bottom:${window.matchMedia('(max-width: 767px)').matches ? '104px' : '20px'};
        left:20px;
        right:20px;
        background:linear-gradient(135deg, #ff6b35, #f77f00);
        color:#fff;
        padding:16px 20px;
        border-radius:12px;
        box-shadow:0 8px 24px rgba(0,0,0,.3);
        z-index:9999;
        display:flex;
        align-items:center;
        justify-content:space-between;
        animation:slideUp .3s ease;
      `;
      
      installBanner.innerHTML = `
        <div style="flex:1;">
          <strong style="display:block;margin-bottom:4px;">📱 Instalar App</strong>
          <span style="font-size:13px;opacity:.9;">Adicione à tela inicial para acesso rápido</span>
        </div>
        <button id="installBtn" style="
          background:#fff;
          color:#ff6b35;
          border:none;
          padding:10px 20px;
          border-radius:8px;
          font-weight:700;
          cursor:pointer;
          margin-left:12px;
        ">Instalar</button>
        <button id="closeInstallBtn" style="
          background:transparent;
          color:#fff;
          border:none;
          padding:10px;
          cursor:pointer;
          font-size:20px;
          margin-left:8px;
        ">×</button>
      `;
      
      document.body.appendChild(installBanner);
      
      document.getElementById('installBtn').addEventListener('click', () => {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('App instalado!');
          }
          deferredPrompt = null;
          installBanner.remove();
        });
      });
      
      document.getElementById('closeInstallBtn').addEventListener('click', () => {
        installBanner.remove();
      });
    });

