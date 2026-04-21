// next.config.js ou next.config.ts
import { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "tcgvuhoyojgdnzobmxxl.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  // outras configs...
}

export default nextConfig