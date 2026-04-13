import { describe, expect, it, mock } from 'bun:test';

describe('smoke', () => {
  it('runs a basic assertion', () => {
    expect(1 + 1).toBe(2);
  });

  it('supports mocking', () => {
    const greet = mock((name: string) => `hello ${name}`);

    const result = greet('drift');

    expect(result).toBe('hello drift');
    expect(greet).toHaveBeenCalledTimes(1);
    expect(greet).toHaveBeenCalledWith('drift');
  });
});
