export const sendDeviceInfo = () => {
  const deviceInfo = {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    screenResolution: {
      width: screen.width,
      height: screen.height,
    },
  };

  fetch("http://localhost:5000/api/admin/device-info", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(deviceInfo),
  }).catch((err) => console.error("Failed to send device info:", err));
};

export const sendLocationInfo = () => {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;

      fetch("http://localhost:5000/api/admin/location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitude,
          longitude,
        }),
      }).catch((err) => console.error("Failed to send location info:", err));
    },
    (error) => {
      console.error("Permission denied or location unavailable:", error);
    }
  );
};
