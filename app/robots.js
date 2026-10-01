export default function robots() {
  const baseUrl = "https://mocktestsacademy.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/about",
          "/contact",
          "/login",
          "/redeem",
          "/reset-password",
        ],
        disallow: [
          "/admin",
          "/admin/*",
          "/exam/*",
          "/dashboard",
          "/dashboard/*",
          "/profile",
          "/api/*",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
