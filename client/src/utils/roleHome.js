export function roleHome(role) {
  if (role === 'donor') return '/donor'
  if (role === 'admin') return '/admin'
  return '/seeker'
}
