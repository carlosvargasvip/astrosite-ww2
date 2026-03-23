/**
 * Script injection configuration for analytics and tracking.
 *
 * headerScripts: injected inside <head> on every page
 * footerScripts: injected before </body> on every page
 *
 * These scripts are gated behind cookie consent.
 * Replace the placeholder IDs before going live.
 */

export interface ScriptTag {
  id: string;
  /** The raw HTML <script> tag content */
  content: string;
  /** Whether this script requires cookie consent before loading */
  requiresConsent: boolean;
}

export const headerScripts: ScriptTag[] = [
  {
    id: 'gtm',
    requiresConsent: true,
    content: `<!-- Google Tag Manager — REPLACE_WITH_YOUR_GTM_ID -->
<!--
<script>
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','REPLACE_WITH_YOUR_GTM_ID');
</script>
-->`,
  },
  {
    id: 'ga4',
    requiresConsent: true,
    content: `<!-- Google Analytics 4 — REPLACE_WITH_YOUR_GA4_ID -->
<!--
<script async src="https://www.googletagmanager.com/gtag/js?id=REPLACE_WITH_YOUR_GA4_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'REPLACE_WITH_YOUR_GA4_ID');
</script>
-->`,
  },
  {
    id: 'meta-pixel',
    requiresConsent: true,
    content: `<!-- Meta Pixel — REPLACE_WITH_YOUR_PIXEL_ID -->
<!--
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', 'REPLACE_WITH_YOUR_PIXEL_ID');
fbq('track', 'PageView');
</script>
-->`,
  },
];

export const footerScripts: ScriptTag[] = [
  {
    id: 'gtm-noscript',
    requiresConsent: true,
    content: `<!-- Google Tag Manager (noscript) — REPLACE_WITH_YOUR_GTM_ID -->
<!--
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=REPLACE_WITH_YOUR_GTM_ID"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
-->`,
  },
];
