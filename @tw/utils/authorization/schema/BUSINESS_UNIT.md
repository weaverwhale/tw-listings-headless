# Business Unit

This isn't actually implemented in TW yet.

A Business Unit is an arbitrary grouping of integrations within an account. It is defined by the account. If a user has permissions to view data at the level of a business unit, it can view data from any `integrationId` belonging to that business unit, including ones that will be added in the future.

## Relations

| Name        | Target    | Description                                            |
| ----------- | --------- | ------------------------------------------------------ |
| account     | `account` | The account that the `business_unit` belongs to        |
| admin       | `user`    | A user that is an admin for the `business_unit`        |
| data_viewer | `user`    | A user that can view all data for this `business_unit` |

## Permissions

| Name      | Targets                | Description                                                                                                            |
| --------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| manage    | `admin`                | A user with the `admin` relation can manage the `business_unit`                                                        |
| manage    | `account -> manage`    | Any user that can manage the `account` the `business_unit` belongs to can also manage the `business_unit`              |
| view_data | `account -> view_data` | Any user that can view data on the `account` the `business_unit` belongs to can also view data for the `business_unit` |
| view_data | `admin`                | A user with the `admin` relation can view data on the `business_unit`                                                  |
| view_data | `data_viewer`          | A user with the `data_viewer` relation can view data on the `business_unit`                                            |
