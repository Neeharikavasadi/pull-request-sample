export function getStoredUserId() {
  return localStorage.getItem('userId') || localStorage.getItem('id') || null;
}

export function saveAuthData(response) {
  const storedUserId = response.userId || response.id;
  if (storedUserId != null) {
    localStorage.setItem('userId', storedUserId);
    localStorage.setItem('id', storedUserId);
  }

  if (response.username != null) {
    localStorage.setItem('username', response.username);
  }
  if (response.token != null) {
    localStorage.setItem('token', response.token);
  }
  if (response.loyaltyPoints != null) {
    localStorage.setItem('loyaltyPoints', response.loyaltyPoints);
  }
  if (response.role != null) {
    localStorage.setItem('role', response.role);
  }
}
