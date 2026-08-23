const SESSION_KEY = 'revoCurrentUser';

export const getCurrentUser = () => {
  try {
    return JSON.parse(window.localStorage.getItem(SESSION_KEY)) || null;
  } catch (error) {
    window.localStorage.removeItem(SESSION_KEY);
    return null;
  }
};

export const setCurrentUser = (user) => {
  const sessionUser = {
    id: user.id,
    email: user.email,
    nickname: user.nickname,
    role: user.role,
  };

  window.localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
  return sessionUser;
};

export const clearCurrentUser = () => {
  window.localStorage.removeItem(SESSION_KEY);
};

export const isAdmin = (user = getCurrentUser()) => user?.role === 'admin';

export const syncSessionNavigation = () => {
  const currentUser = getCurrentUser();

  document.querySelectorAll('[data-session-guest]').forEach((element) => {
    element.hidden = Boolean(currentUser);
  });

  document.querySelectorAll('[data-session-user]').forEach((element) => {
    element.hidden = !currentUser;
  });

  document.querySelectorAll('[data-session-admin]').forEach((element) => {
    element.hidden = !isAdmin(currentUser);
  });

  document.querySelectorAll('[data-session-name]').forEach((element) => {
    element.textContent = currentUser?.nickname || '';
  });

  document.querySelectorAll('[data-session-logout]').forEach((button) => {
    button.addEventListener('click', () => {
      clearCurrentUser();
      window.location.href = 'auth.html';
    });
  });

  return currentUser;
};
