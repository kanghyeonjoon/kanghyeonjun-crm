import Script from "next/script";
import {ANALYTICS} from "@/config/site";
import MetaRouteTracker from "@/components/MetaRouteTracker";
export default function LandingTelemetry(){return <>        {ANALYTICS.ga4Id ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${ANALYTICS.ga4Id}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${ANALYTICS.ga4Id}');
              `}
            </Script>
          </>
        ) : null}

        {/* Microsoft Clarity — 히트맵·세션 녹화 (ID 없으면 미로드) */}
        {ANALYTICS.clarityId ? (
          <Script id="ms-clarity" strategy="afterInteractive">
            {`
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "${ANALYTICS.clarityId}");
            `}
          </Script>
        ) : null}

        {/* Meta 픽셀 — 기본 코드(최초 PageView 포함). 라우트 전환 PageView는
            MetaRouteTracker가, Lead는 /thanks의 MetaLeadEvent만 보냅니다 (ID 없으면 미로드) */}
        {ANALYTICS.metaPixelId ? (
          <>
            <Script id="meta-pixel" strategy="afterInteractive">
              {`
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${ANALYTICS.metaPixelId}');
                fbq('track', 'PageView');
              `}
            </Script>
            <noscript>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                height="1"
                width="1"
                style={{ display: "none" }}
                alt=""
                src={`https://www.facebook.com/tr?id=${ANALYTICS.metaPixelId}&ev=PageView&noscript=1`}
              />
            </noscript>
            <MetaRouteTracker />
          </>
        ) : null}
</>;}
