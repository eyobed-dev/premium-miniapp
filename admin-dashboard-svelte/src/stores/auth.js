import { writable } from 'svelte/store';

export const adminToken = writable(localStorage.getItem('admin_token'));

adminToken.subscribe(value => {
  if (value) {
    localStorage.setItem('admin_token', value);
  } else {
    localStorage.removeItem('admin_token');
  }
});
