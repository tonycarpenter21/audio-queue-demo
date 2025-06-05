import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Audio Channel Queue',
  tagline: 'Multi-channel audio queue management for browsers',
  favicon: 'img/favicon.svg',

  // Set the production url of your site here
  url: 'https://tonycarpenter21.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: process.env.NODE_ENV === 'development' ? '/' : '/audio-queue-demo/docs/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'tonycarpenter21', // Usually your GitHub org/user name.
  projectName: 'audio-queue-demo', // Usually your repo name.
  trailingSlash: false,

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/', // Serve docs at the root
          sidebarPath: './sidebars.ts',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/tonycarpenter21/audio-queue-demo/tree/main/docs/',
        },
        blog: false, // Disable blog
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Social card removed - using default
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: '🔊 Audio Channel Queue',
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Documentation',
        },
        {
          href: 'https://www.npmjs.com/package/audio-channel-queue',
          label: 'NPM Package',
          position: 'right',
        },
        {
          href: 'https://tonycarpenter21.github.io/audio-queue-demo',
          label: 'Live Demo',
          position: 'right',
        },
        {
          href: 'https://github.com/tonycarpenter21/audio-channel-queue',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            {
              label: 'Getting Started',
              to: '/getting-started/installation',
            },
            {
              label: 'API Reference',
              to: '/api-reference/queue-management',
            },
            {
              label: 'Examples',
              to: '/examples/basic-usage',
            },
          ],
        },
        {
          title: 'Resources',
          items: [
            {
              label: 'NPM Package',
              href: 'https://www.npmjs.com/package/audio-channel-queue',
            },
            {
              label: 'Live Demo',
              href: 'https://tonycarpenter21.github.io/audio-queue-demo',
            },
            {
              label: 'GitHub Repository',
              href: 'https://github.com/tonycarpenter21/audio-channel-queue',
            },
          ],
        },
        {
          title: 'Support',
          items: [
            {
              label: 'Issues',
              href: 'https://github.com/tonycarpenter21/audio-channel-queue/issues',
            },
            {
              label: 'Discussions',
              href: 'https://github.com/tonycarpenter21/audio-channel-queue/discussions',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Audio Channel Queue. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
