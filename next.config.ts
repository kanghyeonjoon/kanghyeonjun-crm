import type {NextConfig} from "next";
const config:NextConfig={poweredByHeader:false, async redirects(){return [{source:"/kit",destination:"https://mongpd-web-three.vercel.app/kit",permanent:false},{source:"/kit/:path+",destination:"https://mongpd-web-three.vercel.app/kit/:path+",permanent:false}]}, async rewrites(){return [
 {source:"/api/chat",destination:"https://mongpd-web-three.vercel.app/api/chat"},
 {source:"/api/payments/:path*",destination:"https://mongpd-web-three.vercel.app/api/payments/:path*"},
 {source:"/api/kit-download",destination:"https://mongpd-web-three.vercel.app/api/kit-download"}
]}, async headers(){return [{source:"/:path*",headers:[{key:"X-Content-Type-Options",value:"nosniff"},{key:"Referrer-Policy",value:"strict-origin-when-cross-origin"},{key:"X-Frame-Options",value:"DENY"}]},{source:"/workspace/:path*",headers:[{key:"X-Robots-Tag",value:"noindex, nofollow"}]}]}};
export default config;
