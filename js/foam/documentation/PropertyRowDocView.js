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
  name: 'PropertyRowDocView',
  package: 'foam.documentation',
  extendsModel: 'foam.documentation.DocFeatureView',
  help: 'A view for documentation of each item in a list of properties.',

  templates: [
    function toInnerHTML() {/*
      <div id="scrollTarget_<%=this.data.name%>">
        <p><span class="feature-heading"><%=this.data.name%></span>
           <span class="feature-type">($$DOC{ref:this.data.type.replace('[]',''), text:this.data.type, acceptInvalid:true})</span></p>
        <p>$$documentation{ model_: 'foam.documentation.DocBodyView' }</p>
        <p class="inheritance-info">Declared in: $$overridesDAO{ model_: 'foam.documentation.TextualDAOListView', rowView: 'foam.documentation.DocFeatureOverridesRefView', model: this.X.foam.documentation.DocFeatureInheritanceTracker }</p>
      </div>
    */}
  ]
});
