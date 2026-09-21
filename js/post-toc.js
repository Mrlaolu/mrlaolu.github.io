(() => {
  document.querySelectorAll('.column-right-shadow').forEach(shadow => shadow.remove());
  const toc = document.querySelector('.column-right #toc');
  if (!toc) return;

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'post-toc-button';
  button.textContent = '目录';
  button.setAttribute('aria-controls', 'toc');
  button.setAttribute('aria-expanded', 'false');

  const mask = document.createElement('div');
  mask.className = 'post-toc-mask';

  const close = () => {
    document.body.classList.remove('post-toc-open');
    toc.classList.remove('is-active');
    document.getElementById('toc-mask')?.classList.remove('is-active');
    button.setAttribute('aria-expanded', 'false');
  };

  button.addEventListener('click', () => {
    const open = !document.body.classList.contains('post-toc-open');
    document.body.classList.toggle('post-toc-open', open);
    button.setAttribute('aria-expanded', String(open));
  });
  mask.addEventListener('click', close);
  toc.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => setTimeout(close, 0));
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') close();
  });

  document.body.append(button, mask);
})();
