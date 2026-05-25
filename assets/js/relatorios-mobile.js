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
    let statusChart = null;

    async function loadReports(){
      try {
        const { data, error } = await supabaseClient
          .from('pedidos')
          .select('*');
        
        if(error) throw error;
        
        allOrders = data || [];
        
        document.getElementById('loadingState').style.display = 'none';
        document.getElementById('reportContent').style.display = 'block';
        
        if(allOrders.length === 0){
          document.getElementById('reportContent').innerHTML = '<div style="text-align:center;padding:60px 20px;color:var(--muted);"><h3>Nenhum pedido</h3><p>Crie pedidos para ver relatÃ³rios</p></div>';
          return;
        }
        
        generateReports();
        renderOrdersList();

      } catch(error){
        console.error('Erro:', error);
        document.getElementById('loadingState').innerHTML = '<p style="color:#ef4444;">âŒ Erro ao carregar</p>';
      }
    }

    function generateReports(){
      try {
        // Filtrar apenas pedidos NÃƒO cancelados
        const activeOrders = allOrders.filter(o => o.status !== 'cancelado');
        
        const totalPorcoes = activeOrders.reduce((sum, o) => sum + parseInt(o.quantidade || 0), 0);
        const totalReceita = activeOrders.reduce((sum, o) => {
          const valorStr = (o.valor || 'R$ 0,00').toString();
          const value = parseFloat(valorStr.replace('R$', '').replace('.', '').replace(',', '.').trim());
          return sum + (isNaN(value) ? 0 : value);
        }, 0);
        
        const totalClientes = new Set(activeOrders.map(o => o.nome).filter(Boolean)).size;
        const mediaPedido = activeOrders.length > 0 ? (totalPorcoes / activeOrders.length).toFixed(1) : 0;
        
        const entregues = activeOrders.filter(o => o.status === 'entregue').length;
        const pendentes = activeOrders.filter(o => o.status === 'pendente' || !o.status).length;
        const taxaEntrega = activeOrders.length > 0 ? ((entregues / activeOrders.length) * 100).toFixed(0) : 0;

        document.getElementById('totalMarmitas').textContent = totalPorcoes;
        document.getElementById('totalReceita').textContent = new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(totalReceita);
        document.getElementById('totalClientes').textContent = totalClientes;
        document.getElementById('mediaPedido').textContent = `${mediaPedido} porÃ§Ãµes`;
        document.getElementById('taxaEntrega').textContent = `${taxaEntrega}%`;
        document.getElementById('totalPendentes').textContent = pendentes;

        const ctx = document.getElementById('statusChart').getContext('2d');
        
        if(statusChart){
          statusChart.destroy();
        }
        
        statusChart = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: ['Entregues', 'Pendentes'],
            datasets: [{
              data: [entregues, pendentes],
              backgroundColor: ['#4ade80', '#fbbf24'],
              borderWidth: 0
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
              legend: {
                display: true,
                position: 'bottom',
                labels: {
                  color: '#f5f3f0',
                  font: {
                    family: 'Poppins',
                    size: 12,
                    weight: '600'
                  },
                  padding: 16
                }
              }
            }
          }
        });

        const itemsCount = {};
        allOrders.forEach(order => {
          if(order.itens){
            const items = order.itens.split(',').map(i => i.trim());
            items.forEach(item => {
              if(item){
                const match = item.match(/^(\d+)x\s+(.+)$/i);
                const qty = match ? parseInt(match[1], 10) : 1;
                const label = match ? match[2].trim() : item;
                itemsCount[label] = (itemsCount[label] || 0) + (isNaN(qty) ? 1 : qty);
              }
            });
          }
        });

        const sortedItems = Object.entries(itemsCount).sort((a, b) => b[1] - a[1]);
        
        const topItemsList = document.getElementById('topItemsList');
        topItemsList.innerHTML = '';
        
        if(sortedItems.length === 0){
          topItemsList.innerHTML = '<p style="text-align:center;color:var(--muted);padding:20px;">Nenhum item</p>';
        } else {
          sortedItems.forEach(([item, count]) => {
            const emoji = item.toLowerCase().includes('caldos') ? 'ðŸ¥£' : item.toLowerCase().includes('feijÃ£o') ? 'ðŸ²' : item.toLowerCase().includes('costela') ? 'ðŸ¥©' : item.toLowerCase().includes('frango') ? 'ðŸ—' : 'ðŸ½ï¸';
            const row = document.createElement('div');
            row.className = 'item-row';
            row.innerHTML = `
              <div class="item-name">${emoji} ${item}</div>
              <div class="item-count">${count}</div>
            `;
            topItemsList.appendChild(row);
          });
        }

        lucide.createIcons();
        
      } catch(error){
        console.error('Erro:', error);
        alert('Erro ao processar dados');
      }
    }

    // Renderizar lista de pedidos
    function renderOrdersList(){
      const filterStatus = document.getElementById('filterStatus').value;
      const ordersList = document.getElementById('ordersList');
      
      let filtered = filterStatus ? allOrders.filter(o => o.status === filterStatus) : allOrders;
      
      if(filtered.length === 0){
        ordersList.innerHTML = '<p style="text-align:center;color:var(--muted);padding:20px;">Nenhum pedido encontrado</p>';
        return;
      }

      ordersList.innerHTML = filtered.map(order => {
        const pagamento = order.pagamento || 'aguardando';
        const pagamentoBadge = pagamento === 'pago' 
          ? '<span style="background:rgba(34,197,94,.2);color:#22c55e;padding:4px 10px;border-radius:6px;font-size:11px;font-weight:700;">âœ… PAGO</span>'
          : '<span style="background:rgba(251,191,36,.2);color:#fbbf24;padding:4px 10px;border-radius:6px;font-size:11px;font-weight:700;">â³ AGUARDANDO</span>';
        
        return `
        <div class="order-item">
          <div class="order-header-row">
            <div class="order-name-row">${order.nome}</div>
            <div class="order-status-badge ${order.status || 'pendente'}">${
              order.status === 'entregue' ? 'Entregue' : 
              order.status === 'cancelado' ? 'Cancelado' : 'Pendente'
            }</div>
          </div>
          <div class="order-details-row">
            <div class="order-detail">ðŸ“± ${order.contato}</div>
            <div class="order-detail">ðŸ›ï¸ ${order.quantidade} porÃ§Ã£o${order.quantidade > 1 ? 's' : ''}</div>
            <div class="order-detail"><i data-lucide="dollar-sign" style="width:18px;height:18px;"></i> ${order.valor}</div>
            <div class="order-detail">ðŸ’° ${pagamentoBadge}</div>
            <div class="order-detail">ðŸ”‘ ${order.token}</div>
          </div>
        </div>
      `;
      }).join('');
      
      lucide.createIcons();
    }

    // Exportar para Excel/CSV
    function exportToExcel(){
      const activeOrders = allOrders.filter(o => o.status !== 'cancelado');
      
      if(activeOrders.length === 0){
        alert('Nenhum pedido para exportar');
        return;
      }

      // Criar CSV com coluna Pagamento
      let csv = 'Nome,Contato,Quantidade,Valor,Pagamento,Status,Token,Data\n';
      
      activeOrders.forEach(order => {
        const pagamento = order.pagamento || 'aguardando';
        csv += `"${order.nome}","${order.contato}",${order.quantidade},"${order.valor}","${pagamento}","${order.status || 'pendente'}","${order.token}","${order.timestamp}"\n`;
      });

      // Download
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `pedidos-galinhada-${new Date().toLocaleDateString('pt-BR').replace(/\//g,'-')}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Mostrar mensagem
      alert('âœ… RelatÃ³rio exportado com sucesso!\nArquivo: pedidos-galinhada-' + new Date().toLocaleDateString('pt-BR').replace(/\//g,'-') + '.csv');
    }

    // VariÃ¡vel global para filtro de impressÃ£o
    let currentPrintFilter = 'todos';

    // Definir filtro rÃ¡pido
    function setQuickFilter(filter){
      currentPrintFilter = filter;
      
      // Remover active de todos
      document.querySelectorAll('.quick-filter-btn').forEach(btn => {
        btn.style.opacity = '0.6';
        btn.style.transform = 'scale(1)';
      });
      
      // Adicionar active no selecionado
      const btnMap = {
        'todos': 'filterTodos',
        'pagos': 'filterPagos',
        'pendentes-pag': 'filterPendentesPag',
        'entregues': 'filterEntregues',
        'pendentes-ent': 'filterPendentesEnt'
      };
      
      const activeBtn = document.getElementById(btnMap[filter]);
      if(activeBtn){
        activeBtn.style.opacity = '1';
        activeBtn.style.transform = 'scale(1.05)';
      }
      
      // Atualizar descriÃ§Ã£o
      const descriptions = {
        'todos': 'Mostrando: Todos os pedidos',
        'pagos': 'Mostrando: Apenas pedidos PAGOS',
        'pendentes-pag': 'Mostrando: Apenas AGUARDANDO pagamento',
        'entregues': 'Mostrando: Apenas pedidos ENTREGUES',
        'pendentes-ent': 'Mostrando: Apenas pedidos PENDENTES de entrega'
      };
      
      document.getElementById('filterDescription').textContent = descriptions[filter];
      
      // Aplicar filtro visual na lista (temporÃ¡rio)
      applyVisualFilter(filter);
    }

    // Aplicar filtro visual
    function applyVisualFilter(filter){
      const items = document.querySelectorAll('.order-item');
      
      items.forEach(item => {
        const orderIndex = Array.from(item.parentNode.children).indexOf(item);
        const order = allOrders.filter(o => o.status !== 'cancelado')[orderIndex];
        
        if(!order) return;
        
        let show = false;
        
        switch(filter){
          case 'todos':
            show = true;
            break;
          case 'pagos':
            show = order.pagamento === 'pago';
            break;
          case 'pendentes-pag':
            show = order.pagamento !== 'pago';
            break;
          case 'entregues':
            show = order.status === 'entregue';
            break;
          case 'pendentes-ent':
            show = order.status === 'pendente' || !order.status;
            break;
        }
        
        item.style.display = show ? 'block' : 'none';
      });
    }

    function parseOrderValue(order){
      const valorStr = (order.valor || 'R$ 0,00').toString();
      const value = parseFloat(valorStr.replace('R$', '').replace('.', '').replace(',', '.').trim());
      return isNaN(value) ? 0 : value;
    }

    function formatCurrency(value){
      return new Intl.NumberFormat('pt-BR', {
        style:'currency',
        currency:'BRL'
      }).format(value || 0);
    }

    function getFilteredOrdersForPrint(){
      let filteredOrders = allOrders.filter(o => o.status !== 'cancelado');

      switch(currentPrintFilter){
        case 'pagos':
          filteredOrders = filteredOrders.filter(o => o.pagamento === 'pago');
          break;
        case 'pendentes-pag':
          filteredOrders = filteredOrders.filter(o => o.pagamento !== 'pago');
          break;
        case 'entregues':
          filteredOrders = filteredOrders.filter(o => o.status === 'entregue');
          break;
        case 'pendentes-ent':
          filteredOrders = filteredOrders.filter(o => o.status === 'pendente' || !o.status);
          break;
      }

      return filteredOrders;
    }

    function getPrintFilterLabel(){
      const labels = {
        todos: 'Lista de Pedidos - Todos',
        pagos: 'Lista de Pedidos - Pagos',
        'pendentes-pag': 'Lista de Pedidos - Aguardando Pagamento',
        entregues: 'Lista de Pedidos - Entregues',
        'pendentes-ent': 'Lista de Pedidos - Pendentes de Entrega'
      };

      return labels[currentPrintFilter] || labels.todos;
    }

    function renderPrintableOrders(orders){
      if(orders.length === 0){
        return '<p style="text-align:center;color:#6b7280;padding:24px;">Nenhum pedido encontrado para este filtro.</p>';
      }

      return orders.map(order => {
        const status = order.status || 'pendente';
        const statusText = status === 'entregue' ? 'Entregue' : status === 'cancelado' ? 'Cancelado' : 'Pendente';
        const pagamento = order.pagamento === 'pago' ? 'Pago' : 'Aguardando';
        const date = order.timestamp ? new Date(order.timestamp).toLocaleString('pt-BR') : '-';

        return `
        <div class="order-item">
          <div class="order-header-row">
            <div class="order-name-row">${order.nome || '-'}</div>
            <div class="order-status-badge ${status}">${statusText}</div>
          </div>
          <div class="order-details-row">
            <div class="order-detail">
              <span class="order-detail-label">Contato</span>
              <span class="order-detail-value">${order.contato || '-'}</span>
            </div>
            <div class="order-detail">
              <span class="order-detail-label">Pedido</span>
              <span class="order-detail-value">${order.quantidade || 0} porÃ§Ã£o${Number(order.quantidade) > 1 ? 's' : ''}</span>
            </div>
            <div class="order-detail">
              <span class="order-detail-label">Valor</span>
              <span class="order-detail-value">${order.valor || 'R$ 0,00'}</span>
            </div>
            <div class="order-detail">
              <span class="order-detail-label">Pagamento</span>
              <span class="order-detail-value">${pagamento}</span>
            </div>
            <div class="order-detail">
              <span class="order-detail-label">Token</span>
              <span class="order-detail-value">${order.token || '-'}</span>
            </div>
            <div class="order-detail">
              <span class="order-detail-label">Itens</span>
              <span class="order-detail-value">${order.itens || '-'}</span>
            </div>
            <div class="order-detail">
              <span class="order-detail-label">Data</span>
              <span class="order-detail-value">${date}</span>
            </div>
          </div>
        </div>
      `;
      }).join('');
    }

    function updatePrintHeader(orders){
      const totalQty = orders.reduce((sum, order) => sum + parseInt(order.quantidade || 0), 0);
      const totalValue = orders.reduce((sum, order) => sum + parseOrderValue(order), 0);
      const pendingValue = orders
        .filter(order => order.pagamento !== 'pago')
        .reduce((sum, order) => sum + parseOrderValue(order), 0);

      document.getElementById('printFilterTitle').textContent = getPrintFilterLabel();
      document.getElementById('printDate').textContent = `Gerado em ${new Date().toLocaleString('pt-BR')}`;
      document.getElementById('printTotalOrders').textContent = orders.length;
      document.getElementById('printTotalQty').textContent = totalQty;
      document.getElementById('printTotalValue').textContent = formatCurrency(totalValue);
      document.getElementById('printPendingValue').textContent = formatCurrency(pendingValue);
    }

    // Imprimir com filtro
    function printFiltered(){
      // Salvar lista original
      const originalList = document.getElementById('ordersList').innerHTML;
      const ordersList = document.getElementById('ordersList');
      const printableOrders = getFilteredOrdersForPrint();

      updatePrintHeader(printableOrders);
      ordersList.innerHTML = renderPrintableOrders(printableOrders);

      setTimeout(() => {
        window.print();

        setTimeout(() => {
          ordersList.innerHTML = originalList;
          lucide.createIcons();
        }, 500);
      }, 100);

      return;
      
      // Filtrar pedidos conforme seleÃ§Ã£o
      let filteredOrders = allOrders.filter(o => o.status !== 'cancelado');
      
      switch(currentPrintFilter){
        case 'pagos':
          filteredOrders = filteredOrders.filter(o => o.pagamento === 'pago');
          break;
        case 'pendentes-pag':
          filteredOrders = filteredOrders.filter(o => o.pagamento !== 'pago');
          break;
        case 'entregues':
          filteredOrders = filteredOrders.filter(o => o.status === 'entregue');
          break;
        case 'pendentes-ent':
          filteredOrders = filteredOrders.filter(o => o.status === 'pendente' || !o.status);
          break;
      }
      
      // Renderizar lista filtrada
      const legacyOrdersList = document.getElementById('ordersList');
      legacyOrdersList.innerHTML = filteredOrders.map(order => {
        const pagamento = order.pagamento || 'aguardando';
        const pagamentoBadge = pagamento === 'pago' 
          ? '<span style="background:rgba(34,197,94,.2);color:#22c55e;padding:4px 10px;border-radius:6px;font-size:11px;font-weight:700;">âœ… PAGO</span>'
          : '<span style="background:rgba(251,191,36,.2);color:#fbbf24;padding:4px 10px;border-radius:6px;font-size:11px;font-weight:700;">â³ AGUARDANDO</span>';
        
        return `
        <div class="order-item">
          <div class="order-header-row">
            <div class="order-name-row">${order.nome}</div>
            <div class="order-status-badge ${order.status || 'pendente'}">${
              order.status === 'entregue' ? 'Entregue' : 
              order.status === 'cancelado' ? 'Cancelado' : 'Pendente'
            }</div>
          </div>
          <div class="order-details-row">
            <div class="order-detail">ðŸ“± ${order.contato}</div>
            <div class="order-detail">ðŸ›ï¸ ${order.quantidade} porÃ§Ã£o${order.quantidade > 1 ? 's' : ''}</div>
            <div class="order-detail"><i data-lucide="dollar-sign" style="width:18px;height:18px;"></i> ${order.valor}</div>
            <div class="order-detail">ðŸ’° ${pagamentoBadge}</div>
            <div class="order-detail">ðŸ”‘ ${order.token}</div>
          </div>
        </div>
      `;
      }).join('');
      
      // Imprimir
      setTimeout(() => {
        window.print();
        
        // Restaurar lista original apÃ³s impressÃ£o
        setTimeout(() => {
          ordersList.innerHTML = originalList;
          lucide.createIcons();
        }, 500);
      }, 100);
    }

    loadReports();

