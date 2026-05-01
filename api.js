/* api.js — No Study browser API client (vanilla JS, loads before Babel) */
(function () {
  var TOKEN_KEY = 'nostudy_token';
  var USER_KEY  = 'nostudy_user';

  function getToken() { return localStorage.getItem(TOKEN_KEY); }
  function setToken(t) { localStorage.setItem(TOKEN_KEY, t); }
  function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
  function getUser() {
    try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null'); } catch { return null; }
  }
  function setUser(u) { localStorage.setItem(USER_KEY, JSON.stringify(u)); }

  async function apiFetch(path, opts) {
    opts = opts || {};
    // Priority: explicit override → local dev static server → same-origin (backend serves frontend)
    var isStaticServer = window.location.port && window.location.port !== '3000';
    var baseUrl = window.NOSTUDY_API_BASE || (isStaticServer ? 'http://localhost:3000' : '');
    var fullPath = path.startsWith('http') ? path : (baseUrl + path);

    var token   = getToken();
    var headers = Object.assign({ 'Content-Type': 'application/json' }, opts.headers || {});
    if (token) headers['Authorization'] = 'Bearer ' + token;
    try {
      var res  = await fetch(fullPath, Object.assign({}, opts, { headers: headers }));
      
      var contentType = res.headers.get("content-type");
      var data;
      var isJson = contentType && contentType.indexOf("application/json") !== -1;
      
      if (isJson) {
        data = await res.json();
      } else {
        var text = await res.text();
        if (!res.ok) throw new Error(text || 'Request failed (' + res.status + ')');
        return text; // Return as text if ok but not JSON
      }

      if (!res.ok) throw new Error(data.error || 'Request failed (' + res.status + ')');
      return data;
    } catch (err) {
      if (err instanceof TypeError && err.message === 'Failed to fetch')
        throw new Error('Unable to connect to server. Please try again or contact support.');
      throw err;
    }
  }

  function post(path, body) {
    return apiFetch(path, { method: 'POST', body: JSON.stringify(body) });
  }
  function put(path, body) {
    return apiFetch(path, { method: 'PUT', body: JSON.stringify(body || {}) });
  }
  function del(path) {
    return apiFetch(path, { method: 'DELETE' });
  }

  window.nsApi = {
    /* token helpers */
    getToken:  getToken,
    setToken:  setToken,
    clearToken: clearToken,
    getUser:   getUser,
    setUser:   setUser,

    /* auth */
    signup: function (email, password) {
      return window.firebaseAuth.createUserWithEmailAndPassword(email, password);
    },
    login: async function (email, password) {
      const userCredential = await window.firebaseAuth.signInWithEmailAndPassword(email, password);
      const idToken = await userCredential.user.getIdToken();
      return post('/api/auth/firebase-login', { idToken: idToken });
    },
    me: function () { return apiFetch('/api/auth/me'); },

    /* payments */
    submitPayment: function (data) { return post('/api/payments', data); },

    /* student */
    dashboard:   function ()   { return apiFetch('/api/dashboard'); },
    classDetail: function (id) { return apiFetch('/api/classes/' + id); },
    leaderboard: function ()   { return apiFetch('/api/leaderboard'); },

    /* public */
    instructors:  function () { return apiFetch('/api/instructors'); },
    testimonials: function () { return apiFetch('/api/testimonials'); },

    /* admin */
    admin: {
      stats:          function ()           { return apiFetch('/api/admin/stats'); },
      activity:       function ()           { return apiFetch('/api/admin/activity'); },
      users:          function (q)          { return apiFetch('/api/admin/users' + (q ? '?q=' + encodeURIComponent(q) : '')); },
      payments:       function ()           { return apiFetch('/api/admin/payments'); },
      approvePayment: function (id)         { return put('/api/admin/payments/' + id + '/approve'); },
      rejectPayment:  function (id, reason) { return put('/api/admin/payments/' + id + '/reject', { reason: reason }); },
      updateSub:      function (id, action, days) { return put('/api/admin/subscriptions/' + id, { action: action, days: days }); },
      batches:        function ()           { return apiFetch('/api/admin/batches'); },
      createBatch:    function (data)       { return post('/api/admin/batches', data); },
      courses:        function ()            { return apiFetch('/api/admin/courses'); },
      createCourse:   function (data)        { return post('/api/admin/courses', data); },
      updateCourse:   function (id, data)    { return put('/api/admin/courses/' + id, data); },
      materials:      function (batchId)     { return apiFetch('/api/admin/materials?batch_id=' + (batchId || 1)); },
      updateClass:    function (id, data)    { return put('/api/admin/classes/' + id, data); },
      createClass:    function (data)        { return post('/api/admin/classes', data); },
      classMaterials: function (classId)     { return apiFetch('/api/admin/classes/' + classId + '/materials'); },
      addMaterial:    function (classId, d)  { return post('/api/admin/classes/' + classId + '/materials', d); },
      deleteMaterial: function (id)          { return del('/api/admin/materials/' + id); },
      updateBatch:        function (id, data)    { return put('/api/admin/batches/' + id, data); },
      instructors:        function ()            { return apiFetch('/api/admin/instructors'); },
      createInstructor:   function (data)        { return post('/api/admin/instructors', data); },
      updateInstructor:   function (id, data)    { return put('/api/admin/instructors/' + id, data); },
      deleteInstructor:     function (id)          { return del('/api/admin/instructors/' + id); },
      testimonials:         function ()            { return apiFetch('/api/admin/testimonials'); },
      createTestimonial:    function (data)        { return post('/api/admin/testimonials', data); },
      updateTestimonial:    function (id, data)    { return put('/api/admin/testimonials/' + id, data); },
      deleteTestimonial:    function (id)          { return del('/api/admin/testimonials/' + id); },
      deleteCourse:         function (id)          { return del('/api/admin/courses/' + id); },
      deleteClass:          function (id)          { return del('/api/admin/classes/' + id); },
      deleteBatch:          function (id)          { return del('/api/admin/batches/' + id); },
    },
  };
})();
