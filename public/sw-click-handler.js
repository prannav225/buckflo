self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  // Focus an existing window of our PWA if one is already open,
  // otherwise open a new window at the /home path.
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          // Focus the existing window and navigate to /home
          client.focus();
          if ('navigate' in client) {
            return client.navigate('/home');
          }
          return client;
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow('/home');
      }
    })
  );
});
