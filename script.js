document.addEventListener('DOMContentLoaded', () => {
    const apiUrl = 'produtos.json';
    let produtosData = {}; // Armazenar os produtos carregados para acesso futuro

    async function fetchProdutos() {
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            console.log('Dados recebidos:', data);
            produtosData = data.produtos_ecologicos; // Armazenar produtos no carregamento
            renderizarProdutosTela(produtosData);
        } catch (error) {
            console.error('Houve um problema com a solicitação fetch:', error);
        }
    }

    function mostrarNotificacao(mensagem, tipo = 'success') {
        return new Promise((resolve) => {
            const container = document.querySelector('#notificacao-container');
            if (!container) return resolve();

            const notificacao = document.createElement('div');
            notificacao.className = `alert alert-${tipo} alert-dismissible fade show`;
            notificacao.role = 'alert';
            notificacao.innerHTML = `
                ${mensagem}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            `;

            container.appendChild(notificacao);

            setTimeout(() => {
                notificacao.classList.remove('show');
                notificacao.classList.add('hide');
                setTimeout(() => {
                    container.removeChild(notificacao);
                    resolve();
                }, 500);
            }, 3000);
        });
    }

    function carregarCarrinhoLocalStorage() {
        return new Promise((resolve) => {
            const carrinho = localStorage.getItem('carrinho');
            resolve(carrinho ? JSON.parse(carrinho) : []);
        });
    }

    function salvarCarrinhoLocalStorage(carrinho) {
        return new Promise((resolve) => {
            localStorage.setItem('carrinho', JSON.stringify(carrinho));
            resolve();
        });
    }

    async function adicionarAoCarrinho(produto) {
        try {
            const carrinho = await carregarCarrinhoLocalStorage();
            if (!carrinho.find(item => item.id === produto.id)) {
                carrinho.push(produto);
                await salvarCarrinhoLocalStorage(carrinho);
                await mostrarNotificacao('Produto adicionado ao carrinho!');
                atualizarVisualizacaoCarrinho();
            } else {
                await mostrarNotificacao('Produto já está no carrinho', 'warning');
            }
        } catch (error) {
            await mostrarNotificacao('Erro ao adicionar o produto ao carrinho', 'danger');
        }
    }

    async function removerDoCarrinho(produtoId) {
        try {
            let carrinho = await carregarCarrinhoLocalStorage();
            carrinho = carrinho.filter(produto => produto.id !== produtoId);
            await salvarCarrinhoLocalStorage(carrinho);
            await mostrarNotificacao('Produto removido do carrinho!', 'warning');
            atualizarVisualizacaoCarrinho();
        } catch (error) {
            await mostrarNotificacao('Erro ao remover o produto do carrinho', 'danger');
        }
    }

    async function atualizarVisualizacaoCarrinho() {
        const carrinho = await carregarCarrinhoLocalStorage();
        const itensCarrinho = document.getElementById('itens-carrinho');
        const totalCarrinho = document.getElementById('total-carrinho');
        const carrinhoContainer = document.getElementById('carrinho-container');
    
        if (!carrinhoContainer) {
            console.error('Elemento carrinho-container não encontrado.');
            return;
        }
    
        // Verificar se o carrinho tem itens
        if (carrinho.length === 0) {
            carrinhoContainer.style.display = 'none'; // Esconder se estiver vazio
        } else {
            carrinhoContainer.style.display = 'block'; // Mostrar se houver itens
        }
    
        itensCarrinho.innerHTML = '';
        let total = 0;
    
        // Adicionar os itens do carrinho à visualização
        carrinho.forEach(item => {
            total += item.preco;
            const itemCarrinho = document.createElement('li');
            itemCarrinho.textContent = `${item.nome} - R$${item.preco.toFixed(2)}`;
            itensCarrinho.appendChild(itemCarrinho);
        });
    
        totalCarrinho.textContent = `R$${total.toFixed(2)}`;
    }
    
    
    

    function aplicarFiltro(produtos) {
        const precoMin = parseFloat(document.getElementById('preco-min').value) || 0;
        const precoMax = parseFloat(document.getElementById('preco-max').value) || Infinity;

        return Object.fromEntries(
            Object.entries(produtos).map(([categoria, itens]) => [
                categoria,
                itens.filter(item => item.preco >= precoMin && item.preco <= precoMax)
            ])
        );
    }

    function renderizarProdutosTela(produtos) {
        const container = document.querySelector('#produtos-container');
        if (!container) {
            console.error('Elemento com ID "produtos-container" não encontrado.');
            return;
        }
        container.innerHTML = '';

        for (const [categoria, itens] of Object.entries(produtos)) {
            const section = document.createElement('div');
            section.className = 'section-wrapper bg-dark';

            section.innerHTML = `
                <h2 class="mb-4 text-white shadow-lg">${categoria.replace(/_/g, ' ')}</h2>
                <div class="row justify-content-center">
                    ${itens.map(item => `
                        <div class="col-6 col-md-4 col-xxl-2 mb-4">
                            <div class="card">
                                <img src="${item.imagem || 'https://via.placeholder.com/150'}" class="card-img-top" alt="${item.nome}">
                                <div class="card-body">
                                    <h5 class="card-title">${item.nome}</h5>
                                    <p class="card-text">Marca: ${item.marca}</p>
                                    <p class="card-text">Preço: R$${item.preco.toFixed(2)}</p>
                                    <p class="card-text">Descrição: ${item.descricao}</p>
                                    <p class="card-text">Material: ${item.material || 'N/A'}</p>
                                    <p class="card-text">Tamanhos: ${item.tamanhos ? item.tamanhos.join(', ') : 'N/A'}</p>
                                    <p class="card-text">Cor(es): ${item.cores ? item.cores.join(', ') : 'N/A'}</p>
                                    <p class="card-text">Certificações: ${item.certificacoes ? item.certificacoes.join(', ') : 'N/A'}</p>
                                    <button class="btn btn-primary adicionar-carrinho-btn">Adicionar No Carrinho</button>
                                    <button class="btn btn-danger mt-2 remover-carrinho-btn">Remover do Carrinho</button>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;

            // Atribuir eventos clicando
            section.querySelectorAll('.adicionar-carrinho-btn').forEach((btn, index) => {
                btn.addEventListener('click', () => adicionarAoCarrinho(itens[index]));
            });
            section.querySelectorAll('.remover-carrinho-btn').forEach((btn, index) => {
                btn.addEventListener('click', () => removerDoCarrinho(itens[index].id));
            });

            container.appendChild(section);
        }
    }

    document.getElementById('filtro-preco-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        const produtosFiltrados = aplicarFiltro(produtosData);
        renderizarProdutosTela(produtosFiltrados);
    });

    document.getElementById('limpar-filtro-btn').addEventListener('click', () => {
        document.getElementById('preco-min').value = '';
        document.getElementById('preco-max').value = '';
        renderizarProdutosTela(produtosData);
    });

    fetchProdutos();
    atualizarVisualizacaoCarrinho(); // Atualiza a visualização do carrinho ao carregar a página
});

document.addEventListener('DOMContentLoaded', () => {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();

            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});
