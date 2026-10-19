/* =========================================================
   PataForma – script.js
   Sumário:
   1. Dados de exemplo (troque por dados reais / API depois)
   2. Utilitários
   3. Navegação entre telas (hash)
   4. Login e logout
   5. Menu lateral
   6. Feed e chat
   7. Meus pets
   8. Serviços e profissionais
   9. Ajuda (feedback) e configurações
   10. Início
   ========================================================= */

(function () {
  "use strict";

  /* 1. DADOS DE EXEMPLO ---------------------------------- */
  const POSTS = [
    { usuario: "@user", texto: "Primeiro passeio do Thor no parque" },
    { usuario: "@user", texto: "Dica: escovar os dentes do pet toda semana" },
    { usuario: "@user", texto: "Vacinas em dia, tutor tranquilo" }
  ];

  const CONVERSAS = [
    { nome: "Kathy", nao_lidas: 1 },
    { nome: "Gabriel", nao_lidas: 1 },
    { nome: "Gabriel S", nao_lidas: 1 },
    { nome: "Raycka", nao_lidas: 1 },
    { nome: "Gustavo", nao_lidas: 1 }
  ];

  const PETS = [
    { nome: "Thor", sexo: "Macho", raca: "Golden Retriever", peso: "30 kg", tamanho: "Grande", temperamento: "Brincalhão" },
    { nome: "Mel", sexo: "Fêmea", raca: "Shih Tzu", peso: "6 kg", tamanho: "Pequeno", temperamento: "Carinhosa" },
    { nome: "Luna", sexo: "Fêmea", raca: "Siamês", peso: "4 kg", tamanho: "Pequeno", temperamento: "Curiosa" },
    { nome: "Bob", sexo: "Macho", raca: "Vira-lata", peso: "12 kg", tamanho: "Médio", temperamento: "Calmo" },
    { nome: "Nina", sexo: "Fêmea", raca: "Poodle", peso: "8 kg", tamanho: "Pequeno", temperamento: "Agitada" },
    { nome: "Pipoca", sexo: "Macho", raca: "Persa", peso: "5 kg", tamanho: "Pequeno", temperamento: "Tranquilo" }
  ];

  const SERVICOS = [
    { nome: "Pet Shop Amigo Fiel", nota: "4.8" },
    { nome: "Clínica Veterinária Patinhas", nota: "4.6" },
    { nome: "Hotelzinho Bem-Estar Pet", nota: "4.9" }
  ];

  const PROFISSIONAIS = [
    { nome: "Ana Souza", nota: "4.9", funcao: "Banho e tosa" },
    { nome: "Carlos Lima", nota: "4.7", funcao: "Adestrador" },
    { nome: "Dra. Paula Reis", nota: "5.0", funcao: "Veterinária" }
  ];

  /* 2. UTILITÁRIOS --------------------------------------- */
  const $ = (seletor, raiz = document) => raiz.querySelector(seletor);
  const $$ = (seletor, raiz = document) => Array.from(raiz.querySelectorAll(seletor));

  // Cria elemento com atributos e filhos, sem usar innerHTML (mais seguro)
  function el(tag, atributos = {}, ...filhos) {
    const no = document.createElement(tag);
    Object.entries(atributos).forEach(([chave, valor]) => {
      if (chave === "class") no.className = valor;
      else if (chave === "text") no.textContent = valor;
      else no.setAttribute(chave, valor);
    });
    filhos.forEach((f) => no.append(f));
    return no;
  }

  function icone(id) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("aria-hidden", "true");
    const uso = document.createElementNS("http://www.w3.org/2000/svg", "use");
    uso.setAttribute("href", "#" + id);
    svg.append(uso);
    return svg;
  }

  let temporizadorAviso;
  function avisar(mensagem) {
    const caixa = $("#aviso");
    caixa.textContent = mensagem;
    caixa.hidden = false;
    clearTimeout(temporizadorAviso);
    temporizadorAviso = setTimeout(() => (caixa.hidden = true), 3200);
  }

  function guardar(chave, valor) {
    try { sessionStorage.setItem(chave, valor); } catch (e) { /* ignora */ }
  }
  function ler(chave) {
    try { return sessionStorage.getItem(chave); } catch (e) { return null; }
  }
  function apagar(chave) {
    try { sessionStorage.removeItem(chave); } catch (e) { /* ignora */ }
  }

  /* 3. NAVEGAÇÃO ENTRE TELAS ----------------------------- */
  const ROTAS = ["inicio", "perfil", "pets", "servicos", "profissionais", "sobre", "ajuda", "config"];
  const ROTA_PAI = { pets: "perfil" }; // "Meus pets" fica sob "Perfil" no menu

  function usuarioLogado() { return Boolean(ler("pataforma_nome")); }

  function rotaAtual() {
    const hash = location.hash.replace("#", "");
    return ROTAS.includes(hash) ? hash : "inicio";
  }

  function renderizar() {
    const logado = usuarioLogado();
    $("#view-login").hidden = logado;
    $("#app").hidden = !logado;
    if (!logado) return;

    const rota = rotaAtual();
    $$(".pagina").forEach((p) => p.classList.toggle("ativa", p.dataset.view === rota));

    const ativaNoMenu = ROTA_PAI[rota] || rota;
    $$("#menu a").forEach((a) => {
      if (a.dataset.rota === ativaNoMenu) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });

    fecharMenu();
    window.scrollTo({ top: 0 });
  }

  window.addEventListener("hashchange", renderizar);

  /* 4. LOGIN E LOGOUT ------------------------------------ */
  function definirNome(nome) {
    $$("[data-nome]").forEach((n) => (n.textContent = nome));
  }

  $("#login-form").addEventListener("submit", (evento) => {
    evento.preventDefault();
    const usuario = $("#usuario").value.trim();
    const senha = $("#senha").value;
    const erro = $("#login-erro");

    if (!usuario || !senha) {
      erro.hidden = false;
      return;
    }
    erro.hidden = true;

    // Nome de exibição: parte antes do @ se for e-mail
    const nome = usuario.split("@")[0];
    guardar("pataforma_nome", nome);
    definirNome(nome);
    $("#senha").value = "";
    location.hash = "#inicio";
    renderizar();
  });

  function sair() {
    apagar("pataforma_nome");
    location.hash = "";
    renderizar();
  }

  /* 5. MENU LATERAL -------------------------------------- */
  const menu = $("#menu");
  const fundoMenu = $("#fundo-menu");
  const botaoMenu = $("#btn-menu");

  function abrirMenu() {
    menu.classList.add("aberto");
    menu.setAttribute("aria-hidden", "false");
    fundoMenu.hidden = false;
    botaoMenu.setAttribute("aria-expanded", "true");
    $("#btn-fechar").focus();
  }

  function fecharMenu() {
    menu.classList.remove("aberto");
    menu.setAttribute("aria-hidden", "true");
    fundoMenu.hidden = true;
    botaoMenu.setAttribute("aria-expanded", "false");
  }

  botaoMenu.addEventListener("click", abrirMenu);
  $("#btn-fechar").addEventListener("click", () => { fecharMenu(); botaoMenu.focus(); });
  fundoMenu.addEventListener("click", fecharMenu);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") fecharMenu(); });

  /* 6. FEED E CHAT --------------------------------------- */
  function criarPost(dados) {
    const botaoAcao = (id, rotulo, extra = "") => {
      const b = el("button", { type: "button", class: "acao " + extra, "aria-label": rotulo, "aria-pressed": "false" });
      b.append(icone(id));
      b.addEventListener("click", () => {
        const ligado = b.getAttribute("aria-pressed") === "true";
        b.setAttribute("aria-pressed", String(!ligado));
      });
      return b;
    };

    const repostar = el("button", { type: "button", class: "post__repostar", "aria-pressed": "false" });
    repostar.append(icone("i-repost"), "Repost");
    repostar.addEventListener("click", () => {
      const ligado = repostar.getAttribute("aria-pressed") === "true";
      repostar.setAttribute("aria-pressed", String(!ligado));
      if (!ligado) avisar("Publicação repostada.");
    });

    return el("article", { class: "post" },
      el("div", { class: "post__autor" }, el("span", { class: "avatar avatar--post", "aria-hidden": "true" }), dados.usuario),
      el("div", { class: "post__imagem", text: dados.texto }),
      el("div", { class: "post__acoes" },
        botaoAcao("i-heart", "Curtir"),
        botaoAcao("i-comment", "Comentar"),
        botaoAcao("i-save", "Salvar", "acao--salvar"),
        repostar
      )
    );
  }

  function montarFeed() {
    const feed = $("#feed");
    feed.replaceChildren(...POSTS.map(criarPost));
  }

  function montarChat() {
    const lista = $("#chat-lista");
    lista.replaceChildren(...CONVERSAS.map((c) => {
      const foto = el("span", { class: "chat__foto" }, el("span", { class: "avatar avatar--chat", "aria-hidden": "true" }));
      let selo = null;
      if (c.nao_lidas > 0) {
        selo = el("span", { class: "chat__selo", text: String(c.nao_lidas) });
        foto.append(selo);
      }
      const botao = el("button", { type: "button", class: "chat__item" }, foto, c.nome);
      botao.addEventListener("click", () => {
        if (selo) { selo.remove(); selo = null; c.nao_lidas = 0; }
        avisar("Conversa com " + c.nome + " em breve.");
      });
      return el("li", {}, botao);
    }));
  }

  /* 7. MEUS PETS ----------------------------------------- */
  function montarPets() {
    const lista = $("#pets-lista");
    const detalhe = $("#pet-detalhe");

    lista.replaceChildren(...PETS.map((pet) => {
      const botao = el("button", { type: "button", class: "pet", "aria-pressed": "false" },
        el("span", { class: "avatar", "aria-hidden": "true" }),
        el("span", { class: "rotulo", text: pet.nome })
      );
      botao.addEventListener("click", () => {
        $$(".pet", lista).forEach((b) => b.setAttribute("aria-pressed", "false"));
        botao.setAttribute("aria-pressed", "true");

        $("#pet-nome-rotulo").textContent = pet.nome;
        $("#pd-nome").textContent = pet.nome;
        $("#pd-sexo").textContent = pet.sexo;
        $("#pd-raca").textContent = pet.raca;
        $("#pd-peso").textContent = pet.peso;
        $("#pd-tamanho").textContent = pet.tamanho;
        $("#pd-temp").textContent = pet.temperamento;

        detalhe.hidden = false;
        detalhe.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      return el("li", {}, botao);
    }));
  }

  /* 8. SERVIÇOS E PROFISSIONAIS -------------------------- */
  function criarCartao(titulo, nota, funcao) {
    const nomeEl = el("h3", { class: "card-item__nome", text: titulo });
    const estrela = icone("i-star");
    estrela.setAttribute("class", "estrela");
    const notaEl = el("p", { class: "card-item__nota" }, nota + " ", estrela, " (nota de avaliação)");
    const textos = el("div", {}, nomeEl, notaEl);
    if (funcao) textos.append(el("p", { class: "card-item__funcao", text: funcao }));

    return el("li", { class: "card-item" }, el("span", { class: "avatar", "aria-hidden": "true" }), textos);
  }

  function montarListas() {
    $("#lista-servicos").replaceChildren(...SERVICOS.map((s) => criarCartao(s.nome, s.nota)));
    $("#lista-profissionais").replaceChildren(...PROFISSIONAIS.map((p) => criarCartao(p.nome, p.nota, p.funcao)));
  }

  /* 9. AJUDA E CONFIGURAÇÕES ----------------------------- */
  $("#feedback-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const campo = $("#feedback-texto");
    if (!campo.value.trim()) {
      campo.focus();
      avisar("Escreva seu feedback antes de enviar.");
      return;
    }
    campo.value = "";
    $("#feedback-ok").hidden = false;
  });

  // Qualquer elemento com data-aviso mostra uma mensagem curta
  document.addEventListener("click", (e) => {
    const alvo = e.target.closest("[data-aviso]");
    if (!alvo) return;
    e.preventDefault();
    avisar(alvo.dataset.aviso);
  });

  $("#btn-logout").addEventListener("click", sair);
  $("#btn-excluir").addEventListener("click", () => {
    if (confirm("Tem certeza de que deseja excluir sua conta? Essa ação não poderá ser desfeita.")) {
      sair();
      avisar("Conta excluída.");
    }
  });

  /* 10. INÍCIO ------------------------------------------- */
  montarFeed();
  montarChat();
  montarPets();
  montarListas();
  definirNome(ler("pataforma_nome") || "visitante");
  renderizar();
})();