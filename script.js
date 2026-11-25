// Revista Memória e Trabalho
// As páginas seguem a ordem dos arquivos enviados: 1.jpeg ... 11.jpeg, 12.pdf, 13.pdf.
(function () {
  'use strict';

  var RATIO = 595.5 / 842.25;

  var PAGES = [
    'Capa: Memória e Trabalho, Paraná, Curitiba e os ciclos que movem a história',
    'Apresentação: Entre ciclos, trilhos e memórias, o Paraná construído pelo trabalho',
    'Os ciclos econômicos do Paraná: da erva-mate ao café',
    'O café e o desenvolvimento',
    'Industrialização e novos horizontes',
    'O trabalho no cotidiano',
    'Conclusão: trabalho e economia, um ciclo que constrói o futuro',
    'Paulo Leminski',
    'Leminski e a literatura sobre a classe operária',
    'Domingos Pellegrini e o Norte do Paraná',
    'Pellegrini e o anti-herói do cotidiano',
    'A Curitiba urbana e as margens do trabalho',
    'O choque: bonde x carroça',
    'O invisível: quem segura a cidade',
    'A espera: o ônibus que não para',
    'Conclusão: Curitiba, memória e trabalho',
    'Erva-mate e madeira: a riqueza da natureza que construiu histórias',
    'A história da erva-mate',
    'A importância da madeira',
    'Economia e meio ambiente',
    'Cultura e tradição'
  ];

  // Seções do índice (número da página, começando em 1)
  var SECTIONS = [
    { title: 'Capa', page: 1 },
    { title: 'Apresentação', page: 2 },
    { title: 'Ciclos econômicos do Paraná', page: 3 },
    { title: 'Literatura: Leminski', page: 8 },
    { title: 'Literatura: Pellegrini', page: 10 },
    { title: 'Curitiba e as margens do trabalho', page: 12 },
    { title: 'Erva-mate e madeira', page: 17 }
  ];

  var TOTAL = PAGES.length;            // 21
  var LEAVES = Math.ceil(TOTAL / 2);   // 11 folhas: a capa fica sozinha, depois pares (2,3), (4,5)...
  var MAX_SPREAD = LEAVES - 1;         // 10

  var $ = function (id) { return document.getElementById(id); };
  var book = $('book'), single = $('single'), singleImg = $('single-img');
  var prev = $('prev'), next = $('next'), indicator = $('indicator'), slider = $('slider');
  var tocBtn = $('toc-btn'), toc = $('toc'), stage = $('stage');

  var src = function (i) { return 'pagina-' + (i < 9 ? '0' : '') + (i + 1) + '.jpg'; };

  var state = { page: 0, spread: 0, isSingle: false };
  var leaves = [];

  function makeFace(cls, i) {
    var f = document.createElement('div');
    f.className = 'face ' + cls;
    if (i < TOTAL) {
      var img = document.createElement('img');
      img.src = src(i);
      img.alt = 'Página ' + (i + 1) + '. ' + PAGES[i];
      img.draggable = false;
      f.appendChild(img);
    } else {
      f.setAttribute('aria-hidden', 'true');
    }
    return f;
  }

  function buildBook() {
    for (var k = 0; k < LEAVES; k++) {
      var leaf = document.createElement('div');
      leaf.className = 'leaf';
      leaf.appendChild(makeFace('front', 2 * k));
      leaf.appendChild(makeFace('back', 2 * k + 1));
      book.appendChild(leaf);
      leaves.push(leaf);
    }
  }

  // Quantas folhas já viraram para mostrar a página p (índice 0)?
  function spreadOf(p) { return Math.min(MAX_SPREAD, (p + 1) >> 1); }
  function pageOfSpread(s) { return s === 0 ? 0 : 2 * s - 1; }

  function setZ(spread, animating) {
    for (var k = 0; k < LEAVES; k++) {
      var flipped = k < spread;
      leaves[k].style.zIndex = flipped ? k : LEAVES - k;
    }
    if (animating !== undefined && leaves[animating]) leaves[animating].style.zIndex = LEAVES + 1;
  }

  function renderBook(prevSpread) {
    var s = state.spread;
    // a folha que está virando fica por cima durante a animação
    var moving = null;
    if (prevSpread !== undefined && Math.abs(prevSpread - s) === 1) moving = Math.min(prevSpread, s);
    setZ(s, moving === null ? undefined : moving);
    leaves.forEach(function (leaf, k) { leaf.classList.toggle('flipped', k < s); });
    book.classList.toggle('closed-start', s === 0);
    if (moving !== null) {
      setTimeout(function () { setZ(state.spread); }, 900);
    }
  }

  function describe() {
    var p = state.page + 1;
    if (state.isSingle) {
      return p === 1 ? 'Capa' : 'Página ' + p + ' de ' + TOTAL;
    }
    if (state.spread === 0) return 'Capa';
    var l = 2 * state.spread, r = l + 1;
    return r > TOTAL ? 'Página ' + l + ' de ' + TOTAL : 'Páginas ' + l + '–' + r + ' de ' + TOTAL;
  }

  function update(opts) {
    opts = opts || {};
    if (state.isSingle) {
      singleImg.style.setProperty('--from', (opts.dir || 1) * 14 + 'px');
      singleImg.src = src(state.page);
      singleImg.alt = 'Página ' + (state.page + 1) + '. ' + PAGES[state.page];
      // reinicia a animação de entrada
      singleImg.style.animation = 'none'; void singleImg.offsetWidth; singleImg.style.animation = '';
      prev.disabled = state.page === 0;
      next.disabled = state.page === TOTAL - 1;
    } else {
      renderBook(opts.prevSpread);
      prev.disabled = state.spread === 0;
      next.disabled = state.spread === MAX_SPREAD;
    }
    indicator.textContent = describe();
    slider.value = state.page + 1;
    try { history.replaceState(null, '', '#pagina-' + (state.page + 1)); } catch (e) {}
  }

  function goPage(p, dir) {
    p = Math.max(0, Math.min(TOTAL - 1, p));
    var old = state.spread;
    var d = dir || (p >= state.page ? 1 : -1);
    state.page = p;
    state.spread = spreadOf(p);
    update({ prevSpread: old, dir: d });
  }

  function step(d) {
    if (state.isSingle) {
      goPage(state.page + d, d);
    } else {
      var s = Math.max(0, Math.min(MAX_SPREAD, state.spread + d));
      if (s === state.spread) return;
      var old = state.spread;
      state.spread = s;
      state.page = pageOfSpread(s);
      update({ prevSpread: old });
    }
  }

  // ---------- Tamanho ----------
  function layout() {
    var single_ = window.innerWidth < 720;
    var vp = $('viewport');
    var availW = vp.clientWidth - 8;
    var availH = vp.clientHeight - 16;
    var pw = single_
      ? Math.min(availH * RATIO, window.innerWidth - 24)
      : Math.min(availH * RATIO, availW / 2);
    pw = Math.max(120, Math.floor(pw));
    var root = document.documentElement.style;
    root.setProperty('--pw', pw + 'px');
    root.setProperty('--ph', Math.floor(pw / RATIO) + 'px');

    if (single_ !== state.isSingle) {
      state.isSingle = single_;
      book.hidden = single_;
      single.hidden = !single_;
      state.spread = spreadOf(state.page);
      if (!single_) state.page = pageOfSpread(state.spread);
      update();
    }
  }

  // ---------- Índice ----------
  SECTIONS.forEach(function (s) {
    var li = document.createElement('li');
    var b = document.createElement('button');
    b.type = 'button';
    b.innerHTML = '<span></span><span class="pg"></span>';
    b.firstChild.textContent = s.title;
    b.lastChild.textContent = 'p. ' + s.page;
    b.addEventListener('click', function () { toggleToc(false); goPage(s.page - 1); });
    li.appendChild(b);
    toc.appendChild(li);
  });
  function toggleToc(open) {
    toc.hidden = !open;
    tocBtn.setAttribute('aria-expanded', String(open));
  }
  tocBtn.addEventListener('click', function (e) { e.stopPropagation(); toggleToc(toc.hidden); });
  document.addEventListener('click', function (e) {
    if (!toc.hidden && !toc.contains(e.target)) toggleToc(false);
  });

  // ---------- Controles ----------
  prev.addEventListener('click', function () { step(-1); });
  next.addEventListener('click', function () { step(1); });
  slider.addEventListener('input', function () { goPage(Number(slider.value) - 1); });

  document.addEventListener('keydown', function (e) {
    if (e.target === slider) return;
    if (e.key === 'ArrowRight' || e.key === 'PageDown') step(1);
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') step(-1);
    else if (e.key === 'Home') goPage(0);
    else if (e.key === 'End') goPage(TOTAL - 1);
    else if (e.key === 'Escape') toggleToc(false);
  });

  // clique na metade direita / esquerda da página
  book.addEventListener('click', function (e) {
    var r = book.getBoundingClientRect();
    var center = r.left + r.width / 2;
    step(e.clientX > center ? 1 : -1);
  });
  single.addEventListener('click', function (e) {
    var r = single.getBoundingClientRect();
    step(e.clientX > r.left + r.width / 2 ? 1 : -1);
  });

  // arrastar / deslizar
  var startX = null;
  stage.addEventListener('pointerdown', function (e) { startX = e.clientX; });
  stage.addEventListener('pointerup', function (e) {
    if (startX === null) return;
    var dx = e.clientX - startX;
    startX = null;
    if (Math.abs(dx) > 50) {
      step(dx < 0 ? 1 : -1);
      e.preventDefault();
    }
  });
  // evita duplo disparo (arraste seguido de clique)
  stage.addEventListener('click', function (e) {
    if (Math.abs(e.clientX - (window.__lastDownX || e.clientX)) > 50) e.stopPropagation();
  }, true);
  stage.addEventListener('pointerdown', function (e) { window.__lastDownX = e.clientX; });

  window.addEventListener('resize', layout);

  // ---------- Início ----------
  buildBook();
  var m = /^#pagina-(\d+)$/.exec(location.hash);
  if (m) {
    state.page = Math.max(0, Math.min(TOTAL - 1, Number(m[1]) - 1));
    state.spread = spreadOf(state.page);
  }
  state.isSingle = window.innerWidth >= 720; // força a primeira montagem em layout()
  layout();
})();
