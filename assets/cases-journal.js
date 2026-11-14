(() => {
  const journal = document.querySelector('[data-journal]');
  if (!journal) return;

  const spreads = Array.from(journal.querySelectorAll('[data-spread]'));
  const previous = journal.querySelector('[data-journal-prev]');
  const next = journal.querySelector('[data-journal-next]');
  const count = journal.querySelector('[data-journal-count]');
  const status = journal.querySelector('[data-journal-status]');
  const skip = journal.querySelector('[data-journal-skip]');
  if (!spreads.length || !previous || !next || !count || !status) return;

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const intro = journal.querySelector('video.journal-intro, .journal-intro video');
  const flip = journal.querySelector('video.journal-turn, .journal-turn video');
  let index = 0;
  let animation = null;
  let activeCase = null;

  function closeCase(restoreFocus = false) {
    if (!activeCase) return;
    const { card, detail, opener } = activeCase;
    activeCase = null;
    detail.hidden = true;
    card.classList.remove('is-detail-open');
    opener.setAttribute('aria-expanded', 'false');
    if (restoreFocus) opener.focus({ preventScroll: true });
  }

  function updateControls() {
    const locked = Boolean(animation);
    previous.disabled = locked || index === 0;
    next.disabled = locked || index === spreads.length - 1;
    spreads[index].inert = locked;
  }

  function showSpread(destination) {
    index = destination;
    spreads.forEach((spread, spreadIndex) => {
      spread.hidden = spreadIndex !== destination;
      spread.inert = false;
    });
    const format = value => String(value).padStart(2, '0');
    count.textContent = `${format(destination + 1)} / ${format(spreads.length)}`;
    status.textContent = `Разворот ${destination + 1} из ${spreads.length}`;
    updateControls();
  }

  function playScene(video, { start = 0, end = Infinity, rate, onReady, onFinish, delay = 0 }) {
    const controller = new AbortController();
    const { signal } = controller;
    let timeout;
    let startTimer;
    let frame;
    let ready = false;
    let started = false;

    function finish() {
      if (signal.aborted) return;
      controller.abort();
      clearTimeout(timeout);
      clearTimeout(startTimer);
      if (frame !== undefined) video.cancelVideoFrameCallback?.(frame);
      video.pause();
      animation = null;
      onFinish();
    }

    function inspectFrame(time) {
      if (signal.aborted || time < start - .06) return;
      if (!ready) {
        ready = true;
        onReady?.();
      }
      if (time >= end) finish();
    }

    function inspectVideoFrame(_, { mediaTime }) {
      inspectFrame(mediaTime);
      if (!signal.aborted) frame = video.requestVideoFrameCallback(inspectVideoFrame);
    }

    function startPlayback() {
      if (started || signal.aborted) return;
      started = true;
      startTimer = setTimeout(() => {
        if (signal.aborted) return;
        video.playbackRate = rate;
        if (video.requestVideoFrameCallback) frame = video.requestVideoFrameCallback(inspectVideoFrame);
        video.play().then(() => {
          if (signal.aborted) return;
          clearTimeout(timeout);
          const duration = (Math.min(video.duration, end) - start) / rate;
          timeout = setTimeout(finish, Number.isFinite(duration) ? duration * 1000 + 750 : 4400);
          if (!video.requestVideoFrameCallback) inspectFrame(video.currentTime);
        }, finish);
      }, delay);
    }

    function prepare() {
      if (signal.aborted) return;
      if (Math.abs(video.currentTime - start) > .025) video.currentTime = start;
      if (!video.seeking) startPlayback();
    }

    animation = { finish };
    updateControls();
    video.muted = true;
    video.addEventListener('ended', finish, { signal, once: true });
    video.addEventListener('error', finish, { signal, once: true });
    video.addEventListener('seeked', startPlayback, { signal, once: true });
    video.addEventListener('timeupdate', () => {
      if (started && !video.paused && (!video.requestVideoFrameCallback || video.currentTime >= end + .08)) {
        inspectFrame(video.currentTime);
      }
    }, { signal });
    timeout = setTimeout(finish, 1800);
    if (video.error) finish();
    else if (video.readyState >= 1) prepare();
    else {
      video.addEventListener('loadedmetadata', prepare, { signal, once: true });
      video.preload = 'auto';
      video.load();
    }
  }

  function turn(direction) {
    const destination = index + direction;
    if (animation || destination < 0 || destination >= spreads.length) return;
    const focused = document.activeElement;
    closeCase();

    function finishTurn() {
      showSpread(destination);
      journal.classList.remove('is-turning', 'is-backward', 'is-flip-visible');
      if (focused !== previous && focused !== next) return;
      if (document.activeElement !== focused && document.activeElement !== document.body) return;
      const available = focused.disabled ? (direction > 0 ? previous : next) : focused;
      available.focus({ preventScroll: true });
    }

    if (!flip || reducedMotion.matches) {
      finishTurn();
      return;
    }

    journal.classList.add('is-turning');
    journal.classList.toggle('is-backward', direction < 0);
    playScene(flip, {
      start: 1.12,
      end: 3.62,
      rate: 1.65,
      delay: 180,
      onReady: () => journal.classList.add('is-flip-visible'),
      onFinish: finishTurn,
    });
  }

  previous.addEventListener('click', () => turn(-1));
  next.addEventListener('click', () => turn(1));
  skip?.addEventListener('click', () => animation?.finish());
  journal.addEventListener('keydown', event => {
    if (event.key === 'Escape' && activeCase) {
      event.preventDefault();
      closeCase(activeCase.card.contains(event.target));
      return;
    }
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.target.closest('a, button, input, select, textarea, [contenteditable]') && event.target !== previous && event.target !== next) return;
    const direction = { ArrowLeft: -1, ArrowRight: 1 }[event.key];
    if (!direction) return;
    event.preventDefault();
    turn(direction);
  });
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) animation?.finish();
  });

  showSpread(0);
  journal.classList.add('is-ready');
  if (intro && !reducedMotion.matches) {
    journal.classList.add('is-opening');
    if (skip) skip.hidden = false;
    playScene(intro, {
      start: .92,
      rate: 1.6,
      onReady: () => journal.classList.add('is-intro-visible'),
      onFinish: () => {
        const wasFocused = document.activeElement === skip;
        journal.classList.remove('is-opening', 'is-intro-visible');
        if (skip) skip.hidden = true;
        updateControls();
        if (wasFocused && !next.disabled) next.focus({ preventScroll: true });
      },
    });
  }

  journal.querySelectorAll('[data-case-preview]').forEach(opener => {
    const card = opener.closest('.journal-case');
    const detail = document.getElementById(opener.getAttribute('aria-controls'));
    const close = detail?.querySelector('[data-case-close]');
    if (!card?.contains(detail) || !close) return;

    detail.hidden = true;
    opener.disabled = false;
    opener.addEventListener('click', () => {
      if (animation) return;
      const wasOpen = activeCase?.opener === opener;
      closeCase(wasOpen);
      if (wasOpen) return;

      activeCase = { card, detail, opener };
      detail.hidden = false;
      card.classList.add('is-detail-open');
      opener.setAttribute('aria-expanded', 'true');
      close.focus({ preventScroll: true });
    });
    close.addEventListener('click', () => closeCase(true));
  });

  document.addEventListener('click', event => {
    if (activeCase && !activeCase.card.contains(event.target)) closeCase();
  });
})();
