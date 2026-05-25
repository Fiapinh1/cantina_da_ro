# Cantina da Rô - Sistema de Pedidos de Caldos

## Mudanças Realizadas
- Renomeado de "Galinhada da Rô" para "Cantina da Rô"
- Alterado o cardápio de galinhadas para caldos (Caldos, Feijão, Costela, Frango)
- Substituído Google Sheets/Google Script por Supabase como banco de dados

## Configuração do Supabase

### Passo 1: Criar uma conta no Supabase
1. Acesse https://supabase.com/
2. Crie uma conta ou faça login
3. Crie um novo projeto

### Passo 2: Criar a tabela "pedidos"
No painel do Supabase:
1. Vá para "Table Editor"
2. Clique em "New Table"
3. Nomeie a tabela como "pedidos"
4. Adicione as seguintes colunas:
   - `id` (int8, primary key, auto-increment)
   - `timestamp` (timestamptz, default: now())
   - `nome` (text)
   - `contato` (text)
   - `quantidade` (int8)
   - `valor` (text)
   - `data_retirada` (text)
   - `itens` (text)
   - `token` (text)
   - `endereco` (text)
   - `pagamento` (text, default: 'aguardando')
   - `status` (text, default: 'pendente')

### Passo 3: Obter as credenciais
1. Vá para "Settings" → "API"
2. Copie a "Project URL" (ex: `https://seu-projeto.supabase.co`)
3. Copie a "anon public" key

### Passo 4: Configurar as credenciais no app
Edite os seguintes arquivos e substitua as placeholders pelas suas credenciais:
1. `assets/js/supabase.js`
2. `index.html`
3. `novo-pedido-mobile.html`
4. `validador.html`
5. `relatorios-mobile.html`

Substitua:
- `SUA_URL_DO_SUPABASE` pela sua Project URL
- `SUA_CHAVE_ANONIMA_DO_SUPABASE` pela sua anon public key

## Funcionalidades
- Dashboard para gerenciar pedidos
- Criação de novos pedidos com geração de token
- Validação de pedidos por token
- Relatórios e estatísticas
- Impressão de relatórios
- Exportação para CSV
