/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

CLASS({
  package: 'foam.graphics.webgl',
  name: 'FlatVideo',
  extendsModel: 'foam.graphics.webgl.FlatObject',

  requires: [
    'foam.graphics.webgl.ArrayBuffer',
    'foam.graphics.webgl.Shader',
    'foam.graphics.webgl.Program',
    'foam.graphics.webgl.ScaleMatrix4',
  ],

  properties: [
    {
      name: 'src',
      label: 'Source',
      postSet: function() {
        this.$video = this.X.document.createElement('video');
        this.$video.src = 'Google in Waterloo Region - Ontario  Canada.mp4'
        this.$video.preload = true;
        this.$video.autoplay = true;
      }
    },
    {
      name: '$video'
    },
    {
      name: 'translucent',
      defaultValue: false
    },

  ],

  methods: [
    function init() {
      this.SUPER();

      this.mesh = this.ArrayBuffer.create({
        drawMode: 'triangle strip',
        vertices: [
          1.0, 1.0, 0.0,
          0.0, 1.0, 0.0,
          1.0, 0.0, 0.0,
          0.0, 0.0, 0.0
        ]
      });
      this.textureCoords = this.mesh;

    },

    function textureSource() {
      /* return the image or video element to extract the texture from */
      return this.$video;
    },

    function paintSelf(translucent) {
      if ( this.translucent !== translucent ) return;

      if ( ! this.$video ) return;

      this.render();

      this.SUPER(translucent);

    },

    function destroy() {
      if ( this.$video ) {
        this.$video.pause();
        this.$video = null;
        this.texture = null;
      }
    }
  ]
});
