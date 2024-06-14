import { getMaintainers } from './getMaintainers';

jest.mock('@inquirer/prompts');
import { input } from '@inquirer/prompts';

describe('getMaintainers', () => {
  it('should return an array of maintainers', async () => {
    (input as jest.Mock).mockResolvedValueOnce('billy chezki');
    const maintainers = await getMaintainers();
    expect(maintainers).toEqual(['billy@triplewhale.com', 'chezki@triplewhale.com']);
  });
});
