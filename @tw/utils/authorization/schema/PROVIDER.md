# Provider

A Provider (in this context) is the group of all integrations within one account that correspond to a certain provider (e.g. Facebook Ads, Shopify, or Klaviyo). If a user has permissions to view data at the level of a provider, it can view data from any `integrationId` belonging to that provider, including ones that will be added in the future.

## Relations

| Name        | Target    | Description                                       |
| ----------- | --------- | ------------------------------------------------- |
| account     | `account` | The account that the `provider` belongs to        |
| admin       | `user`    | A user that is an admin for the `provider`        |
| data_viewer | `user`    | A user that can view all data for this `provider` |

## Permissions

| Name      | Targets                | Description                                                                                                  |
| --------- | ---------------------- | ------------------------------------------------------------------------------------------------------------ |
| manage    | `admin`                | A user with the `admin` relation can manage the `provider`                                                   |
| manage    | `account -> manage`    | Any user that can manage the `account` the `provider` belongs to can also manage the `provider`              |
| view_data | `account -> view_data` | Any user that can view data on the `account` the `provider` belongs to can also view data for the `provider` |
| view_data | `admin`                | A user with the `admin` relation can view data on the `provider`                                             |
| view_data | `data_viewer`          | A user with the `data_viewer` relation can view data on the `provider`                                       |
