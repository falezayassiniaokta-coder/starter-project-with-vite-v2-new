// router.js (refactor)
import HomePageMVP from '../pages/home/home-page-mvp';
import SignInPage from '../pages/auth/login-page';
import SignUpPage from '../pages/auth/register-page';
import StoryDetail from '../pages/stories/detail-page';
import StoryCreate from '../pages/stories/add-story-page';
import SavedStoriesPage from '../pages/stories/saved-stories-page.js';

/**
 * Buat instance halaman di awal tapi gunakan nama variabel berbeda.
 * Mapping keys harus tetap menyesuaikan format yang digunakan oleh url-parser:
 * - '/' untuk home
 * - '/stories' untuk daftar
 * - '/stories/:id' untuk detail
 * - '/add-story' untuk form tambah
 */
const pageInstances = {
  home: new HomePageMVP(),
  login: new SignInPage(),
  register: new SignUpPage(),
  storyDetail: new StoryDetail(),
  addStory: new StoryCreate(),
  savedStories: new SavedStoriesPage(),
};

/**
 * Public route table keyed by normalized path (result dari getActiveRoute()).
 * Urutan di sini tidak penting, tapi shape harus cocok dengan yang dipakai App.
 */
const routes = {
  '/': pageInstances.home,
  '/login': pageInstances.login,
  '/register': pageInstances.register,
  '/stories': pageInstances.home, // reuse home view for '/stories' listing
  '/stories/:id': pageInstances.storyDetail,
  '/add-story': pageInstances.addStory,
  '/saved': pageInstances.savedStories,
};

export default routes;


