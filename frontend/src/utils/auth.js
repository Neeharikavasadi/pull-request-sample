export function getStoredUserId() {
  return sessionStorage.getItem('userId') || sessionStorage.getItem('id') || null;
}

export function saveAuthData(response) {
  const storedUserId = response.userId || response.id;
  if (storedUserId != null) {
    sessionStorage.setItem('userId', storedUserId);
    sessionStorage.setItem('id', storedUserId);
  }

  if (response.username != null) {
    sessionStorage.setItem('username', response.username);
  }
  if (response.token != null) {
    sessionStorage.setItem('token', response.token);
  }
  if (response.loyaltyPoints != null) {
    sessionStorage.setItem('loyaltyPoints', response.loyaltyPoints);
  }
  if (response.role != null) {
    sessionStorage.setItem('role', response.role);
  }
}
