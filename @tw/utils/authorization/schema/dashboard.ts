export default `
definition dashboard {
  relation owner: user
  relation editor: user
  relation admin: user
  ${
    /*
    / for private: don't set account as viewer (only specific users can view)
    / for public: set account as viewer (all members of account can view)
    */
    'relation viewer: user | account'
  }

  permission invite_users = owner + admin
  permission edit = invite_users + editor
  permission view = edit + viewer + viewer->view_dashboards
}
`;
