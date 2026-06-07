self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  // Try to get URL from notification data, fallback to /home
  const targetUrl = event.notification.data && event.notification.data.url 
    ? event.notification.data.url 
    : '/home';

  // Focus an existing window of our PWA if one is already open,
  // otherwise open a new window at the targetUrl path.
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          // Focus the existing window and navigate to targetUrl
          client.focus();
          if ('navigate' in client) {
            return client.navigate(targetUrl);
          }
          return client;
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
