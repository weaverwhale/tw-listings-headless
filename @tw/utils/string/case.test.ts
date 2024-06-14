import { separate, camel, pascal, kebab, snake } from './case';

const camelPhrase = 'fooBarBaz';
const snakePhrase = 'foo_bar_baz';
const kebabPhrase = 'foo-bar-baz';
const pascalPhrase = 'FooBarBaz';
const spacePhrase = 'foo bar baz';
const allPhrases = [camelPhrase, snakePhrase, kebabPhrase, pascalPhrase, spacePhrase];
const mixedPhrases = [
  'fooBar_baz',
  'fooBar-baz',
  'fooBar baz',
  'foo_barBaz',
  'foo_bar-baz',
  'foo_bar baz',
  'foo-barBaz',
  'foo-bar_baz',
  'foo-bar baz',
  'foo barBaz',
  'foo bar_baz',
  'foo bar-baz',
  'FooBar_baz',
  'FooBar-baz',
  'FooBar baz',
  'Foo_barBaz',
  'Foo_bar-baz',
  'Foo_bar baz',
  'Foo-barBaz',
  'Foo-bar_baz',
  'Foo-bar baz',
  'Foo barBaz',
  'Foo bar_baz',
  'Foo bar-baz',
];

function generateTests<Ret = string>(fn: (str: string) => Ret, expected: Ret) {
  return test.each(allPhrases.concat(mixedPhrases).map((phrase) => [phrase, expected]))(
    'parses %s',
    (phrase, expected) => {
      expect(fn(phrase)).toEqual(expected);
    }
  );
}

describe('separate', () => {
  it('empty case', () => {
    expect(separate('')).toEqual([]);
  });
  generateTests<string[]>(separate, ['foo', 'bar', 'baz']);
});

describe('camel', () => {
  it('empty case', () => {
    expect(camel('')).toEqual('');
  });
  generateTests(camel, 'fooBarBaz');
});

describe('pascal', () => {
  it('empty case', () => {
    expect(pascal('')).toEqual('');
  });
  generateTests(pascal, 'FooBarBaz');
});

describe('kebab', () => {
  it('empty case', () => {
    expect(kebab('')).toEqual('');
  });
  generateTests(kebab, 'foo-bar-baz');
});

describe('snake', () => {
  it('empty case', () => {
    expect(snake('')).toEqual('');
  });
  generateTests(snake, 'foo_bar_baz');
});
