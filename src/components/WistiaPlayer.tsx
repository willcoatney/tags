'use client'

import Script from 'next/script'

export default function WistiaPlayer() {
  return (
    <>
      <Script src="https://fast.wistia.com/player.js" strategy="afterInteractive" />
      <Script src="https://fast.wistia.com/embed/z779habcfs.js" strategy="afterInteractive" />
      <style>{`
        wistia-player[media-id='z779habcfs']:not(:defined) {
          background: center / contain no-repeat url('https://fast.wistia.com/embed/medias/z779habcfs/swatch');
          display: block;
          filter: blur(5px);
          padding-top: 56.25%;
        }
      `}</style>
      {/* @ts-expect-error wistia-player is a custom web component */}
      <wistia-player media-id="z779habcfs" aspect="1.7777777777777777" />
    </>
  )
}
