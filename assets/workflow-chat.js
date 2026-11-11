(() => {
  const chat = document.querySelector('.workflow-chat');
  if (!chat) return;
  const observer = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    chat.classList.add('is-chat-visible');
    observer.disconnect();
  }, { threshold: .2 });
  observer.observe(chat);
})();
