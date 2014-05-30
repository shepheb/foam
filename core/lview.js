
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
      defaultValue: 0
    },
    {
      name: 'y',
      type: 'int',
      view: 'IntFieldView',
      defaultValue: 0
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
    init: function() {
      this.SUPER();
      var self = this;
      this.children.forEach(function(c) {
        c.parent = self;
      });
    },

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
    },

    // Given a containing element, will render this view and its children into
    // that element. That means performing layout() recursively, and then
    // paint().
    // NB: Sets position: relative on the containing element.
    render: function(container) {
      this.container = container;
      this.container.style.position = 'relative';

      this.layout();
      this.paint();
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

  properties: [
    {
      name: 'spacing',
      type: 'int',
      view: 'IntFieldView'
    }
  ],

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
        y += c.height + this.spacing;
      }

      this.width = this.parent.width;
      this.height = y - this.y - (this.children.length > 0 ? this.spacing : 0);
    }
  }
});

FOAModel({
  name: 'RowLView',
  extendsModel: 'LView',
  help: 'A layout LView whose children are placed in a row.',

  properties: [
    {
      name: 'spacing',
      type: 'int',
      view: 'IntFieldView'
    }
  ],

  methods: {
    layout: function() {
      // My x and y are inherited by the children. They are top-aligned and side
      // by side.
      // TODO: Spacing.
      // TODO: Alignment.

      var x = this.x;
      var y = this.y;

      for ( var i = 0 ; i < this.children.length ; i++ ) {
        var c = this.children[i];
        c.x = x;
        c.y = y;
        c.layout();
        x += c.width + this.spacing;
      }

      this.width = x - this.x - (this.children.length ? this.spacing : 0);
      this.height = this.parent.height;
    }
  }
});


