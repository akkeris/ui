const axios = require('axios');

const words = [
  'about', 'search', 'other', 'which', 'their', 'there', 'contact', 'business', 'online', 'first', 'would', 'services', 'these', 'click', 'service', 'price', 'people', 'state', 'email', 'health', 'world', 'products', 'music', 'should', 'product', 'system', 'policy', 'number', 'please', 'support', 'message', 'after', 'software', 'video', 'where', 'rights', 'public', 'books', 'school', 'through', 'links', 'review', 'years', 'order', 'privacy', 'items', 'company', 'group', 'under', 'general', 'research', 'january', 'reviews', 'program', 'games', 'could', 'great', 'united', 'hotel', 'center', 'store', 'travel', 'comments', 'report', 'member', 'details', 'terms', 'before', 'hotels', 'right', 'because', 'local', 'those', 'using', 'results', 'office', 'national', 'design', 'posted', 'internet', 'address', 'within', 'states', 'phone', 'shipping', 'reserved', 'subject', 'between', 'forum', 'family', 'based', 'black', 'check', 'special', 'prices', 'website', 'index', 'being', 'women', 'today', 'south', 'project', 'pages', 'version', 'section', 'found', 'sports', 'house', 'related', 'security', 'county', 'american', 'photo', 'members', 'power', 'while', 'network', 'computer', 'systems', 'three', 'total', 'place', 'download', 'without', 'access', 'think', 'north', 'current', 'posts', 'media', 'control', 'water', 'history', 'pictures', 'personal', 'since', 'guide', 'board', 'location', 'change', 'white', 'small', 'rating', 'children', 'during', 'return', 'students', 'shopping', 'account', 'times', 'sites', 'level', 'digital', 'profile', 'previous', 'events', 'hours', 'image', 'title', 'another', 'shall', 'property', 'class', 'still', 'money', 'quality', 'every', 'listing', 'content', 'country', 'private', 'little', 'visit', 'tools', 'reply', 'customer', 'december', 'compare', 'movies', 'include', 'college', 'value', 'article', 'provide', 'source', 'author', 'press', 'learn', 'around', 'print', 'course', 'canada', 'process', 'stock', 'training', 'credit', 'point', 'science', 'advanced', 'sales', 'english', 'estate', 'select', 'windows', 'photos', 'thread', 'category', 'large', 'gallery', 'table', 'register', 'however', 'october', 'november', 'market', 'library', 'really', 'action', 'start', 'series', 'model', 'features', 'industry', 'human', 'provided', 'required', 'second', 'movie', 'forums', 'march', 'better', 'yahoo', 'going', 'medical', 'friend', 'server', 'study', 'staff', 'articles', 'feedback', 'again', 'looking', 'issues', 'april', 'never', 'users', 'complete', 'street', 'topic', 'comment', 'things', 'working', 'against', 'standard', 'person', 'below', 'mobile', 'party', 'payment', 'login', 'student', 'programs', 'offers', 'legal', 'above', 'recent', 'stores', 'problem', 'memory', 'social', 'august', 'quote', 'language', 'story', 'options', 'rates', 'create', 'young', 'america', 'field', 'paper', 'single', 'example', 'girls', 'password', 'latest', 'question', 'changes', 'night', 'texas', 'poker', 'status', 'browse', 'issue', 'range', 'building', 'seller', 'court', 'february', 'always', 'result', 'audio', 'light', 'write', 'offer', 'groups', 'given', 'files', 'event', 'release', 'analysis', 'request', 'china', 'making', 'picture', 'needs', 'possible', 'might', 'month', 'major', 'areas', 'future', 'space', 'cards', 'problems', 'london', 'meeting', 'become', 'interest', 'child', 'enter', 'share', 'similar', 'garden', 'schools', 'million', 'added', 'listed', 'learning', 'energy', 'delivery', 'popular', 'stories', 'journal',
];

function randomString() {
  return `${words[Math.floor(Math.random() * words.length)]}${(Math.floor(Math.random() * 898) + 100).toString()}`;
}

async function getAccessToken() {
  try {
    const data = { note: 'Token created for UI testing' };
    const config = { auth: { username: process.env.BOT_USER, password: process.env.BOT_PASS } };
    const { data: { token } } = await axios.post(`${process.env.OAUTH_ENDPOINT}/authorizations`, data, config);
    return token;
  } catch (err) {
    console.error(err);
    return null;
  }
}

async function verifyAppDeletion(appNames) {
  if (!process.env.OAUTH_ENDPOINT && !process.env.AKKERIS_API) {
    console.log('\tProvide both OAUTH_ENDPOINT and AKKERIS_API environment variables to perform post-test cleanup verification.');
    return;
  }

  const token = await getAccessToken();
  if (!token) {
    console.log(`\tCould not get access token. Manual verification of deleted apps may be needed: ${appNames.join(', ')}`);
    return;
  }

  const config = { headers: { Authorization: `Bearer ${token}` } };

  appNames.forEach(async (appName) => {
    try {
      await axios.delete(`${process.env.AKKERIS_API}/apps/${appName}`, config);
    } catch (err) {
      if (err.response.status !== 404) {
        console.error(`\tError deleting ${appName}: `);
        console.log(`\t${err.response.data}`);
      }
    }
  });
}

module.exports = {
  randomString,
  verifyAppDeletion,
};
