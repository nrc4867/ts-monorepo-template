/** @type {import('stylelint').Config} */
export default {
  extends: ['stylelint-config-standard-scss'],
  rules: {
    // Every class is either a component/block class (`c-`, optionally with a
    // `-part` suffix for a sub-element) or a modifier (`m-`) applied
    // alongside one — see the "Styling" section in AGENTS.md. This is what
    // makes cross-component overrides visible in review: a `.c-app-title`
    // rule living outside app/'s own stylesheet is an obvious violation.
    'selector-class-pattern': [
      '^(c|m)-[a-z][a-z0-9]*(-[a-z0-9]+)*$',
      {
        message:
          'Class names must start with c- (component) or m- (modifier), e.g. .c-button, .m-primary',
      },
    ],
  },
};
