
// An abstract manual-layout view (LView).
// These are ultimately DOM elements, but using absolute positioning and custom
// layout rules.
//
// The general layout algorithm is a tree of elements with their children.
// These elements can be abstract LViews like RowLayout and ColumnLayout,
// which have no existence in the DOM, or they can be actual DOM elements,
// like the TextFieldLView or BackgroundLView (for testing).
FOAModel({
  name: 'LView',
  label: 'LView',

  properties: [
    {
      name: 'parent',
      type: 'LView',
      hidden: true
    },
    {
      name: 'x',
      type: 'int',
      view: 'IntFieldView',
      defaultValue: 5
    },
    {
      name: 'y',
      type: 'int',
      view: 'IntFieldView',
      defaultValue: 5
    },
    {
      name: 'width',
      type: 'int',
      view: 'IntFieldView',
      defaultValue: 100
    },
    {
      name: 'height',
      type: 'int',
      view: 'IntFieldView',
      defaultValue: 100
    },
    {
      name: 'children',
      type: 'CView[]',
      factory: function() { return []; },
      hidden: true
    },
    {
      name: 'container',
      label: 'The element to render into.',
      defaultValueFn: function() {
        if ( this.parent ) return this.parent.container;
        else return document.body;
      }
    }
  ],

  listeners: [
  ],

  methods: {
    addChild: function(child) {
      this.children.push(child);
      child.parent = this;
      return this;
    },

    removeChild: function(child) {
      this.children.deleteI(child);
      child.parent = undefined;
      return this;
    },

    // Responsible for updating the layout of this element and all children.
    // This element's x and y should already have been set by the parent.
    // When I'm finished, all the children should have their x and y set, and
    // their own layouts called. Finally this element's width and height are
    // set to accomodate the children.
    layout: function() { },

    // Actually "paints" by rendering DOM elements for this node and its
    // children.
    // The default implementation paints nothing for this element, and just
    // recursively paints the children. This is sufficient for abstract LViews
    // without any DOM nodes of their own, but which are responsible for laying
    // out their children.
    paint: function() {
      this.children.forEach(function(c) { c.paint(); });
    }
  }
});

FOAModel({
  name: 'DOMLView',
  extendsModel: 'LView',
  help: 'Abstract base class for LViews which correspond with DOM nodes',

  properties: [
    {
      name: '$',
      help: 'The DOM element for this view.'
    },
    {
      name: 'tagName',
      help: 'The tag to be used. Defaults to div.',
      defaultValue: 'div'
    }
  ],

  methods: {
    paint: function() {
      if ( ! this.$ ) {
        this.$ = document.createElement(this.tagName);
        this.$.style.position = 'absolute';
      }

      this.$.style.left   = this.x + 'px';
      this.$.style.top    = this.y + 'px';
      this.$.style.width  = this.width + 'px';
      this.$.style.height = this.height + 'px';

      this.container.appendChild(this.$);
    }
  }
});

FOAModel({
  name: 'BackgroundLView',
  extendsModel: 'DOMLView',
  help: 'A testing LView. Creates a <div> with the given background color.',

  properties: [
    {
      name: 'background',
      defaultValue: 'white'
    }
  ],

  methods: {
    paint: function() {
      this.SUPER();
      this.$.style.backgroundColor = this.background;
    }
  }
});

FOAModel({
  name: 'ColumnLView',
  extendsModel: 'LView',
  help: 'A layout LView, which places its children adjacent to each other ' +
    'in a full-width vertical column.',

  methods: {
    layout: function() {
      // My x and y are inherited by the children.
      // They are currently laid out left-aligned in a full-width column.
      // TODO: Spacing between elements.
      // TODO: Alignment options.

      var x = this.x;
      var y = this.y;

      for ( var i = 0 ; i < this.children.length ; i++ ) {
        var c = this.children[i];
        c.x = x;
        c.y = y;
        c.layout();
        y += c.height;
      }

      this.width = this.parent.width;
      this.height = y - this.y;
    }
  }
});


