// Сохраняет оба токена
export function setTokens(accessToken, refreshToken) {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
}

// Получает accessToken
export function getToken() {
  return localStorage.getItem('accessToken');
}

export function getAccessToken() {
  return localStorage.getItem('accessToken');
}

export function getRefreshToken() {
  return localStorage.getItem('refreshToken');
}

// Удаляет оба токена
export function removeToken() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

// Декодирует JWT и возвращает { username, email, role }
export function getUserFromToken() {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      username: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  } catch {
    return null;
  }
} 