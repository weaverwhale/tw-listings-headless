# Triple Whale Auth Schema

## If you're going to change it, make sure to read this whole README!!!

Especially the sections below about `Updating these types`.

## Overview

For more info about SpiceDB, see these links:

-   [SpiceDB Docs](https://authzed.com/docs/reference/schema-lang)
-   [Playground for Testing](https://play.authzed.com/)

### Use

SpiceDB is for keeping track of permissions based on the **relations** between two resources.
A resource is any part of the system, really, but mostly it refers to a specific business-logic entity like a user, account, or integration.

**When such relationships are created or changed, they need to be registered with SpiceDB.**

Example: A user is added to an account. I need to tell SpiceDB that a user with userId: `xyz` is added to an account with accountId: `abc`.

SpiceDB uses our authorization schema (expressed in the files in this directory) to determine the permissions that a subject has with respect to a resource.
It allows us to ask whether a subject has a particular type of access to a resource, regardless of **how** that permission came to be.

Example:

-   User A is allowed to view all data on any integration for an account
-   User B is a member of a group that is allowed to view any facebook data for that account
-   I ask SpiceDB:
    -   Can User A view some Tiktok data for the account? --> `yes`
    -   Can User B view some Facebook data for the account? --> `yes`
    -   Can User B view some Tiktok data for the account? --> `no`
-   I don't need to know or care why User A can view it or User B can't view it. SpiceDB handles checking all the different ways that a permission might or might not apply

#### Terms

When asking: `Does User A have permission to view data on Account ABC`?

-   `User A` is the **Subject** (i.e. the entity that wants to access something in the system)
    -   specifically, the `subjectType` is `user`
    -   the `subjectId` is User A's id in the system
-   `permission to view data` is the **Permission**
    -   in the schema below, we name this permission `view_data`
-   `Account ABC` is the **Resource** (i.e. the thing that the subject wants to access)
    -   so the `resourceType` is `account`
    -   the `resourceId` will be the account's id in the system
-   So generally, a permissions check will have the following form:
    -   `subjectType`
    -   `subjectId`
    -   `permission`
    -   `resourceType`
    -   `resourceId`

When asserting that `User A is an admin of Account ABC`:

-   Again `User A` is the **Subject**
    -   `subjectType` === `user`
    -   `subjectId` === `asdfasdfasdf` // User A's ID
-   `admin` is the **Relation**
    -   `relation` === `admin`
-   `Account ABC` is the **Resource**
    -   `resourceType` === `account`
    -   `resourceId` === `myaccoutn.myshopify.com` // Account ABC's ID
-   So when adding/updating a relation:
    -   `subjectType`
    -   `subjectId`
    -   `relation`
    -   `resourceType`
    -   `resourceId`

#### A little Gotcha

It's worth noting that for relations, **It's not always obvious which is the subject and which is the resource**.

-   If I say `User A is admin on Account ABC`, then User A is the subject and Account ABC is the resource, this is clear.
-   BUT: If I say `Integration xyz123 belongs to Account ABC`, it might seem like the Integration is the subject and the account is the resource. But this is not the case!
    -   It's more like saying `Account ABC is the account on Integration xyz123`: Here it's more clear that the account is the subject and the integration is the resource.

For this reason, it's important to make the utils in this module smart enough to be dev-friendly!
`addAccountToIntegration` isn't very intuitive naming, since we generally think of the integration as being added to the account.
So I call the util `addIntegrationToAccount`, but still make sure that `subjectType` is `account` and that `accountId` becomes the `subjectId`.

### Architecture

-   SpiceDB is an open source product by AuthZed. AuthZed provides a custom Kubernetes operator that manages a custom Kubernetes resource called `SpiceDBClusters`.
-   SpiceDB relies on a backend data store to persist relations data. We use postgres for this.
-   The SpiceDBClusters expose a GRPC interface.
-   AuthZed provides a NodeJS SDK for sending GRPC calls to the SpiceDBClusters.
-   The code in `backend/services/charif/spicedb` wraps this SDK in a more dev-friendly format
-   The `charif` service (`backend/services/charif/endpoints`) exposes an HTTP API for interacting with SpiceDB
-   The utils in `@tw/utils/module/authorization` provide an easy way for consumers to call the `charif` HTTP API

## Updating these types

**ALL SCHEMA CHANGES NEED TO BE BACKWARD COMPATIBLE!**

Otherwise, we need to manually migrate the SpiceDB backend datastore (postgres), which will be a pain in the ass.

This means that you should:

-   Make sure your changes are backward compatible:
    -   Meaning essentially that any relation that was valid before your change should also be valid after your change
-   Make it easy on the next person:
    -   If you're adding a resource or changing an existing one,

## Best Practices

### Relations are nouns, Permissions are verbs

Do this:

```
// GOOD!
definition document {
    relation writer: user

    permission write = writer
}
```

Not this:

```
// BAD!
definition document {
    relation writes: user

    permission has_write = writes
}
```

It's not as semantically clear.

Even better, abstract your definition into a clear English name:

```
// GREAT!
const writerCanWrite = `permission write = writer`

cosnt document = `
definition document
    relation writer: user

    ${writerCanWrite}
`
```

This is especially helpful if the relations/permissions are more verbose.

### The target type of a sub-relation should be a relation

Let's say our schema looks like this:

```
definition user {}

definition group {
    relation member: user
    relation doc_viewer: user

    permission view = doc_viewer
}

definition document {
    relation owner: user | group#member
}
```

Now you want to add a `viewer` relation to the document resource.

Do this:

```
// GOOD!
definition document {
    relation owner: user | group#member
    relation viewer: user | group#doc_viewer
}
```

Not this:

```
// BAD!
definition document {
    relation owner: user | group#member
    relation viewer: user | group#view // references a permission on `group`, not a relation!
}
```

It's not as semantically clear and it's harder to reason about.

### The target of a sub-permission should be a permission

Given this schema:

```
definition user {}

definition folder {
    relation parent: folder
    relation viewer: user

    permission view = parent->view + viewer
}

definition document {
    relation editor: user
    relation viewer: user
    relation folder: folder

    permission edit = editor
}
```

Let's say you want to add a permission to `document` called `view`, where anyone who can view the document's folder can also view the document:

Do this:

```
// GOOD!
definition document {
    relation editor: user
    relation viewer: user
    relation folder: folder

    permission edit = editor
    permission view = viewer + folder->view // someone with `view` permission on this doc's `folder`
}
```

Not this:

```
// BAD!
definition document {
    relation editor: user
    relation viewer: user
    relation folder: folder

    permission edit = editor
    permission view = viewer + folder->viewer // notice we're pointing to the 'viewer' relation, not the 'view' permission
}
```

In this bad case, by pointing to the relation of `folder: { viewer: {} }` instead of the permission `folder: { view: {} }`,
we lose the recursive permission structure of folder. So if the folders look like this:

```
/folder_A <-- `user1` is a `viewer` of this folder
  /folder_B <-- `user2` is a `viewer` of this folder
    document.txt <-- `user3` is a `viewer` of the document
```

We expect all 3 users to have `view` permission on the document. But if we write:

```
    permission view = viewer + folder->viewer // notice we're pointing to the 'viewer' relation, not the 'view' permission
```

then `user1` won't be allowed to view the document, because he's not a `viewer` of `folder_B`, even though he does have permission to `view` `folder_B`.
