const seoConfig = {
  title: 'Questbook',
  titleTemplate: '%s',
  description:
      'Some description',
  // siteUrl: 'https://www.questbook.app/',
  siteUrl: 'https://beta.questbook.app/',
  twitter: {
    handle: '@questbookapp',
    site: '@questbookapp',
    cardType: 'summary_large_image',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://beta.questbook.app/',
    title: 'Questbook',
    description:
        'Some description',
    site_name:
        'Questbook',
    images: [
      {
        url: 'https://ipfs.io/ipfs/QmQtJhGjUQyYe2j2tmka4VZ8NzJD3J9jiFSjhjgGkugwYs',
        width: 1240,
        height: 480,
        alt: 'Questbook Grant',
      },
      {
        url: 'https://ipfs.io/ipfs/QmQtJhGjUQyYe2j2tmka4VZ8NzJD3J9jiFSjhjgGkugwYs',
        width: 1012,
        height: 506,
        alt: 'Questbook Grant',
      },
    ],
  },
};

export default seoConfig;