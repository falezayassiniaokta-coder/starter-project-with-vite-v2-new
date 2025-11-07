import routes from '../routes/routes';
import { getActiveRoute } from '../routes/url-parser';

class Application {
  #mainContent;
  #menuButton;
  #sideMenu;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#sideMenu = navigationDrawer;
    this.#menuButton = drawerButton;
    this.#mainContent = content;

    this.#initDrawerEvents();
  }

  #initDrawerEvents() {

    this.#menuButton.addEventListener('click', () => {
      this.#sideMenu.classList.toggle('open');
    });

    document.body.addEventListener('click', (e) => {
      const target = e.target;

      if (
        !this.#sideMenu.contains(target) &&
        !this.#menuButton.contains(target)
      ) {
        this.#sideMenu.classList.remove('open');
      }

      this.#sideMenu.querySelectorAll('a').forEach((anchor) => {
        if (anchor.contains(target)) {
          this.#sideMenu.classList.remove('open');
        }
      });
    });
  }

  async displayPage() {
    const activePath = getActiveRoute();
    const selectedPage = routes[activePath];

    const renderAndAttach = async () => {
      this.#mainContent.innerHTML = await selectedPage.render();
      await selectedPage.afterRender();
      
    };

    if (document.startViewTransition) {
      await document.startViewTransition(renderAndAttach).finished;
    } else {
      await renderAndAttach();
    }
  }
}

export default Application;
