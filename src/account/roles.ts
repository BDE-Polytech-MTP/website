export enum Role {
  READ_USERS = 'READ_USERS',
  WRITE_USERS = 'WRITE_USERS',
  WRITE_EVENTS = 'WRITE_EVENTS',
}

export function allRoles() {
  return [Role.READ_USERS, Role.WRITE_USERS, Role.WRITE_EVENTS];
}
