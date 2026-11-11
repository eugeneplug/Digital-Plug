(() => {
  const section = document.querySelector('#directions');
  if (!section) return;
  const start = '<svg viewBox="0 0 260 240" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">';
  const illustrations = {
    development: `${start}
      <defs><linearGradient id="code-window" x1="20" y1="38" x2="248" y2="210" gradientUnits="userSpaceOnUse"><stop stop-color="#fff"/><stop offset="1" stop-color="#eff5ff"/></linearGradient><filter id="code-shadow" x="-20%" y="-20%" width="140%" height="155%"><feDropShadow dx="0" dy="9" stdDeviation="9" flood-color="#334b78" flood-opacity=".12"/></filter></defs>
      <g filter="url(#code-shadow)"><rect x="8" y="31" width="244" height="180" rx="17" fill="url(#code-window)" stroke="#c1cce0"/><path d="M9 64h242" stroke="#dae2f0"/><circle cx="24" cy="48" r="2.6" fill="#92a8cd"/><circle cx="35" cy="48" r="2.6" fill="#b5c6e1"/><circle cx="46" cy="48" r="2.6" fill="#d1dcee"/><text x="130" y="51" text-anchor="middle" fill="#7d8da8" font-size="9" font-family="Inter,Arial,sans-serif">studio.js</text><path d="m225 44-4 4 4 4m8-8 4 4-4 4" stroke="#1d5fe0" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
      <g font-family="Consolas,monospace" font-size="11" fill="#acb9ce"><text x="23" y="88">1</text><text x="23" y="111">2</text><text x="23" y="134">3</text><text x="23" y="157">4</text><text x="23" y="180">5</text></g><path d="M39 77v110" stroke="#e1e8f2"/>
      <g class="code-text" font-family="Consolas,monospace" font-size="11" xml:space="preserve"><text class="code-line" x="49" y="88" fill="#1d5fe0"/><text class="code-line" x="49" y="111" fill="#445b7c"/><text class="code-line" x="49" y="134" fill="#445b7c"/><text class="code-line" x="49" y="157" fill="#1d5fe0"/><text class="code-line" x="49" y="180" fill="#1d5fe0"/></g><rect class="code-caret" x="49" y="78" width="1.5" height="13" rx=".7" fill="#1d5fe0"/></g>
      <rect x="178" y="194" width="67" height="24" rx="12" fill="#1d5fe0"/><path class="code-check" d="m190 206 3 3 6-6" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><text x="207" y="209" font-family="Inter,Arial,sans-serif" font-size="8" fill="white">build</text>
    </svg>`,
    seo: `${start}
      <defs><linearGradient id="seo-area" x1="130" y1="110" x2="130" y2="192" gradientUnits="userSpaceOnUse"><stop stop-color="#5d9dff" stop-opacity=".22"/><stop offset="1" stop-color="#5d9dff" stop-opacity="0"/></linearGradient></defs>
      <rect x="16" y="40" width="228" height="169" rx="19" fill="#293339" stroke="#46545d"/>
      <rect x="31" y="54" width="171" height="25" rx="12.5" fill="#1e272d" stroke="#44535d"/><circle cx="45" cy="66" r="4" stroke="#8fadd0" stroke-width="1.2"/><path d="m48 69 3 3" stroke="#8fadd0" stroke-width="1.2" stroke-linecap="round"/><text x="62" y="69" font-size="9" font-family="Inter,Arial,sans-serif" fill="#a7bacd">digitalplug</text><path class="seo-search" d="M119 62v9" stroke="#78a7ff"/>
      <g stroke="#52616a" stroke-width=".6" stroke-dasharray="2 5" opacity=".6"><path d="M34 105h192M34 134h192M34 163h192M34 191h192"/></g>
      <g class="seo-bars" fill="#4781cd"><rect class="seo-bar" x="44" y="163" width="16" height="28" rx="4"/><rect class="seo-bar" x="79" y="148" width="16" height="43" rx="4"/><rect class="seo-bar" x="114" y="139" width="16" height="52" rx="4"/><rect class="seo-bar" x="149" y="121" width="16" height="70" rx="4"/><rect class="seo-bar" x="184" y="101" width="16" height="90" rx="4"/></g>
      <path class="seo-area" d="m36 170 37-14 35 5 36-28 34-17 42-23v99H36Z" fill="url(#seo-area)"/>
      <path class="seo-line" d="m36 170 37-14 35 5 36-28 34-17 42-23" pathLength="1" stroke="#91bfff" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
      <circle class="seo-endpoint" cx="220" cy="93" r="4" fill="#d4e7ff"/><circle class="seo-ping" cx="220" cy="93" r="8" stroke="#96bcff"/>
      <circle cx="221" cy="47" r="22" fill="#f4f8ff" stroke="#c1d4f3"/><path d="M211 51h5v-6h6v-6h8m-4 0h4v4" stroke="#1d5fe0" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    ai: `${start}
      <defs><linearGradient id="ai-chip" x1="86" y1="80" x2="174" y2="169" gradientUnits="userSpaceOnUse"><stop stop-color="#4685f7"/><stop offset="1" stop-color="#1249bd"/></linearGradient><filter id="ai-shadow" x="-40%" y="-40%" width="180%" height="195%"><feDropShadow dx="0" dy="10" stdDeviation="10" flood-color="#1d5fe0" flood-opacity=".22"/></filter></defs>
      <g stroke="#90addf" stroke-width="1.3"><path d="M44 52h28q15 0 15 15v34M217 59h-29q-15 0-15 15v28M42 183h31q14 0 14-15v-23M218 181h-30q-15 0-15-15v-21M130 34v47M130 168v42"/></g>
      <g class="ai-flows" stroke="#1d5fe0" stroke-width="2.2" stroke-linecap="round" stroke-dasharray="2 13"><path class="ai-flow" d="M44 52h28q15 0 15 15v34"/><path class="ai-flow" d="M217 59h-29q-15 0-15 15v28"/><path class="ai-flow" d="M42 183h31q14 0 14-15v-23"/><path class="ai-flow" d="M218 181h-30q-15 0-15-15v-21"/><path class="ai-flow" d="M130 34v47M130 168v42"/></g>
      <g stroke="#7c9ed5" fill="#f4f8ff"><circle class="ai-node" cx="34" cy="52" r="16"/><circle class="ai-node" cx="226" cy="59" r="14"/><circle class="ai-node" cx="32" cy="183" r="14"/><circle class="ai-node" cx="228" cy="181" r="17"/><circle class="ai-node" cx="130" cy="25" r="10"/><circle class="ai-node" cx="130" cy="219" r="10"/></g>
      <g stroke="#4c7fd3" stroke-width="1.5" stroke-linecap="round"><path d="M28 48h12M28 53h8M28 58h10M222 55l-4 4 4 4m8-8 4 4-4 4M28 179l8 8m-8 0 8-8M222 181h12m-6-6v12"/></g><circle cx="130" cy="25" r="2.6" fill="#1d5fe0"/><circle cx="130" cy="219" r="2.6" fill="#1d5fe0"/>
      <g stroke="#4574c7" stroke-width="2" stroke-linecap="round"><path d="M103 73v9m18-9v9m18-9v9m18-9v9M103 167v9m18-9v9m18-9v9m18-9v9M78 98h9m-9 18h9m-9 18h9m-9 18h9M173 98h9m-9 18h9m-9 18h9m-9 18h9"/></g>
      <g filter="url(#ai-shadow)"><rect x="86" y="80" width="88" height="88" rx="23" fill="url(#ai-chip)" stroke="#73a1f4"/><rect x="98" y="92" width="64" height="64" rx="15" fill="#fff" fill-opacity=".08" stroke="#fff" stroke-opacity=".3"/><text x="130" y="134" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="29" font-weight="550" letter-spacing="-1.5" fill="white">AI</text></g><path class="ai-spark" d="m156 85 2-6 2 6 6 2-6 2-2 6-2-6-6-2Z" fill="#fff"/>
    </svg>`,
    mobile: `${start}
      <defs><filter id="phone-shadow" x="-50%" y="-20%" width="200%" height="150%"><feDropShadow dx="0" dy="8" stdDeviation="8" flood-color="#253f6d" flood-opacity=".15"/></filter></defs>
      <g filter="url(#phone-shadow)"><rect x="76" y="9" width="110" height="222" rx="25" fill="#fdfefe" stroke="#344256" stroke-width="1.6"/><rect x="82" y="15" width="98" height="210" rx="20" fill="#eff4fd"/><rect x="110" y="19" width="42" height="10" rx="5" fill="#29374e"/><text x="93" y="54" font-family="Inter,Arial,sans-serif" font-size="10" font-weight="650" letter-spacing="-.5" fill="#1a2b46">Digital<tspan fill="#1d5fe0">Plug</tspan></text><rect x="93" y="62" width="44" height="3" rx="1.5" fill="#b2c4e2"/>
      <g class="mobile-page mobile-page--one"><rect x="92" y="78" width="78" height="55" rx="12" fill="#1d5fe0"/><rect x="101" y="91" width="31" height="4" rx="2" fill="white"/><rect x="101" y="101" width="22" height="3" rx="1.5" fill="#a7c7ff"/><rect x="101" y="116" width="19" height="7" rx="3.5" fill="white" fill-opacity=".25"/><g fill="white"><circle cx="149" cy="99" r="6"/><circle cx="157" cy="99" r="6"/><circle cx="149" cy="107" r="6"/><circle cx="157" cy="107" r="6"/></g><rect x="92" y="142" width="35" height="33" rx="9" fill="white"/><rect x="135" y="142" width="35" height="33" rx="9" fill="white"/><rect x="101" y="150" width="16" height="3" rx="1.5" fill="#98b9ef"/><rect x="101" y="159" width="10" height="3" rx="1.5" fill="#d0ddf2"/><circle cx="152" cy="158" r="7" fill="#dfeaff"/><path d="m149 158 2 2 4-4" stroke="#1d5fe0" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></g>
      <g class="mobile-page mobile-page--two"><rect x="92" y="78" width="78" height="97" rx="12" fill="white"/><rect x="102" y="89" width="39" height="4" rx="2" fill="#7d9bc7"/><path d="m102 129 12-11 12 5 12-16 19-5" stroke="#1d5fe0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M102 140h57" stroke="#e1e9f6"/><rect x="102" y="152" width="27" height="3" rx="1.5" fill="#b9cbe6"/><rect x="142" y="148" width="18" height="11" rx="5.5" fill="#1d5fe0"/><circle cx="154" cy="153.5" r="3.5" fill="white"/></g>
      <rect x="92" y="185" width="78" height="22" rx="11" fill="white"/><circle class="mobile-tab-one" cx="108" cy="196" r="3" fill="#1d5fe0"/><circle class="mobile-tab-two" cx="131" cy="196" r="3" fill="#bdcce4"/><circle cx="154" cy="196" r="3" fill="#bdcce4"/><circle class="mobile-tap" cx="131" cy="196" r="8" stroke="#1d5fe0" stroke-width="1"/><path d="M118 217h26" stroke="#a6b5cd" stroke-width="2.6" stroke-linecap="round"/></g>
      <g class="mobile-notification"><rect x="23" y="126" width="76" height="36" rx="11" fill="white" stroke="#cddbf0"/><circle cx="37" cy="144" r="7" fill="#e4eeff"/><path d="m34 144 2 2 4-4" stroke="#1d5fe0" stroke-width="1.3" stroke-linecap="round"/><rect x="50" y="138" width="34" height="3" rx="1.5" fill="#7593c1"/><rect x="50" y="146" width="23" height="3" rx="1.5" fill="#c1d1e8"/></g>
      <rect x="175" y="47" width="36" height="36" rx="12" fill="#1d5fe0"/><path d="M187 59h12v12h-12z" stroke="white" stroke-width="1.3"/><path d="M190 63h6m-6 4h4" stroke="white" stroke-width="1.3" stroke-linecap="round"/>
    </svg>`,
  };
  section.querySelectorAll('[data-visual]').forEach(slot => { slot.innerHTML = illustrations[slot.dataset.visual] || ''; });

  const lines = [...section.querySelectorAll('.code-line')];
  const source = ['const studio = {', "  name: 'DigitalPlug',", '  web: true,', '  ai: connect()', '};'];
  const caret = section.querySelector('.code-caret');
  const count = source.reduce((sum, line) => sum + line.length, 0);
  const typeDuration = count * 48, holdDuration = 1400, eraseDuration = count * 15;
  const cycle = typeDuration + holdDuration + eraseDuration + 260;
  let elapsed = 0, previous = 0, frame = 0, visible = false, lastCount = -1;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  function paintCode(characters) {
    if (characters === lastCount) return;
    lastCount = characters;
    let remaining = characters, row = 0, column = 0;
    lines.forEach((line, index) => {
      const length = Math.max(0, Math.min(source[index].length, remaining));
      line.textContent = source[index].slice(0, length);
      if (remaining >= 0) { row = index; column = length; }
      remaining -= source[index].length;
    });
    caret.setAttribute('x', String(49 + column * 6.62));
    caret.setAttribute('y', String(78 + row * 23));
  }
  function animate(now) {
    frame = 0;
    if (previous) elapsed += Math.min(80, now - previous);
    previous = now;
    const time = elapsed % cycle;
    const characters = time < typeDuration ? Math.floor(time / 48) : time < typeDuration + holdDuration ? count : time < typeDuration + holdDuration + eraseDuration ? count - Math.floor((time - typeDuration - holdDuration) / 15) : 0;
    paintCode(characters);
    frame = requestAnimationFrame(animate);
  }
  function updatePlayback() {
    const active = visible && !document.hidden && !motion.matches;
    section.classList.toggle('are-visuals-active', active);
    if (frame) cancelAnimationFrame(frame);
    frame = 0; previous = 0;
    if (motion.matches) paintCode(count);
    else if (active) frame = requestAnimationFrame(animate);
  }
  paintCode(count);
  new IntersectionObserver(entries => {
    visible = entries.some(entry => entry.isIntersecting);
    updatePlayback();
  }, { threshold: 0.05 }).observe(section.querySelector('.directions-grid'));
  document.addEventListener('visibilitychange', updatePlayback);
  motion.addEventListener('change', updatePlayback);
})();
