import { describe, expect, it } from 'vitest';

import { classNames } from './class-names.js';

const styles = {
  'c-button': '_c-button_hash',
  'm-primary': '_m-primary_hash',
  'm-loading': '_m-loading_hash',
};

describe('classNames', () => {
  it('resolves keys against the styles map', () => {
    expect(classNames(styles, 'c-button', 'm-primary')).toBe('_c-button_hash _m-primary_hash');
  });

  it('passes through a raw class name not present in the styles map', () => {
    expect(classNames(styles, 'c-button', 'extra')).toBe('_c-button_hash extra');
  });

  it('drops falsy values', () => {
    expect(classNames(styles, 'c-button', false, null, undefined, '')).toBe('_c-button_hash');
  });

  it('returns an empty string when nothing is truthy', () => {
    expect(classNames(styles, false, undefined, null)).toBe('');
  });

  it('applies multiple independent modifiers from a conditional map', () => {
    expect(classNames(styles, 'c-button', { 'm-primary': true, 'm-loading': true })).toBe(
      '_c-button_hash _m-primary_hash _m-loading_hash',
    );
  });

  it('omits map entries whose condition is falsy', () => {
    expect(classNames(styles, 'c-button', { 'm-primary': true, 'm-loading': false })).toBe(
      '_c-button_hash _m-primary_hash',
    );
  });
});
