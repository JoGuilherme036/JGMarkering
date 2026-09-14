/* ==========================================================================
   JG MARKETING — Portfólio v8
   Um único arquivo, sem dependências. Funciona aberto direto do disco.
   ========================================================================== */
(() => {
  "use strict";

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const WA = "5586994432717";
  const IG = "https://www.instagram.com/jgmarketing__/";
  const DRAFT = "jg.brief.v8";

  /* ---------- 0. Fontes no modo local ------------------------------------
     Em produção as fontes são auto-hospedadas (rápidas, offline, sem terceiros).
     Aberto direto do disco (file://), o navegador bloqueia woff2 por CORS —
     então só nesse caso carregamos a versão de CDN para a prévia sair igual. */
  if (location.protocol === "file:") {
    const l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..900&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap";
    document.head.appendChild(l);
  }

  /* ---------- utilitários ------------------------------------------------ */
  // Liga um evento só se o elemento existir e isola a falha de cada handler,
  // para que um erro pontual nunca interrompa o restante da página.
  const on = (el, evt, fn, opts) => {
    if (!el) return;
    el.addEventListener(evt, (e) => {
      try { fn(e); } catch (err) { console.warn("[JG]", evt, err); }
    }, opts);
  };
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
    del(k) { try { localStorage.removeItem(k); } catch {} }
  };

  let toastTimer;
  const toastEl = $("#toast");
  const toast = (msg) => {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("on"), 3000);
  };

  const waLink = (text) => `https://wa.me/${WA}?text=${encodeURIComponent(text)}`;
  const brNum  = (n) => n.toLocaleString("pt-BR");

  $("#yr") && ($("#yr").textContent = String(new Date().getFullYear()));

  /* ---------- 1. Mensagens de WhatsApp por contexto ---------------------- */
  const waTexts = {
    header:  "Olá, João! Vi o portfólio da JG Marketing e quero conversar sobre um projeto para a minha marca.",
    hero:    "Olá, João! Conheci o seu trabalho pelo portfólio. Quero melhorar a comunicação da minha empresa e gostaria de uma orientação inicial.",
    contact: "Olá, João! Vim pelo portfólio da JG Marketing e gostaria de pedir um orçamento. Posso te contar sobre o meu projeto?",
    footer:  "Olá, João! Cheguei ao fim do seu portfólio e quero conversar sobre uma proposta para a minha marca.",
    float:   "Olá, João! Estou navegando pelo seu portfólio e tenho uma dúvida rápida sobre os serviços.",
    dock:    "Olá, João! Vi o seu portfólio e quero falar sobre um projeto. Pode me passar mais detalhes?"
  };
  $$("[data-wa]").forEach((a) => {
    const t = waTexts[a.dataset.wa];
    if (t) a.href = waLink(t);
  });
  $$('a[href*="instagram.com"]').forEach((a) => { a.href = IG; });

  /* ---------- 2. Cabeçalho e menu ---------------------------------------- */
  const nav = $("#nav");
  const burger = $("#burger");
  const sheet = $("#sheet");

  const closeSheet = () => {
    if (!sheet.classList.contains("open")) return;
    sheet.classList.remove("open");
    burger.classList.remove("on");
    burger.setAttribute("aria-expanded", "false");
    sheet.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-locked");
  };

  on(burger, "click", () => {
    const open = !sheet.classList.contains("open");
    sheet.classList.toggle("open", open);
    burger.classList.toggle("on", open);
    burger.setAttribute("aria-expanded", String(open));
    sheet.setAttribute("aria-hidden", String(!open));
    document.body.classList.toggle("is-locked", open);
  });
  $$("a", sheet).forEach((a) => on(a, "click", closeSheet));

  /* ---------- 3. Timeline de capítulos (elemento assinatura) ------------- */
  const timeline  = $("#timeline");
  const track     = $("#track");
  const trackFill = $("#trackFill");
  const trackHead = $("#trackHead");
  const tcNow     = $("#tcNow");
  const chapterNow= $("#chapterNow");
  const actNow    = $("#actNow");
  const thinBar   = $("#thinBar");
  const waFloat   = $("#waFloat");

  const chapters = $$("[data-chapter]");
  const contactSec = $("#contato");
  const dock = $("#dock");
  const DURATION = 240; // duração nominal, em segundos, para o timecode

  const docMax = () => Math.max(1, document.documentElement.scrollHeight - innerHeight);

  // Marcadores de capítulo posicionados pela altura real de cada seção
  const buildTicks = () => {
    $$(".tick", track).forEach((t) => t.remove());
    const max = docMax();
    chapters.forEach((sec, i) => {
      if (i === 0) return;
      const pct = Math.min(100, (sec.offsetTop / max) * 100);
      const b = document.createElement("button");
      b.type = "button";
      b.className = "tick";
      b.style.left = pct + "%";
      b.dataset.pct = String(pct);
      b.dataset.id = sec.id;
      const ato = sec.dataset.act;
      const abreAto = ato !== chapters[i - 1].dataset.act;
      if (abreAto) b.classList.add("act");
      b.setAttribute("aria-label", `Ir para ${sec.dataset.chapter}`);
      b.innerHTML = `<span class="tick__lbl">${abreAto ? sec.dataset.actNome + " · " : ""}${sec.dataset.chapter}</span>`;
      b.addEventListener("click", (e) => {
        e.stopPropagation();
        sec.scrollIntoView({ behavior: calm ? "auto" : "smooth", block: "start" });
      });
      track.appendChild(b);
    });
  };

  const fmtTime = (s) => {
    const m = Math.floor(s / 60);
    const r = Math.floor(s % 60);
    return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
  };

  const navLinks = $$("#navLinks a");
  let activeId = "";

  const onScroll = () => {
    const y = scrollY;
    const pct = Math.min(100, Math.max(0, (y / docMax()) * 100));

    nav.classList.toggle("stuck", y > 24);
    if (thinBar) thinBar.style.width = pct + "%";
    if (trackFill) trackFill.style.width = pct + "%";
    if (trackHead) trackHead.style.left = pct + "%";
    if (tcNow) tcNow.textContent = fmtTime((pct / 100) * DURATION);
    if (track) track.setAttribute("aria-valuenow", String(Math.round(pct)));
    $$(".tick", track).forEach((t) => t.classList.toggle("done", Number(t.dataset.pct) <= pct));

    // O botão flutuante some quando a seção de contato já está na tela:
    // ali os quatro canais estão visíveis e ele só atrapalharia o formulário.
    const contactTop = contactSec ? contactSec.offsetTop - innerHeight * 0.75 : Infinity;
    const show = y > innerHeight * 0.6;
    timeline && timeline.classList.toggle("up", show);
    dock && dock.classList.toggle("up", show);
    waFloat && waFloat.classList.toggle("up", show && y < contactTop);

    // capítulo atual
    const line = y + innerHeight * 0.35;
    let current = chapters[0];
    for (const sec of chapters) if (sec.offsetTop <= line) current = sec;
    if (current && current.id !== activeId) {
      activeId = current.id;
      chapterNow && (chapterNow.textContent = current.dataset.chapter);
      actNow && (actNow.textContent = "ATO " + current.dataset.act);
      navLinks.forEach((a) => {
        const on = a.getAttribute("href") === `#${activeId}`;
        a.classList.toggle("on", on);
        on ? a.setAttribute("aria-current", "true") : a.removeAttribute("aria-current");
      });
    }
  };

  // Arrastar / clicar na régua para navegar
  const seek = (clientX) => {
    const r = track.getBoundingClientRect();
    const pct = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
    scrollTo({ top: pct * docMax(), behavior: "auto" });
  };
  let dragging = false;
  track.addEventListener("pointerdown", (e) => {
    dragging = true;
    try { track.setPointerCapture(e.pointerId); } catch { /* segue sem captura */ }
    seek(e.clientX);
  });
  track.addEventListener("pointermove", (e) => { if (dragging) seek(e.clientX); });
  track.addEventListener("pointerup",   () => { dragging = false; });
  track.addEventListener("keydown", (e) => {
    const step = e.shiftKey ? 0.25 : 0.05;
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      const dir = e.key === "ArrowRight" ? 1 : -1;
      scrollTo({ top: scrollY + dir * step * docMax(), behavior: calm ? "auto" : "smooth" });
    }
    if (e.key === "Home") { e.preventDefault(); scrollTo({ top: 0, behavior: "smooth" }); }
    if (e.key === "End")  { e.preventDefault(); scrollTo({ top: docMax(), behavior: "smooth" }); }
  });

  addEventListener("scroll", () => { try { onScroll(); } catch (e) { /* ignora */ } }, { passive: true });
  addEventListener("resize", () => { buildTicks(); onScroll(); });
  buildTicks();
  onScroll();
  addEventListener("load", () => { buildTicks(); onScroll(); });

  /* ---------- 4. Revelação por scroll ------------------------------------ */
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("seen");
        io.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    $$(".rv").forEach((el) => io.observe(el));
    $$(".figs > div").forEach((el) => io.observe(el));
    $$(".head").forEach((el) => io.observe(el));
  } else {
    $$(".rv").forEach((el) => el.classList.add("seen"));
  }

  // índice de cada filho para o atraso encadeado da entrada
  $$(".paths, .svcs, .skills, .labs, .formats, .sites, .goals").forEach((grid) => {
    Array.from(grid.children).forEach((child, i) => child.style.setProperty("--i", i));
  });

  // sinaliza que a página carregou, para as barras do placar correrem
  requestAnimationFrame(() => document.body.classList.add("loaded"));

  /* ---------- Timecode do hero — conta até 12s, o tempo médio do Reel --- */
  const heroTc = $("#heroTc");
  if (heroTc) {
    const fim = 12;                       // 12 s de tempo médio de visualização
    const dur = calm ? 0 : 2600;
    const t0 = performance.now() + 500;
    const passo = (t) => {
      const p = dur ? Math.min(1, Math.max(0, (t - t0) / dur)) : 1;
      const s = Math.floor(p * fim);
      const f = Math.floor((p * fim - s) * 100);
      heroTc.textContent = `00:${String(s).padStart(2, "0")}` + (p < 1 ? `:${String(f).padStart(2, "0")}` : "");
      if (p < 1) requestAnimationFrame(passo);
      else heroTc.textContent = "00:12 · 9:16";
    };
    requestAnimationFrame(passo);
  }

  /* ---------- 5. Contadores ---------------------------------------------- */
  const countUp = (el, to, opts = {}) => {
    if (calm) { el.textContent = opts.format === "br" ? brNum(to) : to + (opts.suffix || ""); return; }
    const dur = 1750;
    const t0 = performance.now();
    const step = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      const eased = p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      const val = Math.round(to * eased);
      el.textContent = opts.format === "br" ? brNum(val) : val + (opts.suffix || "");
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const counted = new WeakSet();
  const runCounter = (el) => {
    if (counted.has(el)) return;
    counted.add(el);
    const to = Number(el.dataset.count || el.dataset.to || 0);
    countUp(el, to, { format: el.dataset.format, suffix: el.dataset.suffix });
  };

  if ("IntersectionObserver" in window) {
    const co = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { runCounter(e.target); co.unobserve(e.target); } });
    }, { threshold: 0.5 });
    $$("[data-count]").forEach((el) => co.observe(el));
  } else {
    $$("[data-count]").forEach(runCounter);
  }

  /* ---------- 6. Sobreposições (modal, lightbox) ------------------------- */
  let lastFocus = null;

  const openOv = (el) => {
    lastFocus = document.activeElement;
    el.classList.add("on");
    el.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-locked");
    const first = el.querySelector("[data-close], button, a[href]");
    first && first.focus();
  };
  const closeOv = (el) => {
    el.classList.remove("on");
    el.setAttribute("aria-hidden", "true");
    if (!$$(".ov.on, .lb.on").length) document.body.classList.remove("is-locked");
    lastFocus && lastFocus.focus();
  };

  $$(".ov, .lb").forEach((ov) => {
    ov.addEventListener("click", (e) => {
      if (e.target === ov || e.target.closest("[data-close]")) closeOv(ov);
    });
    // prende o foco dentro da caixa aberta
    ov.addEventListener("keydown", (e) => {
      if (e.key !== "Tab") return;
      const f = $$('a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])', ov)
        .filter((n) => n.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  });

  addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const open = $(".ov.on, .lb.on");
    if (open) closeOv(open);
    closeSheet();
  });

  /* ---------- 7. Lightbox das marcas ------------------------------------- */
  const lb = $("#lb"), lbImg = $("#lbImg"), lbCap = $("#lbCap");
  $$("[data-zoom]").forEach((btn) => {
    btn.addEventListener("click", () => {
      // usa a própria imagem do cartão quando não há caminho separado
      lbImg.src = btn.dataset.zoom || btn.querySelector("img").src;
      lbImg.alt = btn.dataset.zoomCap || "";
      lbCap.textContent = btn.dataset.zoomCap || "";
      openOv(lb);
    });
  });

  /* ---------- 8. Catálogo de serviços e formatos -------------------------- */
  const catalog = {
    gestao: {
      kicker: "Serviço · Estratégia e rotina",
      title: "Gestão de redes sociais",
      desc: "Organização da presença da marca para manter frequência, coerência e clareza na comunicação do dia a dia.",
      a: ["Planejamento de temas e pilares", "Calendário de publicações", "Legendas e chamadas para ação", "Direção para stories e formatos", "Ajuste de bio e organização do perfil"],
      b: ["Empresas com Instagram parado ou irregular", "Negócios que precisam organizar a comunicação", "Marcas que querem manter presença mensal"]
    },
    reels: {
      kicker: "Serviço · Conteúdo em vídeo",
      title: "Reels e vídeos curtos",
      desc: "Vídeos verticais construídos para chamar atenção nos primeiros segundos, explicar rápido e conduzir o público a uma ação.",
      a: ["Roteiro e abertura forte", "Seleção de cortes e ritmo", "Texto e legenda na tela", "Trilha e tratamento básico", "Capa e arquivo pronto para publicar"],
      b: ["Produtos e serviços que precisam ser demonstrados", "Conteúdo de venda, humor ou autoridade", "Marcas que querem melhorar retenção"]
    },
    design: {
      kicker: "Serviço · Identidade e campanha",
      title: "Design e campanhas",
      desc: "Peças visuais organizadas para destacar oferta, benefício, preço e posicionamento sem poluir a mensagem.",
      a: ["Artes para feed e stories", "Campanhas sazonais", "Banners e peças promocionais", "Adaptação da identidade visual", "Variações para WhatsApp e anúncio"],
      b: ["Lojas com oferta frequente", "Lançamentos e datas comerciais", "Marcas que precisam parecer mais profissionais"]
    },
    site: {
      kicker: "Serviço · Web e conversão",
      title: "Landing pages e sites",
      desc: "Páginas responsivas que apresentam a empresa com clareza e facilitam o contato do potencial cliente.",
      a: ["Arquitetura das seções", "Design responsivo para celular e computador", "Texto e hierarquia da informação", "Botões, formulário e WhatsApp", "SEO básico e otimização de carregamento"],
      b: ["Empresas sem site profissional", "Campanhas de captação e lançamento", "Portfólios, catálogos e apresentação de serviços"]
    },
    catalogo: {
      kicker: "Serviço · Material comercial",
      title: "Catálogos e apresentações",
      desc: "Documentos digitais que centralizam informação e ajudam o time comercial a apresentar produtos e serviços.",
      a: ["Organização de categorias", "Páginas de produto e serviço", "Aplicação da identidade visual", "Preço, diferencial e chamada", "Arquivo em PDF pronto para envio"],
      b: ["Vendedores e equipes comerciais", "Empresas com muitos produtos", "Propostas, cardápios e apresentações"]
    },
    ads: {
      kicker: "Serviço · Aquisição",
      title: "Campanhas e anúncios",
      desc: "Estrutura de campanha com mensagem, oferta e criativos alinhados ao objetivo comercial da empresa.",
      a: ["Definição da oferta principal", "Criativos para tráfego", "Texto e variações de anúncio", "Configuração básica no Meta Ads", "Direcionamento para página ou WhatsApp"],
      b: ["Negócios que querem gerar contato", "Campanhas de produto e promoção", "Empresas que precisam testar novas ofertas"]
    },

    /* formatos */
    oferta: {
      kicker: "Formato · Arte de oferta",
      title: "Artes de oferta e selo de preço",
      desc: "Peça de preço construída para ser lida de longe, no feed e na tela pequena: número grande, benefício curto e identidade da loja.",
      a: ["Selo de preço com hierarquia forte", "Versões para feed, stories e WhatsApp", "Kit de campanha com peças variadas", "Aplicação da paleta e tipografia da marca"],
      b: ["Varejo com promoção semanal", "Datas comerciais e liquidação", "Lojas que enviam oferta por WhatsApp"]
    },
    feed: {
      kicker: "Formato · Feed e carrossel",
      title: "Carrossel e grade de feed",
      desc: "Sequência que explica, ensina ou apresenta com ritmo — mantendo identidade consistente entre as publicações.",
      a: ["Estrutura de 6 a 10 páginas", "Capa com gancho de leitura", "Sistema visual replicável", "Legenda e chamada final"],
      b: ["Marcas que precisam educar o público", "Serviços com muita informação", "Perfis que querem um feed organizado"]
    }
  };
  // formatos que reaproveitam a mesma ficha dos serviços
  catalog.site && (catalog.web = catalog.site);

  const ovDetail = $("#ovDetail");
  const showDetail = (key, sourceLabel) => {
    const d = catalog[key];
    if (!d) return;
    $("#ovDetailKicker").textContent = d.kicker;
    $("#ovDetailTitle").textContent = d.title;
    $("#ovDetailDesc").textContent = d.desc;
    $("#ovDetailA").innerHTML = d.a.map((i) => `<li>${i}</li>`).join("");
    $("#ovDetailB").innerHTML = d.b.map((i) => `<li>${i}</li>`).join("");
    $("#ovDetailWa").href = waLink(`Olá, João! Vi "${d.title}" no seu portfólio e quero saber sobre entregas, prazo e investimento para a minha empresa.`);
    ovDetail.dataset.pick = d.title;
    openOv(ovDetail);
  };

  $$("[data-svc]").forEach((b) => b.addEventListener("click", () => showDetail(b.dataset.svc)));
  $$("[data-fmt]").forEach((b) => b.addEventListener("click", () => showDetail(b.dataset.fmt)));

  on($("#ovDetailAdd"), "click", () => {
    setPack(ovDetail.dataset.pick || "");
    closeOv(ovDetail);
    toast("Adicionado ao briefing.");
    goTo("#contato");
  });

  /* ---------- 9. Filtro e busca de formatos ------------------------------ */
  const fmtCards  = $$(".fmt");
  const fmtCount  = $("#fmtCount");
  const fmtEmpty  = $("#fmtEmpty");
  const fmtSearch = $("#fmtSearch");
  let curFilter = "all";

  const norm = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  const applyFilter = () => {
    const q = norm(fmtSearch.value.trim());
    let visible = 0;
    fmtCards.forEach((c) => {
      const inCat = curFilter === "all" || c.dataset.cat.split(" ").includes(curFilter);
      const hay = norm(c.dataset.kw + " " + c.textContent);
      const inQ = !q || hay.includes(q);
      const show = inCat && inQ;
      c.hidden = !show;
      if (show) visible++;
    });
    fmtCount.textContent = `${visible} ${visible === 1 ? "formato" : "formatos"}`;
    fmtEmpty.classList.toggle("on", visible === 0);
  };

  $$("#filters button").forEach((b) => b.addEventListener("click", () => {
    curFilter = b.dataset.f;
    $$("#filters button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    applyFilter();
  }));
  on(fmtSearch, "input", applyFilter);

  /* ---------- 10. Comparação de pacotes ---------------------------------- */
  on($("#btnCompare"), "click", () => openOv($("#ovCompare")));

  /* ---------- 11. FAQ ---------------------------------------------------- */
  $$(".faq__q").forEach((b) => b.addEventListener("click", () => {
    const item = b.closest(".faq__item");
    const open = !item.classList.contains("open");
    item.classList.toggle("open", open);
    b.setAttribute("aria-expanded", String(open));
  }));

  /* ---------- 12. Briefing ----------------------------------------------- */
  const form    = $("#brief");
  const progBar = $("#progBar");
  const progTxt = $("#progTxt");
  const status  = $("#formStatus");
  const fields  = $$("#brief input, #brief select, #brief textarea");
  const packEl  = $("#f-pack");

  const setPack = (v) => {
    if (!packEl || !v) return;
    packEl.value = v;
    packEl.dispatchEvent(new Event("input", { bubbles: true }));
  };

  const goTo = (sel) => {
    const t = $(sel);
    t && t.scrollIntoView({ behavior: calm ? "auto" : "smooth", block: "start" });
  };

  const updateProgress = () => {
    const filled = fields.filter((f) => f.value.trim() && f.value !== "Ainda estou avaliando").length;
    const pct = Math.round((filled / fields.length) * 100);
    progBar.style.width = pct + "%";
    progTxt.textContent = pct + "% preenchido";
  };

  const saveDraft = () => {
    const data = {};
    fields.forEach((f) => { data[f.name] = f.value; });
    store.set(DRAFT, data);
  };

  const loadDraft = () => {
    const d = store.get(DRAFT);
    if (!d) return;
    fields.forEach((f) => { if (d[f.name]) f.value = d[f.name]; });
    updateProgress();
  };

  let saveTimer;
  fields.forEach((f) => f.addEventListener("input", () => {
    f.closest(".field") && f.closest(".field").classList.remove("err");
    updateProgress();
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveDraft, 400);
  }));
  loadDraft();
  updateProgress();

  on($("#btnClearDraft"), "click", () => {
    store.del(DRAFT);
    form.reset();
    updateProgress();
    status.textContent = "";
    toast("Rascunho apagado deste aparelho.");
  });

  const validate = () => {
    let ok = true;
    fields.filter((f) => f.required).forEach((f) => {
      const bad = !f.value.trim();
      f.closest(".field").classList.toggle("err", bad);
      if (bad && ok) { f.focus(); ok = false; }
    });
    return ok;
  };

  const buildBrief = () => {
    const v = (id) => ($(id).value || "").trim();
    const lines = [
      "Olá, João! Vim pelo portfólio da JG Marketing e preparei um briefing:",
      "",
      `• Nome: ${v("#f-name") || "—"}`,
      `• Empresa/segmento: ${v("#f-biz") || "—"}`,
      `• Contato: ${v("#f-contact") || "—"}`,
      `• Início desejado: ${v("#f-when")}`,
      `• Interesse: ${v("#f-pack") || "—"}`,
      "",
      `O que preciso melhorar: ${v("#f-msg") || "—"}`
    ];
    return lines.join("\n");
  };

  on(form, "submit", (e) => {
    e.preventDefault();
    if (!validate()) { status.style.color = "var(--flame)"; status.textContent = "Preencha os campos destacados."; return; }
    status.style.color = "";
    status.textContent = "WhatsApp aberto com a mensagem pronta. Revise antes de enviar.";
    saveDraft();
    window.open(waLink(buildBrief()), "_blank", "noopener");
  });

  on($("#btnCopy"), "click", async () => {
    const text = buildBrief();
    try {
      await navigator.clipboard.writeText(text);
      toast("Briefing copiado.");
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); toast("Briefing copiado."); }
      catch { toast("Não consegui copiar. Selecione o texto manualmente."); }
      ta.remove();
    }
  });

  /* ---------- 13. Pacotes e caminhos ------------------------------------- */
  $$(".pick").forEach((b) => b.addEventListener("click", () => {
    setPack(b.dataset.plan);
    toast(`${b.dataset.plan} adicionado ao briefing.`);
    goTo("#contato");
  }));

  $$("[data-prefill]").forEach((a) => a.addEventListener("click", () => setPack(a.dataset.prefill)));

  const goalPack = {
    sales: "Campanhas e ofertas para vender mais",
    video: "Reels e vídeos curtos",
    authority: "Conteúdo de autoridade e posicionamento",
    site: "Site ou landing page"
  };
  $$("[data-goal]").forEach((b) => b.addEventListener("click", () => {
    setPack(goalPack[b.dataset.goal] || "");
    goTo(b.dataset.to);
    toast("Objetivo registrado no briefing.");
  }));

  /* ---------- 14. Diagnóstico -------------------------------------------- */
  const answers = {};
  const diagOut = $("#diagOut");

  const recommend = () => {
    if (Object.keys(answers).length < 3) return;
    let plan = "Presença Digital";
    let why  = "Um começo organizado para voltar a aparecer com qualidade e frequência controlada.";

    if (answers.goal === "sales" || answers.format === "complete" || answers.freq === "monthly") {
      plan = "Loja Vendendo Mais";
      why  = "Uma solução mais completa para oferta, vídeo e comunicação comercial frequente.";
    }
    if (answers.goal === "authority" || answers.freq === "strong") {
      plan = "Conteúdo Autoridade";
      why  = "Produção mais estratégica para reforçar confiança, posicionamento e valor percebido.";
    }

    diagOut.innerHTML = `
      <small>Recomendação inicial</small>
      <strong>${plan}</strong>
      <p>${why}</p>
      <button class="btn btn--blue btn--sm" type="button" id="diagGo">Levar para o briefing</button>`;
    $("#diagGo").addEventListener("click", () => {
      setPack(plan);
      goTo("#contato");
      toast("Recomendação adicionada ao briefing.");
    });
  };

  $$(".diag__q").forEach((q) => {
    $$("button", q).forEach((b) => b.addEventListener("click", () => {
      answers[q.dataset.q] = b.dataset.v;
      $$("button", q).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      recommend();
    }));
  });

  /* ---------- 15. Compartilhar e imprimir -------------------------------- */
  on($("#btnShare"), "click", async () => {
    const data = {
      title: "João Guilherme — JG Marketing",
      text: "Portfólio de conteúdo, design e sites da JG Marketing.",
      url: location.href.split("#")[0]
    };
    if (navigator.share) {
      try { await navigator.share(data); return; } catch { /* cancelado */ }
    }
    try { await navigator.clipboard.writeText(data.url); toast("Link copiado."); }
    catch { toast("Copie o endereço da barra do navegador."); }
  });

  on($("#btnPrint"), "click", (e) => { e.preventDefault(); print(); });

  /* ---------- 16. Rolagem suave interna ---------------------------------- */
  $$('a[href^="#"]').forEach((a) => {
    const id = a.getAttribute("href");
    if (id.length < 2) return;
    a.addEventListener("click", (e) => {
      const target = $(id);
      if (!target) return;
      e.preventDefault();
      closeSheet();
      target.scrollIntoView({ behavior: calm ? "auto" : "smooth", block: "start" });
      // Documentos de origem opaca (visualizador in-app, iframe com sandbox)
      // proíbem alterar o histórico. O salto já aconteceu; o endereço é extra.
      try { history.replaceState(null, "", id); } catch { /* sem histórico */ }
    });
  });
})();
