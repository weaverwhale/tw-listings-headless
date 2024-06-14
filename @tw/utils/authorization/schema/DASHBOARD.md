# Dashboard

A dashboard is a collection of widgets that retrieve and display data within the app.
A user's relationship to a dashboard is orthogonal to its relationship to the data that the dashboard might display.

## Relations

| Name   | Target    | Description                                                                                               |
| ------ | --------- | --------------------------------------------------------------------------------------------------------- |
| owner  | `user`    | The user that created the dashboard                                                                       |
| editor | `user`    | A user that can edit the dashboard                                                                        |
| admin  | `user`    | A user that can edit the dashboard, and invite other users                                                |
| viewer | `user`    | A user that can view the dashboard                                                                        |
| viewer | `account` | (For public dashboards) An account where any user that is a member of the account can view this dashboard |

## Permissions

| Name         | Targets                     | Description                                                                                                          |
| ------------ | --------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| invite_users | `owner`                     | A user with the `owner` relation can invite other users to the dashbaord                                             |
| invite_users | `admin`                     | A user with the `admin` relation can invite other users to the dashbaord                                             |
| edit         | `invite_users`              | Any user that can invite users to the dashboard can also edit the dashboard                                          |
| edit         | `editor`                    | A user with the `editor` relation can edit the dashboard                                                             |
| view         | `edit`                      | Any user that can edit the dashboard can also view the dashboard                                                     |
| view         | `viewer`                    | A user with the `viewer` relation can view the dashboard                                                             |
| view         | `viewer -> view_dashboards` | Any user with the `view_dashboards` permission on an `account` that has the `viewer` relation can view the dashboard |
