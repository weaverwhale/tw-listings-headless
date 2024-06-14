import { ThemeProvider } from '../../ThemeProvider';
import { StoresNav } from './StoresNav';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof StoresNav> = {
  component: StoresNav,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div style={{ height: '300px' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  argTypes: {
    // id: { control: 'text' },
    // 'data-testid': { control: 'text' },
  },
  parameters: {
    docs: {
      description: {
        component: `
### StoresNav component

This description is written using markdown.  
Go ahead, poke around and see what you can do.
You have the power to change the world.
`,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof StoresNav>;

export const Basic: Story = {
  args: {
    // children: 'StoresNav',
    shops: [
      {
        shopId: 'madisonbraids.myshopify.com',
        shopImage: 'https://api.triplewhale.com/api/v2/media/shop-icon/madisonbraids.myshopify.com',
        activeAppVersion: '2.0',
        features: ['CONF_NEW_DESIGN'],
        ui: {
          inAppContextBanners: {
            summary: false,
            attribution: false,
          },
          attribution: {
            selectedColumns: [
              'showInGraph',
              'status',
              'name',
              'pixelConversionValue',
              'spend',
              'pixelCogs',
              'pixelProfit',
              'adsInventory',
            ],
          },
          summary: {
            expenses: {
              index: 13,
            },
            kno: {
              index: 16,
            },
            snapchat: {
              index: 9,
            },
            'c44fd938-10f3-462f-8f9f-808b241839fa': {
              isForceHideCustomMetricAfterMargeWithStats: false,
              index: 0,
              hidden: true,
            },
            customMetrics: {
              index: 18,
            },
            customersLifetimeValue: {
              index: 7,
            },
            inventory: {
              index: 14,
            },
            financePinned: {
              index: 23,
            },
            twitter: {
              index: 10,
            },
            'bf62fefb-c2fa-4b31-b99d-84e12347ba0e': {
              mode: 'tile',
              index: 1,
            },
            pinned: {
              tiles: ['netSales', 'blendedAds', 'roas'],
              index: 3,
              mode: 'tile',
            },
            'amazon-sales': {
              index: 20,
            },
            enquirelabs: {
              index: 17,
            },
            'amazon-ads': {
              index: 21,
            },
            tiktok: {
              index: 11,
            },
            pinterest: {
              index: 15,
            },
            benchmarks: {
              mode: 'tile',
            },
            facebookAds: {
              index: 6,
            },
            GOOGLE_ANALYTICS: {
              index: 8,
            },
            store: {
              mode: 'tile',
              index: 4,
            },
            influencers: {
              index: 19,
            },
            'amazon-stats': {
              index: 22,
            },
            '2a6c849f-dda9-4282-bbdc-d4d78146a11c': {
              index: 0,
            },
            klaviyo: {
              index: 12,
            },
            amazon: {
              hidden: false,
            },
            salesBySegment: {
              index: 17,
            },
            gorgias: {
              index: 11,
            },
            tripleStats: {
              mode: 'tile',
              index: 2,
            },
            'fa44c05e-2e6f-4a06-86cf-f4cd086c26a9': {
              index: 27,
            },
            '7dd5f96c-d43c-4aeb-a9b4-9ee846140d81': {
              index: 24,
            },
            GOOGLE_ADS: {
              index: 8,
              isForceHideCustomMetricAfterMargeWithStats: false,
              hidden: false,
            },
            pixel: {
              index: 5,
            },
          },
          useNewDesign: true,
          gridDesktopColumns: 3,
          summaryFullWidth: false,
          gridDesktop: false,
        },
        lastRoutesPerVersion: {
          '3.0': '/dashboards/pkSdHUeSMgodrvJl4A4C',
          '2.0': '/attribution/all/all',
        },
        timezone: 'America/New_York',
        roles: ['admin'],
        accessRoles: ['expenses'],
      },
      {
        shopId: 'wax-london.myshopify.com',
        shopImage: 'https://api.triplewhale.com/api/v2/media/shop-icon/wax-london.myshopify.com',
        features: [],
        ui: {
          gridDesktop: false,
          summaryFullWidth: false,
          summary: {
            pinned: {
              tiles: ['netSales', 'blendedAds', 'roas'],
            },
          },
        },
        roles: ['admin'],
        notificationCount: 6,
      },
      {
        shopId: '1p-ecomm.myshopify.com',
        shopImage: 'https://api.triplewhale.com/api/v2/media/shop-icon/1p-ecomm.myshopify.com',
        features: ['CONF_PII_FIRST_PHORM'],
        timezone: 'America/Chicago',
        ui: {
          summary: {
            pinned: {
              tiles: ['netSales', 'blendedAds', 'roas'],
            },
          },
          attribution: {
            selectedColumns: [
              'showInGraph',
              'status',
              'name',
              'spend',
              'pixelRoas',
              'pixelPurchases',
              'pixelNcPurchases',
              'pixelConversionValue',
              'pixelNcConversionValue',
              'pixelNcRoas',
              'pixelCpa',
              'pixelNcCpa',
              'pixelAov',
              'pixelProfit',
              'overlap',
              'pixelVisitors',
              'pixelUniqueVisitors',
              'pixelNewVisitors',
              'pixelEmailSignup',
              'pixelUniqueAtc',
              'pixelConversionRate',
              'pixelBounceRate',
              'adsInventory',
            ],
          },
        },
        roles: ['admin'],
        accessRoles: ['expenses'],
      },
      {
        shopId: '0a7868-3.myshopify.com',
        shopImage: 'https://api.triplewhale.com/api/v2/media/shop-icon/0a7868-3.myshopify.com',
        ui: {
          summary: {
            pinned: {
              tiles: ['netSales', 'blendedAds', 'roas'],
            },
          },
        },
        roles: ['admin'],
      },
      {
        shopId: '172350.myshopify.com',
        shopImage: 'https://api.triplewhale.com/api/v2/media/shop-icon/172350.myshopify.com',
        ui: {
          attribution: {
            selectedColumns: [
              'showInGraph',
              'status',
              'name',
              'spend',
              'pixelRoas',
              'pixelPurchases',
              'pixelNcPurchases',
              'pixelConversionValue',
              'pixelNcConversionValue',
              'pixelNcRoas',
              'pixelCpa',
              'pixelNcCpa',
              'pixelAov',
              'pixelProfit',
              'overlap',
              'pixelVisitors',
              'pixelUniqueVisitors',
              'pixelNewVisitors',
              'pixelEmailSignup',
              'pixelUniqueAtc',
              'pixelConversionRate',
              'pixelBounceRate',
              'adsInventory',
            ],
          },
        },
        notificationCount: 6,
      },
      {
        shopId: 'rocketsofawesome.myshopify.com',
        shopImage:
          'https://api.triplewhale.com/api/v2/media/shop-icon/rocketsofawesome.myshopify.com',
        accessRoles: [],
        roles: ['admin'],
        ui: {
          attribution: {
            selectedColumns: [
              'showInGraph',
              'status',
              'name',
              'spend',
              'pixelNewVisitors',
              'pixelCostPerNewVisitor',
              'pixelNewVisitorPerc',
              'pixelNcPurchases',
              'pixelNcConversionValue',
              'pixelNcRoas',
              'pixelNcAov',
              'pixelNcPurchasesPerc',
              'pixelNcConversionRate',
            ],
          },
          summary: {
            customMetrics: {
              tiles: [
                'totalNetProfit',
                'roas',
                'mer',
                'totalNetMargin',
                'blendedAds',
                'newCustomersCpa',
                'newCustomersRoas',
                'a6YOmUc1woIeVP8cE7rr',
                'RVF6xnqqFrUJc38biCE2',
                'a0smKXrYTrWfLmNLlQOi',
                'RenjUE2lIA2qXXZDhhfL',
                'MnDKhaC5FOfLZS97PDh1',
                'U8SEoQbxOeW0C8olyIek',
                'fF1w3lC8XaYMntPmKRkY',
                '8J6Fz53mDgekNijCL1ub',
                'P08YQ9iOaIny8kQuTmOf',
                'lgye4HEDYLWBRvWihrc1',
                'otBPXfQmvygHIUxCfoz8',
                '4jIHeoU3hQAHAI6i6ud7',
                'imG9Cq6gIKONI1DgvIYV',
                '93K498G4DMzar14cpKvz',
              ],
            },
            pinned: {
              tiles: ['netSales', 'blendedAds', 'roas'],
            },
          },
          inAppContextBanners: {
            summary: false,
          },
        },
      },
      {
        shopId: '12256b.myshopify.com',
        shopImage: 'https://api.triplewhale.com/api/v2/media/shop-icon/12256b.myshopify.com',
        roles: ['admin'],
        ui: {
          summary: {
            pinned: {
              tiles: ['netSales', 'blendedAds', 'roas'],
            },
          },
        },
      },
      {
        shopId: '3003232.myshopify.com',
        shopImage: 'https://api.triplewhale.com/api/v2/media/shop-icon/3003232.myshopify.com',
        ui: {
          summary: {
            pinned: {
              tiles: ['netSales', 'blendedAds', 'roas'],
            },
          },
        },
        roles: ['admin'],
      },
      {
        shopId: '3003233.myshopify.com',
        shopImage: 'https://api.triplewhale.com/api/v2/media/shop-icon/3003233.myshopify.com',
        roles: ['admin'],
        ui: {
          summary: {
            pinned: {
              tiles: ['netSales', 'blendedAds', 'roas'],
            },
          },
        },
      },
      {
        shopId: '300323.myshopify.com',
        shopImage: 'https://api.triplewhale.com/api/v2/media/shop-icon/300323.myshopify.com',
        ui: {
          summary: {
            pinned: {
              tiles: ['netSales', 'blendedAds', 'roas'],
            },
          },
        },
        roles: ['admin'],
      },
      {
        shopId: '30032334.myshopify.com',
        shopImage: 'https://api.triplewhale.com/api/v2/media/shop-icon/30032334.myshopify.com',
        roles: ['admin'],
        ui: {
          summary: {
            pinned: {
              tiles: ['netSales', 'blendedAds', 'roas'],
            },
          },
        },
      },
      {
        shopId: '3003237.myshopify.com',
        shopImage: 'https://api.triplewhale.com/api/v2/media/shop-icon/3003237.myshopify.com',
        ui: {
          summary: {
            pinned: {
              tiles: ['netSales', 'blendedAds', 'roas'],
            },
          },
        },
        roles: ['admin'],
      },
      {
        shopId: '4356786543567.myshopify.com',
        shopImage: 'https://api.triplewhale.com/api/v2/media/shop-icon/4356786543567.myshopify.com',
        accessRoles: [],
        ui: {
          useNewDesign: true,
          summary: {
            pinned: {
              tiles: ['netSales', 'blendedAds', 'roas'],
            },
          },
        },
        invitationId: '6CVc88cTPDwUIHEfezNd',
        roles: ['admin'],
        inviterId: 'hRam2Dmbr7asaxBvReSAXGEhaMb2',
        invitedAt: {
          seconds: 1675862296,
          nanoseconds: 674000000,
        },
      },
      {
        shopId: '51105d.myshopify.com',
        shopImage: 'https://api.triplewhale.com/api/v2/media/shop-icon/51105d.myshopify.com',
        ui: {
          summary: {
            pinned: {
              tiles: ['netSales', 'blendedAds', 'roas'],
            },
          },
        },
        roles: ['admin'],
      },
      {
        shopId: '7f189d.myshopify.com',
        shopImage: 'https://api.triplewhale.com/api/v2/media/shop-icon/7f189d.myshopify.com',
        accessRoles: [],
        ui: {
          summary: {
            pinned: {
              tiles: ['netSales', 'blendedAds', 'roas'],
            },
          },
        },
        roles: ['admin'],
      },
      {
        shopId: '9edb83.myshopify.com',
        shopImage: 'https://api.triplewhale.com/api/v2/media/shop-icon/9edb83.myshopify.com',
        ui: {
          useNewDesign: true,
          summary: {
            pinned: {
              tiles: ['netSales', 'blendedAds', 'roas'],
            },
          },
        },
        invitationId: '6CVc88cTPDwUIHEfezNd',
        invitedAt: {
          seconds: 1675862296,
          nanoseconds: 674000000,
        },
        roles: ['admin'],
        accessRoles: [],
        inviterId: 'hRam2Dmbr7asaxBvReSAXGEhaMb2',
      },
      {
        shopId: 'batsheva-090909090990.myshopify.com',
        shopImage:
          'https://api.triplewhale.com/api/v2/media/shop-icon/batsheva-090909090990.myshopify.com',
        accessRoles: [],
        roles: ['admin'],
        inviterId: 'hRam2Dmbr7asaxBvReSAXGEhaMb2',
        invitationId: '6CVc88cTPDwUIHEfezNd',
        invitedAt: {
          seconds: 1675862296,
          nanoseconds: 674000000,
        },
        ui: {
          useNewDesign: true,
          summary: {
            pinned: {
              tiles: ['netSales', 'blendedAds', 'roas'],
            },
          },
        },
      },
      {
        shopId: 'batsheva-tesghfdhgdf.myshopify.com',
        shopImage:
          'https://api.triplewhale.com/api/v2/media/shop-icon/batsheva-tesghfdhgdf.myshopify.com',
        ui: {
          summary: {
            pinned: {
              tiles: ['netSales', 'blendedAds', 'roas'],
            },
          },
        },
        roles: ['admin'],
      },
      {
        shopId: 'batsheva-testfreewilly.myshopify.com',
        shopImage:
          'https://api.triplewhale.com/api/v2/media/shop-icon/batsheva-testfreewilly.myshopify.com',
        ui: {
          summary: {
            pinned: {
              tiles: ['netSales', 'blendedAds', 'roas'],
            },
          },
        },
        roles: ['admin'],
      },
      {
        shopId: 'batsheva-testinagain.myshopify.com',
        shopImage:
          'https://api.triplewhale.com/api/v2/media/shop-icon/batsheva-testinagain.myshopify.com',
        invitationId: '6CVc88cTPDwUIHEfezNd',
        inviterId: 'hRam2Dmbr7asaxBvReSAXGEhaMb2',
        ui: {
          useNewDesign: true,
          summary: {
            pinned: {
              tiles: ['netSales', 'blendedAds', 'roas'],
            },
          },
        },
        invitedAt: {
          seconds: 1675862296,
          nanoseconds: 674000000,
        },
        accessRoles: [],
        roles: ['admin'],
      },
      {
        shopId: 'batsheva-testlink.myshopify.com',
        shopImage:
          'https://api.triplewhale.com/api/v2/media/shop-icon/batsheva-testlink.myshopify.com',
        ui: {
          summary: {
            pinned: {
              tiles: ['netSales', 'blendedAds', 'roas'],
            },
          },
        },
        roles: ['admin'],
      },
      {
        shopId: 'batshevatest.myshopify.com',
        shopImage: 'https://api.triplewhale.com/api/v2/media/shop-icon/batshevatest.myshopify.com',
        invitedAt: {
          seconds: 1675862296,
          nanoseconds: 674000000,
        },
        accessRoles: [],
        roles: ['admin'],
        ui: {
          useNewDesign: true,
          summary: {
            pinned: {
              tiles: ['netSales', 'blendedAds', 'roas'],
            },
          },
        },
        invitationId: '6CVc88cTPDwUIHEfezNd',
        inviterId: 'hRam2Dmbr7asaxBvReSAXGEhaMb2',
      },
      {
        shopId: 'bylashbabe.myshopify.com',
        shopImage: 'https://api.triplewhale.com/api/v2/media/shop-icon/bylashbabe.myshopify.com',
        roles: ['admin'],
        accessRoles: [],
        ui: {
          inAppContextBanners: {
            attribution: false,
          },
          summary: {
            pinned: {
              tiles: ['netSales', 'blendedAds', 'roas'],
            },
          },
          attribution: {
            selectedColumns: [
              'showInGraph',
              'status',
              'name',
              'spend',
              'pixelPurchases',
              'pixelNcPurchases',
              'pixelNcPurchasesPerc',
              'purchases',
            ],
          },
        },
      },
      {
        shopId: 'chamberlaincoffee.myshopify.com',
        shopImage:
          'https://api.triplewhale.com/api/v2/media/shop-icon/chamberlaincoffee.myshopify.com',
        ui: {
          summary: {
            pinned: {
              tiles: ['netSales', 'blendedAds', 'roas'],
            },
            customMetrics: {
              tiles: [
                'totalNetProfit',
                'roas',
                'mer',
                'totalNetMargin',
                'blendedAds',
                'newCustomersCpa',
                'newCustomersRoas',
                'blendedSales',
                'SCWPhJ3bUkoeDN3Utnni',
                'HEsnedsx7sQmTTCuf4nM',
                '31c8tmjvNORpYZAythCb',
                'NGh5a6hkmnkWX1Qlf7EP',
                'rQB8tj4SrLcKq9flQp07',
                'jyWoPWdQOsb4lLBvYEeN',
                'GAtVDpklmwf1zTPtEFQk',
                'hHdv1P6vlbjWgJJfl3rj',
                'zrIhqZkvzQJOHYupQ6qG',
              ],
            },
          },
        },
        notificationCount: 3,
      },
      {
        shopId: 'chayastern-free-willy-15-02-triplewhale.myshopify.com',
        shopImage:
          'https://api.triplewhale.com/api/v2/media/shop-icon/chayastern-free-willy-15-02-triplewhale.myshopify.com',
        accessRoles: [],
        ui: {
          summary: {
            pinned: {
              tiles: ['netSales', 'blendedAds', 'roas'],
            },
          },
        },
        roles: ['admin'],
      },
      {
        shopId: 'chezijob2-cupon1.myshopify.com',
        shopImage:
          'https://api.triplewhale.com/api/v2/media/shop-icon/chezijob2-cupon1.myshopify.com',
        ui: {
          summary: {
            pinned: {
              tiles: ['netSales', 'blendedAds', 'roas'],
            },
          },
        },
        roles: ['admin'],
        accessRoles: [],
      },
      {
        shopId: 'e03909-2.myshopify.com',
        shopImage: 'https://api.triplewhale.com/api/v2/media/shop-icon/e03909-2.myshopify.com',
        ui: {
          summary: {
            pinned: {
              tiles: ['netSales', 'blendedAds', 'roas'],
            },
          },
        },
        roles: ['admin'],
      },
      {
        shopId: 'f16f47-4.myshopify.com',
        shopImage: 'https://api.triplewhale.com/api/v2/media/shop-icon/f16f47-4.myshopify.com',
        ui: {
          summary: {
            pinned: {
              tiles: ['netSales', 'blendedAds', 'roas'],
            },
          },
        },
        roles: ['admin'],
      },
      {
        shopId: 'gummyhairdev.myshopify.com',
        shopImage: 'https://api.triplewhale.com/api/v2/media/shop-icon/gummyhairdev.myshopify.com',
        ui: {
          attribution: {
            selectedColumns: [
              'showInGraph',
              'status',
              'name',
              'spend',
              'pixelRoas',
              'pixelPurchases',
              'pixelNcPurchases',
              'pixelConversionValue',
              'pixelNcConversionValue',
              'pixelNcRoas',
              'pixelCpa',
              'pixelNcCpa',
              'pixelAov',
              'pixelProfit',
              'overlap',
              'pixelVisitors',
              'pixelUniqueVisitors',
              'pixelNewVisitors',
              'pixelEmailSignup',
              'pixelUniqueAtc',
              'pixelConversionRate',
              'pixelBounceRate',
              'adsInventory',
            ],
          },
        },
        notificationCount: 6,
      },
      {
        shopId: 'letterfest.myshopify.com',
        shopImage: 'https://api.triplewhale.com/api/v2/media/shop-icon/letterfest.myshopify.com',
        roles: ['admin'],
        accessRoles: [],
        ui: {
          inAppContextBanners: {
            summary: false,
          },
        },
        notificationCount: 6,
      },
      {
        shopId: 'lonza-shoes.myshopify.com',
        shopImage: 'https://api.triplewhale.com/api/v2/media/shop-icon/lonza-shoes.myshopify.com',
        ui: {
          attribution: {
            selectedColumns: [
              'showInGraph',
              'status',
              'name',
              'spend',
              'pixelRoas',
              'pixelPurchases',
              'pixelNcPurchases',
              'pixelConversionValue',
              'pixelNcConversionValue',
              'pixelNcRoas',
              'pixelCpa',
              'pixelNcCpa',
              'pixelAov',
              'pixelProfit',
              'overlap',
              'pixelVisitors',
              'pixelUniqueVisitors',
              'pixelNewVisitors',
              'pixelEmailSignup',
              'pixelUniqueAtc',
              'pixelConversionRate',
              'pixelBounceRate',
              'adsInventory',
            ],
          },
        },
        notificationCount: 6,
      },
      {
        shopId: 'new-pricing-test.myshopify.com',
        shopImage:
          'https://api.triplewhale.com/api/v2/media/shop-icon/new-pricing-test.myshopify.com',
        roles: ['admin'],
        ui: {
          summary: {
            pinned: {
              tiles: ['netSales', 'blendedAds', 'roas'],
            },
          },
        },
        accessRoles: [],
      },
      {
        shopId: 'pear-ring.myshopify.com',
        shopImage: 'https://api.triplewhale.com/api/v2/media/shop-icon/pear-ring.myshopify.com',
        ui: {
          summary: {
            pinned: {
              tiles: ['netSales', 'blendedAds', 'roas'],
            },
          },
        },
        features: ['CONF_EXPENSES_BLOCKED'],
        roles: ['admin'],
        accessRoles: [],
        notificationCount: 12,
      },
      {
        shopId: 'penina-rothner-test.myshopify.com',
        shopImage:
          'https://api.triplewhale.com/api/v2/media/shop-icon/penina-rothner-test.myshopify.com',
        roles: ['admin'],
        accessRoles: ['expenses', 'finance'],
        ui: {
          useNewDesign: true,
          summary: {
            pinned: {
              tiles: ['netSales', 'blendedAds', 'roas'],
            },
          },
        },
      },
      {
        shopId: 'shoeembassy.myshopify.com',
        shopImage: 'https://api.triplewhale.com/api/v2/media/shop-icon/shoeembassy.myshopify.com',
        ui: {
          summary: {
            webAnalytics: {
              index: 4,
            },
            pinned: {
              tiles: [
                'netSales',
                'blendedAds',
                'roas',
                'newCustomersCpa',
                'totalNetMargin',
                'pixelConversionRate',
                'pixelCostPerSession',
                'facebookPurchases',
              ],
              index: 0,
            },
            pinterest: {
              index: 8,
            },
            tiktok: {
              index: 7,
            },
            GOOGLE_ADS: {
              index: 6,
            },
            pixel: {
              index: 3,
            },
            customMetrics: {
              index: 2,
            },
            store: {
              index: 1,
            },
            facebookAds: {
              index: 5,
            },
            expenses: {
              index: 9,
            },
          },
          inAppContextBanners: {},
        },
        accessRoles: [],
        roles: ['admin'],
        notificationCount: 6,
      },
      {
        shopId: 'test-production.myshopify.com',
        shopImage:
          'https://api.triplewhale.com/api/v2/media/shop-icon/test-production.myshopify.com',
        accessRoles: [],
        ui: {
          summary: {
            pinned: {
              tiles: ['netSales', 'blendedAds', 'roas'],
            },
          },
        },
        roles: ['admin'],
      },
      {
        shopId: 'testnovember.myshopify.com',
        shopImage: 'https://api.triplewhale.com/api/v2/media/shop-icon/testnovember.myshopify.com',
        roles: ['admin'],
        inviterId: 'hRam2Dmbr7asaxBvReSAXGEhaMb2',
        accessRoles: [],
        ui: {
          useNewDesign: true,
          summary: {
            pinned: {
              tiles: ['netSales', 'blendedAds', 'roas'],
            },
          },
        },
        invitedAt: {
          seconds: 1675862296,
          nanoseconds: 674000000,
        },
        invitationId: '6CVc88cTPDwUIHEfezNd',
      },
      {
        shopId: 'testpayment1.myshopify.com',
        shopImage: 'https://api.triplewhale.com/api/v2/media/shop-icon/testpayment1.myshopify.com',
        roles: ['admin'],
        ui: {
          summary: {
            pinned: {
              tiles: ['netSales', 'blendedAds', 'roas'],
            },
          },
        },
      },
      {
        shopId: 'testpayment3.myshopify.com',
        shopImage: 'https://api.triplewhale.com/api/v2/media/shop-icon/testpayment3.myshopify.com',
        ui: {
          summary: {
            pinned: {
              tiles: ['netSales', 'blendedAds', 'roas'],
            },
          },
        },
        roles: ['admin'],
      },
      {
        shopId: 'testpayment2.myshopify.com',
        shopImage: 'https://api.triplewhale.com/api/v2/media/shop-icon/testpayment2.myshopify.com',
        roles: ['admin'],
        ui: {
          summary: {
            pinned: {
              tiles: ['netSales', 'blendedAds', 'roas'],
            },
          },
        },
      },
      {
        shopId: 'testproductionpaymentlink.myshopify.com',
        shopImage:
          'https://api.triplewhale.com/api/v2/media/shop-icon/testproductionpaymentlink.myshopify.com',
        ui: {
          summary: {
            pinned: {
              tiles: ['netSales', 'blendedAds', 'roas'],
            },
          },
        },
        roles: ['admin'],
      },
      {
        shopId: 'wishywish-store.myshopify.com',
        shopImage:
          'https://api.triplewhale.com/api/v2/media/shop-icon/wishywish-store.myshopify.com',
        ui: {
          summary: {
            pinned: {
              tiles: ['netSales', 'blendedAds', 'roas'],
            },
          },
        },
        roles: ['admin'],
        accessRoles: [],
      },
      {
        shopId: 'yitzchak-test.57231.myshopify.com',
        shopImage:
          'https://api.triplewhale.com/api/v2/media/shop-icon/yitzchak-test.57231.myshopify.com',
        ui: {
          summary: {
            pinned: {
              tiles: ['netSales', 'blendedAds', 'roas'],
            },
          },
        },
        roles: ['owner'],
      },
      {
        shopId: 'every-foods.myshopify.com',
        shopImage: 'https://api.triplewhale.com/api/v2/media/shop-icon/every-foods.myshopify.com',
        roles: ['admin'],
        ui: {
          summary: {
            pinned: {
              tiles: ['netSales', 'blendedAds', 'roas'],
            },
          },
        },
        features: ['CONF_NEW_DESIGN'],
        notificationCount: 6,
      },
      {
        shopId: 'the-frownies.myshopify.com',
        shopImage: 'https://api.triplewhale.com/api/v2/media/shop-icon/the-frownies.myshopify.com',
        roles: ['admin'],
        features: ['CONF_NEW_DESIGN'],
        ui: {
          summary: {
            pinned: {
              tiles: ['netSales', 'blendedAds', 'roas'],
            },
          },
        },
        notificationCount: 6,
      },
      {
        shopId: 'corsa-girl.myshopify.com',
        shopImage: 'https://api.triplewhale.com/api/v2/media/shop-icon/corsa-girl.myshopify.com',
        ui: {
          gridDesktopColumns: 4,
          summaryFullWidth: true,
          gridDesktop: true,
        },
        notificationCount: 6,
      },
      {
        shopId: 'batsheva-impppp.myshopify.com',
        shopImage:
          'https://api.triplewhale.com/api/v2/media/shop-icon/batsheva-impppp.myshopify.com',
        roles: ['admin'],
        ui: {
          summary: {
            pinned: {
              tiles: ['netSales', 'blendedAds', 'roas'],
            },
          },
        },
      },
      {
        shopId: 'batsheva-impppp1.myshopify.com',
        shopImage:
          'https://api.triplewhale.com/api/v2/media/shop-icon/batsheva-impppp1.myshopify.com',
        ui: {
          summary: {
            pinned: {
              tiles: ['netSales', 'blendedAds', 'roas'],
            },
          },
        },
        roles: ['admin'],
      },
      {
        shopId: 'batsheva-impppp2.myshopify.com',
        shopImage:
          'https://api.triplewhale.com/api/v2/media/shop-icon/batsheva-impppp2.myshopify.com',
        ui: {
          summary: {
            pinned: {
              tiles: ['netSales', 'blendedAds', 'roas'],
            },
          },
        },
        roles: ['admin'],
      },
      {
        shopId: 'my-obvi.myshopify.com',
        shopImage: 'https://api.triplewhale.com/api/v2/media/shop-icon/my-obvi.myshopify.com',
        ui: {
          summary: {
            pinned: {
              tiles: ['netSales', 'blendedAds', 'roas'],
            },
          },
        },
        roles: ['admin'],
        features: [],
      },
      {
        shopId: 'trueclassictees-com.myshopify.com',
        shopImage:
          'https://api.triplewhale.com/api/v2/media/shop-icon/trueclassictees-com.myshopify.com',
        ui: {
          summary: {
            pinned: {
              tiles: ['netSales', 'blendedAds', 'roas'],
            },
          },
        },
        features: [],
        roles: ['admin'],
        notificationCount: 6,
      },
    ] as any,
  },
};
