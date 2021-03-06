import { moduleFor, RenderingTest } from '../../utils/test-case';
import { strip } from '../../utils/abstract-test-case';
import { Component } from '../../utils/helpers';
import { set } from 'ember-metal/property_set';

moduleFor('Components test: fragment components', class extends RenderingTest {
  getCustomDispatcherEvents() {
    return {
      hitDem: 'folks'
    };
  }

  ['@test fragments do not render an outer tag']() {
    let instance;
    let FooBarComponent = Component.extend({
      tagName: '',
      init() {
        this._super();
        instance = this;
        this.foo = true;
        this.bar = 'bar';
      }
    });

    let template = `{{#if foo}}<div>Hey</div>{{/if}}{{yield bar}}`;

    this.registerComponent('foo-bar', { ComponentClass: FooBarComponent, template });

    this.render(`{{#foo-bar as |bar|}}{{bar}}{{/foo-bar}}`);

    this.assertHTML(strip`<div>Hey</div>bar`);

    this.assertStableRerender();

    this.runTask(() => set(instance, 'foo', false));

    this.assertHTML(strip`<!---->bar`);

    this.runTask(() => set(instance, 'bar', 'bizz'));

    this.assertHTML(strip`<!---->bizz`);

    this.runTask(() => {
      set(instance, 'bar', 'bar');
      set(instance, 'foo', true);
    });
  }

  ['@test throws an error if an event function is defined in a tagless component']() {
    let instance;
    let template = `hit dem folks`;
    let FooBarComponent = Component.extend({
      tagName: '',
      init() {
        this._super();
        instance = this;
      },
      click() { }
    });

    this.registerComponent('foo-bar', { ComponentClass: FooBarComponent, template });

    expectAssertion(() => {
      this.render(`{{#foo-bar}}{{/foo-bar}}`);
    }, /You can not define a function that handles DOM events in the .* tagless component since it doesn't have any DOM element./);
  }

  ['@test throws an error if a custom defined event function is defined in a tagless component']() {
    let instance;
    let template = `hit dem folks`;
    let FooBarComponent = Component.extend({
      tagName: '',
      init() {
        this._super();
        instance = this;
      },
      folks() { }
    });

    this.registerComponent('foo-bar', { ComponentClass: FooBarComponent, template });

    expectAssertion(() => {
      this.render(`{{#foo-bar}}{{/foo-bar}}`);
    }, /You can not define a function that handles DOM events in the .* tagless component since it doesn't have any DOM element./);
  }

  ['@test throws an error if `tagName` is an empty string and `classNameBindings` are specified']() {
    let instance;
    let template = `hit dem folks`;
    let FooBarComponent = Component.extend({
      tagName: '',
      init() {
        this._super();
        instance = this;
      },
      foo: true,
      classNameBindings: ['foo:is-foo:is-bar']
    });

    this.registerComponent('foo-bar', { ComponentClass: FooBarComponent, template });

    expectAssertion(() => {
      this.render(`{{#foo-bar}}{{/foo-bar}}`);
    }, /You cannot use `classNameBindings` on a tag-less component/);
  }

  ['@glimmer throws an error if `tagName` is an empty string and `attributeBindings` are specified']() {
    let template = `hit dem folks`;
    let FooBarComponent = Component.extend({
      tagName: '',
      attributeBindings: ['href']
    });

    this.registerComponent('foo-bar', { ComponentClass: FooBarComponent, template });
    expectAssertion(() => {
      this.render(`{{#foo-bar}}{{/foo-bar}}`);
    }, /You cannot use `attributeBindings` on a tag-less component/);
  }

  ['@glimmer throws an error if `tagName` is an empty string and `elementId` is specified via JS']() {
    let template = `hit dem folks`;
    let FooBarComponent = Component.extend({
      tagName: '',
      elementId: 'turntUp'
    });

    this.registerComponent('foo-bar', { ComponentClass: FooBarComponent, template });
    expectAssertion(() => {
      this.render(`{{#foo-bar}}{{/foo-bar}}`);
    }, /You cannot use `elementId` on a tag-less component/);
  }

  ['@test throws an error if when $() is accessed on component where `tagName` is an empty string']() {
    let template = `hit dem folks`;
    let FooBarComponent = Component.extend({
      tagName: '',
      init() {
        this._super();
        this.$();
      }
    });

    this.registerComponent('foo-bar', { ComponentClass: FooBarComponent, template });

    expectAssertion(() => {
      this.render(`{{#foo-bar}}{{/foo-bar}}`);
    }, /You cannot access this.\$\(\) on a component with `tagName: \'\'` specified/);
  }

  ['@test renders a contained view with omitted start tag and tagless parent view context']() {
    this.registerComponent('root-component', {
      ComponentClass: Component.extend({
        tagName: 'section'
      }),
      template: '{{frag-ment}}'
    });

    this.registerComponent('frag-ment', {
      ComponentClass: Component.extend({
        tagName: ''
      }),
      template: '{{my-span}}'
    });

    this.registerComponent('my-span', {
      ComponentClass: Component.extend({
        tagName: 'span'
      }),
      template: 'dab'
    });

    this.render(`{{root-component}}`);

    this.assertElement(this.firstChild, { tagName: 'section' });
    this.assertElement(this.firstChild.firstElementChild, { tagName: 'span' });

    this.runTask(() => this.rerender());

    this.assertElement(this.firstChild, { tagName: 'section' });
    this.assertElement(this.firstChild.firstElementChild, { tagName: 'span' });
  }
});
