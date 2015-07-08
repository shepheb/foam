/*
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
   package: "foam.ui.layout",
   name: "FloatingView",
   extendsModel: "foam.ui.View",
   traits: [ "foam.ui.layout.PositionedDOMViewTrait" ],
   properties: [
      {
         "model_": "Property",
         "name": "view"
      },
      {
         "model_": "Property",
         "name": "width",
         "defaultValue": 300
      },
      {
        "name": "preferredWidth",
        "defaultValueFn": function() {
          return this.view.preferredWidth;
        }
      },
      {
         "model_": "Property",
         "name": "height",
         "defaultValue": 300
      },
      {
         "model_": "Property",
         "name": "className",
         "defaultValue": "floatingView"
      }
   ],
   methods: [
     function destroy() {
       this.SUPER();
       this.view.destroy && this.view.destroy();
     }
   ],
   templates: [
      {
         name: "toInnerHTML",
         template: " %%view "
      }
   ]
});
