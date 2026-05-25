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

    const $ = (id) => document.getElementById(id);
    let currentToken = "";

    // Toggle checkbox com toque
    function toggleCheck(element, checkId){
      const checkbox = document.getElementById(checkId);
      if(!checkbox.disabled){
        checkbox.checked = !checkbox.checked;
        if(checkbox.checked){
          element.classList.add('checked');
          $("itemsError").classList.remove("show");
        } else {
          element.classList.remove('checked');
        }
        updateVoucher();
      }
    }

    function getProductQuantities(){
      return [
        { label:'Costela', qty: parseInt($("qtyCostela").value || "0", 10) || 0 },
        { label:'Frango', qty: parseInt($("qtyFrango").value || "0", 10) || 0 }
      ].map(item => ({
        ...item,
        qty: Math.max(0, item.qty)
      }));
    }

    function getSelectedItems(){
      return getProductQuantities().filter(item => item.qty > 0);
    }

    function requireSelectedItem(){
      if(getSelectedItems().length > 0) return true;
      $("itemsError").classList.add("show");
      document.querySelector(".items-section").scrollIntoView({ behavior:"smooth", block:"center" });
      return false;
    }

    function updateProductCards(){
      const quantities = getProductQuantities();
      const costela = quantities.find(item => item.label === 'Costela');
      const frango = quantities.find(item => item.label === 'Frango');

      document.getElementById('cardCostela').classList.toggle('checked', costela.qty > 0);
      document.getElementById('cardFrango').classList.toggle('checked', frango.qty > 0);
      if(costela.qty > 0 || frango.qty > 0){
        $("itemsError").classList.remove("show");
      }
    }

    function adjustProductQty(inputId, delta){
      const input = $(inputId);
      const current = parseInt(input.value || "0", 10) || 0;
      input.value = Math.max(0, current + delta);
      updateVoucher();
    }

    function setOrderActionsVisible(visible){
      document.querySelectorAll('.order-actions-after-save').forEach(el => {
        el.classList.toggle('order-actions-hidden', !visible);
      });
    }

    // Formatar telefone
    function formatPhone(value){
      const digits = (value ?? "").toString().replace(/\D/g, "").slice(0, 11);
      if(!digits) return "";
      if(digits.length <= 2) return `(${digits}`;
      const ddd = digits.slice(0,2);
      const first = digits.slice(2,7);
      const last = digits.slice(7);
      if(!last) return `(${ddd}) ${first}`;
      return `(${ddd}) ${first}-${last}`;
    }

    // Gerar token simples
    function generateToken(){
      const contact = $("inContact").value || "";
      
      const digits = contact.replace(/\D/g, '');
      const last4 = digits.slice(-4) || '0000';
      
      // Garantir que sempre tenha 4 dígitos (adiciona zeros à esquerda se necessário)
      return last4.padStart(4, '0');
    }

    function safeText(v){ return (v ?? "").toString().trim(); }

    // Atualizar preview
    function updateVoucher(){
      const name = safeText($("inName").value);
      const contact = formatPhone($("inContact").value);
      const unitPrice = 20;
      const items = getSelectedItems();
      const qty = items.reduce((sum, item) => sum + item.qty, 0);
      const total = qty * unitPrice;

      $("vName").textContent = name || "—";
      $("vContact").textContent = contact || "—";

      const currency = new Intl.NumberFormat("pt-BR", { 
        style:"currency", 
        currency:"BRL" 
      }).format(total);

      $("inTotal").value = currency;
      $("vQty").textContent = `${qty.toString().padStart(2,"0")} porção${qty !== 1 ? "s" : ""} - ${currency}`;

      // Atualizar hidden
      $("vNameHidden").textContent = name || "—";
      $("vContactHidden").textContent = contact || "—";
      $("vQtyHidden").textContent = $("vQty").textContent;

      const paymentValue = $("inPayment").value === "pago" ? "Pago" : "Aguardando Pagamento";
      $("vPayment").textContent = paymentValue;
      $("vPaymentHidden").textContent = paymentValue;

      const iconByItem = {
        "Costela": `<svg class="chip-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 8.5c-1.6-1.6-3.6-.6-4 1.2-.4 1.8 1 3.2 2.6 3.2"></path><path d="M17.5 15.5c1.6 1.6 3.6.6 4-1.2.4-1.8-1-3.2-2.6-3.2"></path><path d="M7.5 7.5l9 9"></path><path d="M9.2 5.8c1.6-1.6 4.2-1.6 5.7 0l3.3 3.3c1.6 1.6 1.6 4.2 0 5.7-1.6 1.6-4.2 1.6-5.7 0L9.2 12.5c-1.6-1.6-1.6-4.2 0-5.7Z" stroke-width="1.6"></path></svg>`,
        "Frango": `<svg class="chip-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14c1.5 1.5 4.5 1.5 6 0 2.5-2.5 2-6.5-1-8.5-3-2-7-1-9.5 1.5"></path><path d="M6 18c-1.2 1.2-3 .8-3.6-.6-.6-1.4.4-3.1 1.9-3.1"></path><path d="M18 6c1.2-1.2 3-.8 3.6.6.6 1.4-.4 3.1-1.9 3.1"></path><path d="M8 16l-2.5 2.5"></path></svg>`
      };

      $("vItems").innerHTML = items.length
        ? items.map(item => `<span class="preview-chip">${iconByItem[item.label] || ""}<span>${item.qty}x ${item.label}</span></span>`).join('')
        : '<span class="preview-chip empty">Informe as quantidades</span>';

      $("vItemsHidden").innerHTML = items.map(item => {
        const icon = iconByItem[item.label] || "";
        return `<span style="background:#fff;color:#2f241f;padding:14px 24px;border-radius:999px;font-weight:900;font-size:20px;border:3px solid #ff6b35;display:inline-flex;align-items:center;gap:10px;box-shadow:0 8px 18px rgba(255,107,53,.12);">${icon}<span>${item.qty}x ${item.label}</span></span>`;
      }).join('');

      updateProductCards();
      lucide.createIcons();
    }

    // Eventos
    ["inName"].forEach(id => {
      $(id).addEventListener("input", updateVoucher);
    });

    document.querySelectorAll(".product-qty-input").forEach(input => {
      input.addEventListener("input", () => {
        input.value = Math.max(0, parseInt(input.value || "0", 10) || 0);
        updateVoucher();
      });
    });

    $("inContact").addEventListener("input", ()=>{
      const formatted = formatPhone($("inContact").value);
      $("inContact").value = formatted;
      updateVoucher();
    });

    $("inPayment").addEventListener("change", updateVoucher);

    // Gerar Token
    $("btnGenerateToken").addEventListener("click", ()=>{
      const name = safeText($("inName").value);
      const contact = safeText($("inContact").value);

      if(!name || !contact){
        alert("⚠️ Preencha nome e telefone primeiro!");
        return;
      }

      currentToken = generateToken();
      const tokenEl = $("vToken");
      tokenEl.textContent = currentToken;
      tokenEl.classList.remove("empty");
      
      $("vTokenHidden").textContent = currentToken;
      
      tokenEl.style.transform = "scale(1.1)";
      setTimeout(()=>{ tokenEl.style.transform = "scale(1)"; }, 300);
    });

    // Salvar
    // Variáveis de controle
    let isSaving = false;
    let countdownInterval = null;

    $("btnSave").addEventListener("click", async ()=>{
      // Prevenir duplo clique
      if(isSaving){
        console.log('Já está salvando, ignorando clique duplo');
        return;
      }

      const name = safeText($("inName").value);
      const contact = safeText($("inContact").value);

      if(!name || !contact){
        alert("⚠️ Preencha Nome e Telefone!");
        return;
      }

      if(!currentToken){
        alert("⚠️ Clique em 'Gerar Token' primeiro!");
        return;
      }

      if(!requireSelectedItem()) return;
      const items = getSelectedItems();

      const unitPrice = 20;
      const qty = items.reduce((sum, item) => sum + item.qty, 0);
      const total = qty * unitPrice;
      const selectedItems = items.map(item => `${item.qty}x ${item.label}`).join(", ");

      const data = {
        timestamp: new Date().toISOString(),
        nome: name,
        contato: contact,
        quantidade: qty,
        valor: `R$ ${total.toFixed(2).replace(".", ",")}`,
        data_retirada: "06/06/2026",
        itens: selectedItems,
        token: currentToken,
        endereco: "Maria Carlota da Costa, 127",
        pagamento: $("inPayment").value || "aguardando",
        status: "pendente"
      };

      const btn = $("btnSave");
      const originalContent = btn.innerHTML;
      
      // Marcar como salvando
      isSaving = true;
      btn.disabled = true;
      btn.innerHTML = '<i data-lucide="loader"></i> Salvando...';
      btn.classList.add("loading");
      lucide.createIcons();

      try {
        console.log('Enviando pedido para Supabase:', data);
        
        const { error } = await supabaseClient
          .from('pedidos')
          .insert([data]);

        if(error) throw error;
        
        console.log('Pedido salvo com sucesso!');

        // Manter o pedido na tela para compartilhar antes de limpar.
        $("successMsg").classList.add("show");
        setOrderActionsVisible(false);
        $("successMsg").scrollIntoView({ behavior:'smooth', block:'center' });
        lucide.createIcons();

      } catch (error) {
        console.error("Erro ao salvar:", error);
        alert("❌ Erro ao salvar! Verifique o console.");
        isSaving = false;
        btn.disabled = false;
      } finally {
        btn.innerHTML = originalContent;
        btn.classList.remove("loading");
        lucide.createIcons();
      }
    });

    // Download PNG
    $("btnPNG").addEventListener("click", async ()=>{
      if(!currentToken){
        alert("⚠️ Gere o token primeiro!");
        return;
      }
      if(!requireSelectedItem()) return;

      const node = $("voucherHidden").children[0];
      lucide.createIcons();

      const canvas = await html2canvas(node, {
        backgroundColor: '#ffffff',
        scale: 2.5,
        useCORS: true
      });

      const dataURL = canvas.toDataURL("image/png", 1.0);
      const a = document.createElement("a");
      a.href = dataURL;
      a.download = `vale-caldos-${currentToken}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    });

    // Compartilhar (Web Share API)
    $("btnShare").addEventListener("click", async ()=>{
      if(!currentToken){
        alert("⚠️ Gere o token primeiro!");
        return;
      }
      if(!requireSelectedItem()) return;

      if(!navigator.share){
        alert('<i data-lucide="phone" style="width:16px;height:16px;vertical-align:middle;"></i> Compartilhamento não suportado neste navegador. Use "Baixar" e envie manualmente.');
        return;
      }

      const node = $("voucherHidden").children[0];
      const canvas = await html2canvas(node, {
        backgroundColor: '#ffffff',
        scale: 2.5,
        useCORS: true
      });

      canvas.toBlob(async (blob) => {
        const file = new File([blob], `vale-${currentToken}.png`, { type: 'image/png' });
        
        try {
          await navigator.share({
            files: [file],
            title: 'Pedido Cantina da Rô',
            text: `Pedido Cantina da Rô - Token: ${currentToken}`
          });
        } catch(err){
          console.log('Compartilhamento cancelado');
        }
      });
    });

    updateVoucher();

    // Botão Novo Pedido
    $("btnNewOrder").addEventListener("click", ()=>{
      // Limpar campos
      $("inName").value = "";
      $("inContact").value = "";
      $("qtyCostela").value = "0";
      $("qtyFrango").value = "0";
      $("inPayment").value = "aguardando";
      $("itemsError").classList.remove("show");

      // Limpar token
      currentToken = "";
      $("vToken").textContent = "----";
      $("vToken").classList.add("empty");
      $("vTokenHidden").textContent = "----";

      // Atualizar preview
      updateVoucher();

      // Scroll para o topo
      window.scrollTo({ top: 0, behavior: 'smooth' });

      lucide.createIcons();
    });

    // Fechar aviso mantendo os dados na tela
    function cancelCountdown(){
      if(countdownInterval){
        clearInterval(countdownInterval);
        countdownInterval = null;
      }
      $("successMsg").classList.remove("show");
      setOrderActionsVisible(true);
      // Resetar flag para permitir novo salvamento
      isSaving = false;
      $("btnSave").disabled = false;
    }

    // Criar novo pedido imediatamente
    function createNewOrderNow(){
      if(countdownInterval){
        clearInterval(countdownInterval);
        countdownInterval = null;
      }
      
      // Limpar campos
      $("inName").value = '';
      $("inContact").value = '';
      $("qtyCostela").value = '0';
      $("qtyFrango").value = '0';
      $("inTotal").value = 'R$ 0,00';
      $("inPayment").value = 'aguardando';
      $("itemsError").classList.remove("show");
      
      // Limpar token
      currentToken = null;
      $("vToken").textContent = '----';
      $("vTokenHidden").textContent = '----';
      
      // Esconder mensagem de sucesso
      $("successMsg").classList.remove('show');
      setOrderActionsVisible(true);
      
      // Resetar flag
      isSaving = false;
      $("btnSave").disabled = false;
      
      // Atualizar voucher
      updateVoucher();
      
      // Focar no primeiro campo
      $("inName").focus();
      
      // Scroll para o topo
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Recriar ícones
      lucide.createIcons();
    }

