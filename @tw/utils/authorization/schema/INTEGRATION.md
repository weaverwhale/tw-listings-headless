# Integration

An Integration is a connection between a TW account and a integration account (e.g. a specific Facebook Ads account, Shopify account, or Klaviyo account).
Each data point has an `integrationId` that will correspond to a specific integration.

## Relations

| Name          | Target          | Description                                                  |
| ------------- | --------------- | ------------------------------------------------------------ |
| account       | `account`       | The account that the `integration` belongs to                |
| admin         | `user`          | A user that is an admin for the `integration`                |
| data_viewer   | `user`          | A user that can view all data for this `integration`         |
| provider      | `provider`      | The `provider` resource that this integration belongs to.    |
| business_unit | `business_unit` | A `business_unit` resource that this integration belongs to. |

## Permissions

| Name      | Targets                      | Description                                                                                                           |
| --------- | ---------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| manage    | `admin`                      | A user with the `admin` relation can manage the `integration`                                                         |
| manage    | `account -> manage`          | Any user that can manage the `account` the `integration` belongs to can also manage the `integration`                 |
| manage    | `provider -> manage`         | Any user that can manage the `provider` the `integration` belongs to can also manage the `integration`                |
| manage    | `business_unit -> manage`    | Any user that can manage a `business_unit` the `integration` belongs to can also manage the `integration`             |
| view_data | `account -> view_data`       | Any user that can view data on the `account` the `integration` belongs to can also view data for the `integration`    |
| view_data | `provider -> view_data`      | Any user that can view data on the `provider` the `integration` belongs to can also view data on the `integration`    |
| view_data | `business_unit -> view_data` | Any user that can view data on a `business_unit` the `integration` belongs to can also view data on the `integration` |
| view_data | `manage`                     | Any user with the `manage` permission can also view data on the `integration`                                         |
| view_data | `data_viewer`                | A user with the `data_viewer` relation can view data on the `integration`                                             |
