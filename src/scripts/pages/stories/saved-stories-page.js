import FavoriteStoryIdb from '../../data/idb.js';

export default class SavedStoriesPage {
  async render() {
    return `
      <div class="container">
        <h1 class="page-title">Cerita Tersimpan</h1>
        <ul id="saved-stories-list" class="stories-grid"></ul>
      </div>
    `;
  }

  async afterRender() {
    const storiesContainer = document.getElementById('saved-stories-list');
    storiesContainer.innerHTML = '<p>Memuat cerita tersimpan...</p>';
    const stories = await FavoriteStoryIdb.getAllStories();
    
    if (stories.length > 0) {
      storiesContainer.innerHTML = '';
      stories.forEach(story => {
        storiesContainer.innerHTML += this._createStoryItemTemplate(story);
      });

      storiesContainer.querySelectorAll('.btn-delete-story').forEach(button => {
        button.addEventListener('click', async (event) => {
          const storyId = event.target.dataset.id;
          await FavoriteStoryIdb.deleteStory(storyId);
          alert('Cerita berhasil dihapus!');
          this.afterRender(); // Muat ulang
        });
      });
    } else {
      storiesContainer.innerHTML = '<p>Belum ada cerita yang disimpan.</p>';
    }
  }

  _createStoryItemTemplate(story) {
    return `
      <li class="story-card">
        <a class="story-link" href="#/stories/${story.id}">
          <img src="${story.photoUrl}" alt="${story.name}" loading="lazy" />
          <div class="story-content"><h3>${story.name}</h3><p>${story.description}</p></div>
        </a>
        <button class="btn btn-danger btn-delete-story" data-id="${story.id}">Hapus</button>
      </li>
    `;
  }
}