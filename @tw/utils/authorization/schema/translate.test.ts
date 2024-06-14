import { translateSchema, _test } from './translate';

describe('translateRelation', () => {
  const { translateRelation } = _test;
  it('should translate a spiceDB string to a JS object', () => {
    const spiceDBString = `
      relation admin: user
      `;
    const expected = {
      admin: { user: {} },
    };
    expect(translateRelation(spiceDBString)).toEqual(expected);
  });
  it('should work with sub-relation', () => {
    const spiceDBString = `
      relation admin: group#member
      `;
    const expected = {
      admin: { group: { member: {} } },
    };
    expect(translateRelation(spiceDBString)).toEqual(expected);
  });
  it('should work with multiple subjects', () => {
    const spiceDBString = `
      relation admin: user | group#member
      `;
    const expected = {
      admin: { user: {}, group: { member: {} } },
    };
    expect(translateRelation(spiceDBString)).toEqual(expected);
  });
});

describe('translatePermission', () => {
  const { translatePermission } = _test;
  it('should translate a spiceDB string to a JS object', () => {
    const spiceDBString = `
      permission manage = admin
      `;
    const expected = {
      manage: { admin: {} },
    };
    expect(translatePermission(spiceDBString)).toEqual(expected);
  });
  it('should work with sub-permission', () => {
    const spiceDBString = `
      permission manage = account->manage
      `;
    const expected = {
      manage: { account: { manage: {} } },
    };
    expect(translatePermission(spiceDBString)).toEqual(expected);
  });
  it('should work with multiple subjects', () => {
    const spiceDBString = `
      permission manage = admin + account->manage
      `;
    const expected = {
      manage: { admin: {}, account: { manage: {} } },
    };
    expect(translatePermission(spiceDBString)).toEqual(expected);
  });
});

describe('translateDefinition', () => {
  const { translateDefinition } = _test;
  describe('getName', () => {
    const { getName } = _test;
    it('should return the name of the definition', () => {
      const spiceDBString = `
        definition account {
          relation admin: user
          permission manage = admin
        }
        `;
      const expected = 'account';
      expect(getName(spiceDBString)).toEqual(expected);
    });
    it("even if it's weirdly formatted", () => {
      const spiceDBString1 = `definition account
      {
        relation admin: user
        permission manage = admin
      }`;
      const spiceDBString2 = `definition
      account
      {
        relation admin: user
        permission manage = admin
      }`;
      const expected = 'account';
      expect(getName(spiceDBString1)).toEqual(expected);
      expect(getName(spiceDBString2)).toEqual(expected);
    });
  });

  describe('getRelations', () => {
    const { getRelations } = _test;
    it('should return the relations of the definition', () => {
      const spiceDBString = `
        definition account {
          relation admin: user
          permission manage = admin
        }
        `;
      const expected = [`relation admin: user`];
      expect(getRelations(spiceDBString)).toEqual(expected);
    });
    it("when there's more than one", () => {
      const spiceDBString = `
        definition account {
          relation admin: user
          relation member: user
          permission manage = admin
        }
        `;
      const expected = [`relation admin: user`, `relation member: user`];
      expect(getRelations(spiceDBString)).toEqual(expected);
    });
    it("even if it's weirdly formatted", () => {
      const spiceDBString1 = `definition account
      {
        relation admin: user
          relation member: user
        permission manage = admin
      }`;
      const spiceDBString2 = `definition
      account
      {
        relation admin: user
          relation member: user
        permission manage = admin
      }`;
      const expected = [`relation admin: user`, `relation member: user`];
      expect(getRelations(spiceDBString1)).toEqual(expected);
      expect(getRelations(spiceDBString2)).toEqual(expected);
    });
  });

  describe('getPermissions', () => {
    const { getPermissions } = _test;
    it('should return the relations of the definition', () => {
      const spiceDBString = `
        definition account {
          relation admin: user
          permission manage = admin
        }
        `;
      const expected = [`permission manage = admin`];
      expect(getPermissions(spiceDBString)).toEqual(expected);
    });
    it("when there's more than one", () => {
      const spiceDBString = `
        definition account {
          relation admin: user
          permission manage = admin
          permission view = admin
        }
        `;
      const expected = [`permission manage = admin`, `permission view = admin`];
      expect(getPermissions(spiceDBString)).toEqual(expected);
    });
    it("even if it's weirdly formatted", () => {
      const spiceDBString1 = `definition account
      {
        relation admin: user
        permission manage = admin
          permission view = admin
      }`;
      const spiceDBString2 = `definition
      account
      {
        relation admin: user
          relation member: user

        permission manage = admin
        permission view = admin
      }`;
      const expected = [`permission manage = admin`, `permission view = admin`];
      expect(getPermissions(spiceDBString1)).toEqual(expected);
      expect(getPermissions(spiceDBString2)).toEqual(expected);
    });
  });

  it('should translate a spiceDB string to a JS object', () => {
    const spiceDBString = `
      definition account {
        relation admin: user
        permission manage = admin
      }
      `;
    const expected = {
      account: {
        relations: {
          admin: { user: {} },
        },
        permissions: {
          manage: { admin: {} },
        },
      },
    };
    expect(translateDefinition(spiceDBString)).toEqual(expected);
  });
  it('should work with multiple relations and permissions', () => {
    const spiceDBString = `
      definition account {
        relation admin: user
        relation member: user
        permission manage = admin
        permission view = manage + member
      }
      `;
    const expected = {
      account: {
        relations: {
          admin: { user: {} },
          member: { user: {} },
        },
        permissions: {
          manage: { admin: {} },
          view: { manage: {}, member: {} },
        },
      },
    };
    expect(translateDefinition(spiceDBString)).toEqual(expected);
  });
  it('works with sub-relations and sub-permissions', () => {
    const spiceDBString = `
      definition integration {
        relation account: account
        relation admin: user | group#member
        relation member: user

        permission manage = admin + account->manage
        permission view = manage + account->view
      }
      `;
    const expected = {
      integration: {
        relations: {
          account: { account: {} },
          admin: { user: {}, group: { member: {} } },
          member: { user: {} },
        },
        permissions: {
          manage: { admin: {}, account: { manage: {} } },
          view: { manage: {}, account: { view: {} } },
        },
      },
    };
    expect(translateDefinition(spiceDBString)).toEqual(expected);
  });
});

describe('translateSchema', () => {
  const expected = {
    account: {
      relations: {
        admin: { user: {} },
      },
      permissions: {
        manage: { admin: {} },
      },
    },
    integration: {
      relations: {
        account: { account: {} },
        admin: { user: {}, group: { member: {} } },
        member: { user: {} },
      },
      permissions: {
        manage: { admin: {}, account: { manage: {} } },
        view: { manage: {}, account: { view: {} } },
      },
    },
  };
  it('should translate a spiceDB string to a JS object', () => {
    const spiceDBString = `
      definition account {
        relation admin: user
        permission manage = admin
      }
      definition integration {
        relation account: account
        relation admin: user | group#member
        relation member: user

        permission manage = admin + account->manage
        permission view = manage + account->view
      }
      `;
    expect(translateSchema(spiceDBString)).toEqual(expected);
  });
  it('works with newlines in between', () => {
    const spiceDBString = `
      definition account {
        relation admin: user
        permission manage = admin
      }

      definition integration {
        relation account: account
        relation admin: user | group#member
        relation member: user

        permission manage = admin + account->manage
        permission view = manage + account->view
      }
      
      `;
    expect(translateSchema(spiceDBString)).toEqual(expected);
  });
});
