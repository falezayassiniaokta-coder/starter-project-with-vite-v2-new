import '../styles/styles.css';
import App from './pages/app';

(async function boot() {
  if (document.readyState === 'loading') {
    await new Promise((res) => document.addEventListener('DOMContentLoaded', res, { once: true }));
  }
  const root = document.querySelector('#app-main');
  const drawerBtn = document.querySelector('#menu-toggle');
  const navDrawer = document.querySelector('#side-navigation');

  if (!root) {
    console.error('Main content element not found');
    return;
  }

  const app = new App({
    content: root,
    drawerButton: drawerBtn,
    navigationDrawer: navDrawer,
  });

  async function showPage() {
    try {
      if (typeof app.displayPage === 'function') {
        await app.displayPage();
        return;
      }
      if (typeof app.renderPage === 'function') {
        await app.renderPage();
        return;
      }
      console.warn('No render method found on app instance');
    } catch (error) {
      console.error('Error rendering page:', error);
    }
  }
  await showPage();
  window.addEventListener('hashchange', async () => {
    try {
      await showPage();
    } catch (err) {
      console.error('Failed to render page on hashchange', err);
    }
  });
  
})();