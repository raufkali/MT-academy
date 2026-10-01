export default function manifest() {
  return {
    name: "MTacademy | PMA Mock Test Platform",
    short_name: "MTacademy",
    description:
      "Official preparation platform for PMA Long Course: Verbal Intelligence, Non-Verbal Intelligence, and Academic Mock Examinations.",
    start_url: "/",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#0F2F50",
    icons: [
      {
        src: "/logo.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
