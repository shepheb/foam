/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

CLASS({
  name: 'SlidingCollectionView',
  package: 'foam.ui',
  extendsModel: 'View',
  traits: ['foam.ui.layout.PositionedDOMViewTrait'],

  requires: [
    'foam.ui.layout.ViewSlider',
    'foam.ui.layout.FloatingView'
  ],

  properties: [
    {
      model_: 'ArrayProperty',
      name: 'arr',
      lazyFactory: function() { return []; }
    },
    {
      model_: 'IntProperty',
      name: 'realIdx',
      defaultValue: -1,
      postSet: function(_, nu) {
        console.log('realIdx', nu);
      }
    },
    {
      model_: 'IntProperty',
      name: 'uiIdx',
      defaultValue: -1,
      postSet: function(_, nu) {
        console.log('uiIdx', nu);
      }
    },
    {
      model_: 'ArrayProperty',
      name: 'queuedListeners',
      lazyFactory: function() { return []; }
    },
    {
      name: 'slider',
      lazyFactory: function() { return this.ViewSlider.create(); },
      postSet: function(old, nu) {
        if ( old ) old.view$.removeListener(this.onSliderDone);
        if ( nu ) nu.view$.addListener(this.onSliderDone);
      }
    }
  ],

  constants: {
    EASE_ACCELERATION: 0.9
  },

  methods: {
    init: function() {
      this.SUPER();
      var self = this;
      this.X.dynamic(function() { self.width; self.height; }, this.layout);
    },
    maybeWrapView: function(view) {
      return view.model_.Z ? view : this.FloatingView.create({ view: view });
    },
    pushView_: function(view) {
      view = this.maybeWrapView(view);
      this.arr.push(view);
      console.log('arr', this.arr);
      this.propertyChange('arr', this.arr, this.arr);
      return view;
    },
    popView_: function() {
      return this.arr.pop() || '';
    },
    transitionView: function(view, opt_transition) {
      if ( opt_transition === 'none' ) {
        this.slider.setView(view);
        return;
      }
      this.slider.reverse = opt_transition === 'fromLeft';
      this.slider.slideView(view);
    },
    resetViews: function(view) {
      for ( var i = 0; i < this.arr.length; ++i ) {
        this.arr[i].destroy();
      }
      this.arr = [];
      console.log('arr', this.arr);
      this.realIdx = 0;
      this.uiIdx = 0;
      this.transitionView(this.pushView_(view), 'none');
    },
    enqueueListener: function(listenerName) {
      this.queuedListeners.push(listenerName);
      if ( this.queuedListeners.length === 1 ) this.maybeDequeueListener();
    },
    maybeDequeueListener: function() {
      if ( this.queuedListeners.length === 0 ) return;
      var listenerName = this.queuedListeners.shift();
      this[listenerName]();
    }
  },

  listeners: [
    {
      name: 'layout',
      code: function() {
        this.slider.x = 0;
        this.slider.y = 0;
        this.slider.width = this.width;
        this.slider.height = this.height;
      }
    },
    {
      name: 'onBack',
      code: function() {
        if ( this.uiIdx > 0 ) {
          this.uiIdx--;
          this.transitionView(this.arr[this.uiIdx], 'fromLeft');
        }
      }
    },
    {
      name: 'onForth',
      code: function() {
        if ( this.uiIdx < this.arr.length - 1 ) {
          this.uiIdx++;
          this.transitionView(this.arr[this.uiIdx]);
        }
      }
    },
    {
      name: 'onSliderDone',
      code: function() { this.maybeDequeueListener(); }
    }
  ],

  templates: [
    function toInnerHTML() {/* %%slider */}
  ],

  actions: [
    {
      name:  'goBack',
      label: '<',
      help:  'Go to previous view',

      isEnabled: function() {
        return this.realIdx > 0;
      },
      action: function() {
        this.realIdx--;
        this.enqueueListener('onBack');
      }
    },
    {
      name:  'goForth',
      label: '>',
      help:  'Go to next view.',
      isEnabled: function() {
        return this.realIdx < this.arr.length - 1;
      },
      action: function() {
        this.realIdx++;
        this.enqueueListener('onForth');
      }
    }
  ]
});
