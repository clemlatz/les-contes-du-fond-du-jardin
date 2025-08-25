// noinspection HttpUrlsUsage

import xml2js from 'xml2js';
import dayjs from 'dayjs';
import { marked } from 'marked';

import { getCollection } from 'astro:content';

const podcastConfig = {
  name: 'Les Contes du fond du jardin',
  description: 'Petites histoires pour oreilles grandes ouvertes',
  link: 'https://les-contes-du-fond-du-jardin.fr',
  explicit: false,
  owner: 'Clément Latzarus',
  email: 'contact@les-contes-du-fond-du-jardin.fr',
  category: 'Kids & Family',
  subcategory: 'Stories for Kids',
  language: 'fr',
  cover: 'https://les-contes-du-fond-du-jardin.fr/cover.png',
};

let episodes = await getCollection('episodes');
episodes.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

const lastBuildDate = dayjs().format('ddd, DD MMM YYYY hh:mm:ss ZZ');

// noinspection JSUnusedGlobalSymbols
export async function GET() {
  const podcast = {
    rss: {
      $: {
        version: '2.0',
        'xmlns:itunes': 'http://www.itunes.com/dtds/podcast-1.0.dtd',
        'xmlns:podcast':
          'https://github.com/Podcastindex-org/podcast-namespace/blob/main/docs/1.0.md',
        'xmlns:atom': 'http://www.w3.org/2005/Atom',
        'xmlns:content': 'http://purl.org/rss/1.0/modules/content/',
      },
      channel: [
        {
          title: podcastConfig.name,
          description: podcastConfig.description,
          link: podcastConfig.link,
          copyright: podcastConfig.copyright,
          author: podcastConfig.author,
          generator: 'Astro',
          lastBuildDate: lastBuildDate,
          language: podcastConfig.language,
          'itunes:author': podcastConfig.author,
          'itunes:image': { $: { href: podcastConfig.cover } },
          'itunes:summary': podcastConfig.description,
          'itunes:type': 'episodic',
          'itunes:explicit': podcastConfig.explicit,
          'itunes:owner': {
            'itunes:name': podcastConfig.owner,
            'itunes:email': podcastConfig.email,
          },
          'itunes:category': {
            $: {
              text: podcastConfig.category,
            },
            'itunes:category': {
              $: {
                text: podcastConfig.subcategory,
              },
            },
          },
          image: {
            link: podcastConfig.link,
            title: podcastConfig.name,
            url: podcastConfig.cover,
          },
          'atom:link': [
            {
              $: {
                href: `${podcastConfig.link}/rss.xml`,
                rel: 'self',
                type: 'application/rss+xml',
              },
            },
            {
              $: {
                href: `https://pubsubhubbub.appspot.com/`,
                rel: 'hub',
                type: 'application/rss+xml',
              },
            },
          ],
          item: episodes.map(_buildRssItem),
        },
      ],
    },
  };

  let builder = new xml2js.Builder({ cdata: true });
  let xml = builder.buildObject(podcast);

  return new Response(xml, {
    status: 200,
  });
}

function _isFullUrl(urlString) {
  try {
    return Boolean(new URL(urlString));
  } catch (e) {
    return false;
  }
}

function _buildRssItem(episode) {
  let item = {
    title: episode.data.title,
    description: marked.parse(episode.body),
    pubDate: dayjs(episode.data.pubDate).format('ddd, DD MMM YYYY hh:mm:ss ZZ'),
    link: `${podcastConfig.link}/episode/${episode.id}/`,
    guid: `${podcastConfig.link}/episode/${episode.id}/`,
    'itunes:explicit': false,
    enclosure: {
      $: {
        url: _isFullUrl(episode.data.audioUrl)
          ? episode.data.audioUrl
          : podcastConfig.link + episode.data.audioUrl,
        length: episode.data.sizeInBytes,
        type: 'audio/mpeg',
      },
    },
    'itunes:duration': episode.data.durationInSeconds,
  };
  const cover_url = episode.data.cover
    ? episode.data.cover
    : podcastConfig.cover;
  item['itunes:image'] = {
    $: {
      href: _isFullUrl(cover_url) ? cover_url : podcastConfig.link + cover_url,
    },
  };
  return item;
}
