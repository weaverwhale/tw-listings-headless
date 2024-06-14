import { validateRelations } from './validate';

describe('validateAddRelation', () => {
  describe('missing params', () => {
    it('subjectId', () => {
      const errors = validateRelations({
        subjectId: '',
        subjectType: 'user',
        resourceId: 'test_account',
        resourceType: 'account',
        relation: 'admin',
      });
      expect(errors).toEqual(['Subject id is required']);
    });
    it('resourceId', () => {
      const errors = validateRelations({
        subjectId: 'test_user',
        subjectType: 'user',
        resourceId: '',
        resourceType: 'account',
        relation: 'admin',
      });
      expect(errors).toEqual(['Resource id is required']);
    });
    it('subjectType', () => {
      const errors = validateRelations({
        subjectId: 'test_user',
        // @ts-ignore
        subjectType: '',
        resourceId: 'test_account',
        resourceType: 'account',
        relation: 'admin',
      });
      expect(errors).toEqual(['Subject type is required']);
    });
    it('resourceType', () => {
      const errors = validateRelations({
        subjectId: 'test_user',
        subjectType: 'user',
        resourceId: 'test_account',
        // @ts-ignore
        resourceType: '',
        relation: 'admin',
      });
      expect(errors).toEqual(['Resource type is required']);
    });
    it('relation', () => {
      const errors = validateRelations({
        subjectId: 'test_user',
        subjectType: 'user',
        resourceId: 'test_account',
        resourceType: 'account',
        // @ts-ignore
        relation: '',
      });
      expect(errors).toEqual(['Relation is required']);
    });
  });
  describe('invalid params', () => {
    it('resource type doesnt exist', () => {
      const errors = validateRelations({
        // @ts-ignore
        resourceType: 'deadbeef',
        resourceId: '1',
        subjectType: 'user',
        subjectId: '1',
        relation: 'member',
      });
      expect(errors).toEqual(['No resource type deadbeef in authorization schema']);
    });
    it('subject type doesnt exist', () => {
      const errors = validateRelations({
        resourceType: 'group',
        resourceId: '1',
        // @ts-ignore
        subjectType: 'deadbeef',
        subjectId: '1',
        relation: 'member',
      });
      expect(errors).toEqual(['No subject type deadbeef in authorization schema']);
    });
    it('relation doesnt exist on resource type', () => {
      const errors = validateRelations({
        resourceType: 'group',
        resourceId: '1',
        subjectType: 'user',
        subjectId: '1',
        relation: 'deadbeef',
      });
      expect(errors).toEqual(['No relation deadbeef on resource type group']);
    });
    it('subject type doesnt match relation', () => {
      const errors = validateRelations({
        resourceType: 'group',
        resourceId: '1',
        subjectType: 'group',
        subjectId: '1',
        relation: 'member',
      });
      expect(errors).toEqual([
        'Subject type group is not valid for relation member in resource type group',
      ]);
    });
  });
  describe('valid params', () => {
    it('works', () => {
      const errors = validateRelations({
        resourceType: 'group',
        resourceId: '1',
        subjectType: 'user',
        subjectId: '1',
        relation: 'member',
      });
      expect(errors).toEqual([]);
    });
    it('works with sub-relations', () => {
      const errors = validateRelations({
        resourceType: 'account',
        resourceId: '1',
        subjectType: 'group',
        subjectId: '1',
        relation: 'data_viewer',
      });
      expect(errors).toEqual([]);
    });
  });
});
