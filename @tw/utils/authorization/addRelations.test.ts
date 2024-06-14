import { _test, RelationValidationError } from './addRelations';

const { sendAddRequest, buildAdder } = _test;

jest.mock('../callServiceEndpoint');
import { callServiceEndpoint } from '../callServiceEndpoint';
jest.mock('./validate');
import { validateRelations } from './validate';

describe('sendAddRequest', () => {
  it('throws RelationValidationError if params are invalid', async () => {
    (validateRelations as jest.Mock).mockReturnValue(['error1', 'error2']);
    await expect(sendAddRequest({} as any)).rejects.toBeInstanceOf(RelationValidationError);
  });
});

describe('buildAdder', () => {
  it('throws RelationValidationError if params are invalid', async () => {
    (validateRelations as jest.Mock).mockReturnValue(['error1', 'error2']);
    const adder = buildAdder('account', 'admin', 'user');
    await expect(adder({} as any)).rejects.toBeInstanceOf(RelationValidationError);
  });
  it('calls callServiceEndpoint with correct params', async () => {
    (validateRelations as jest.Mock).mockReturnValue([]);
    const adder = buildAdder('account', 'admin', 'user');
    const expectedParams = {
      subjectId: 'test_user',
      subjectType: 'user',
      resourceId: 'test_account',
      resourceType: 'account',
      relation: 'admin',
    };
    await adder({ accountId: 'test_account', userId: 'test_user' });
    expect(callServiceEndpoint).toHaveBeenCalledWith('charif', 'relation/add', expectedParams);
  });
  it('works when more than one valid subject type', async () => {
    (validateRelations as jest.Mock).mockReturnValue([]);
    const adder = buildAdder('account', 'admin', ['user', 'group']);
    const expectedParamsUser = {
      subjectId: 'test_user',
      subjectType: 'user',
      resourceId: 'test_account',
      resourceType: 'account',
      relation: 'admin',
    };
    const expectedParamsGroup = {
      subjectId: 'test_group',
      subjectType: 'group',
      resourceId: 'test_account',
      resourceType: 'account',
      relation: 'admin',
    };
    await adder({ accountId: 'test_account', userId: 'test_user' });
    expect(callServiceEndpoint).toHaveBeenCalledWith('charif', 'relation/add', expectedParamsUser);
    await adder({ accountId: 'test_account', groupId: 'test_group' });
    expect(callServiceEndpoint).toHaveBeenCalledWith('charif', 'relation/add', expectedParamsGroup);
  });
  it('works with multiple subjects', async () => {
    (validateRelations as jest.Mock).mockReturnValue([]);
    const adder = buildAdder('account', 'admin', ['user', 'group']);
    const expectedParamsUser = {
      subjectIds: ['test_user1', 'test_user2'],
      subjectType: 'user',
      resourceId: 'test_account',
      resourceType: 'account',
      relation: 'admin',
    };
    const expectedParamsGroup = {
      subjectIds: ['test_group1', 'test_group2'],
      subjectType: 'group',
      resourceId: 'test_account',
      resourceType: 'account',
      relation: 'admin',
    };
    await adder({ accountId: 'test_account', userIds: ['test_user1', 'test_user2'] });
    expect(callServiceEndpoint).toHaveBeenCalledWith('charif', 'relation/add', expectedParamsUser);
    await adder({ accountId: 'test_account', groupIds: ['test_group1', 'test_group2'] });
    expect(callServiceEndpoint).toHaveBeenCalledWith('charif', 'relation/add', expectedParamsGroup);
  });
  it('works with multiple resources', async () => {
    (validateRelations as jest.Mock).mockReturnValue([]);
    const adder = buildAdder('account', 'admin', 'user');
    const expectedParams = {
      subjectId: 'test_user',
      subjectType: 'user',
      resourceIds: ['test_account1', 'test_account2'],
      resourceType: 'account',
      relation: 'admin',
    };
    await adder({ accountIds: ['test_account1', 'test_account2'], userId: 'test_user' });
    expect(callServiceEndpoint).toHaveBeenCalledWith('charif', 'relation/add', expectedParams);
  });
});
