# SpiceDB Schema

Here we describe the schema, with each resource's relations and permissions.

### For more info about each resource, see the specific documentation for that resource.

We group the resources into two main types: Data and Non-data entities.

-   **Data**: the data that TW collects from integrations with 3rd party apps, as well as our own Pixel data and any other data that's used to make metrics, display inside of dashboards, etc.
    -   Resources:
        -   [Account](ACCOUNT.md)
        -   [Business Unit](BUSINESS_UNIT.md)
        -   [Provider](PROVIDER.md)
        -   [Integration](INTEGRATION.md)
-   **Non-data entities**: basically, everything else.
    -   Resources:
        -   [User](USER.md)
        -   [Group](GROUP.md)
        -   [Dashboard](DASHBOARD.md)
        -   API Key (not implemented yet)
        -   Oauth App (not implemented yet)

## Data Resources

We can think of the data in the TW App as essentially one big table.
Each row is associated with a specific `integrationId`, which is a unique identifier for a connection between a TW account and a provider account.
Each `column` is a type of data that we collect.
Not every row has data for every column, but we can still imagine the data as if it is one big table, with gaps where no data exists.
Naturally each row also has a `timestamp`, by which it is distinguished from other rows in the table with the same `integrationId`.

This means that each piece of data can be uniquely described by a three-dimensional vector `<integrationId, column, timestamp>`.
A user has access to a particular data point if and only if that user has access to each dimension in this vector for that data point.

The following schema resources are abstract groupings of `integrationId`s, according to which a user can gain access to the `integrationId` dimension of a particular data point.
