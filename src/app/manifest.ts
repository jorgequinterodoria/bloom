import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Bloom — movimiento sin prisa",
    short_name: "Bloom",
    description: "Un espacio de bienestar que se adapta a tu ritmo y crece contigo.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f4ee",
    theme_color: "#f7f4ee",
    lang: "es",
    icons: [{ src: "/icons/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
