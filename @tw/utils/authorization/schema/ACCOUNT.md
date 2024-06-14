# Account

An account is the highest layer of abstraction. Every `integrationId` belongs to one and only one account. If a user has permissions to view data at the account level, it can view data from any `integrationId` belonging to that account, including ones that will be added in the future.

## Relations

| Name        | Target | Description                                                                                         |
| ----------- | ------ | --------------------------------------------------------------------------------------------------- |
| admin       | `user` | An admin user that can manage the account                                                           |
| data_viewer | `user` | A user that can view all data for this account                                                      |
| member      | `user` | A user that is associated with the account, but cannot automatically view all data from the account |

## Permissions

| Name            | Targets       | Description                                                                     |
| --------------- | ------------- | ------------------------------------------------------------------------------- |
| manage          | `admin`       | A user with the `admin` relation can manage the account                         |
| view_data       | `manage`      | Any user that can manage the account can also view all data on the account      |
| view_data       | `data_viewer` | A user with the `data_viewer` relation can view data on the account             |
| view_dashboards | `view_data`   | Any user that can view the account data can also view dashboards on the account |
| view_dashboards | `member`      | A user with the `member` relation can view dashboards on the account            |
