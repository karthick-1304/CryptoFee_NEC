// midnightRefresher.js
export function scheduleMidnightRefresh() {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0); // Set to 00:00:00 of the next day
  
    const timeUntilMidnight = midnight.getTime() - now.getTime();
  
    setTimeout(() => {
      window.location.reload(); // Refresh the entire website
    }, timeUntilMidnight);
  }
  