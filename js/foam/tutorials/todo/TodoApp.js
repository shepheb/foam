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
  package: 'foam.tutorials.todo',
  name: 'TodoApp',
  extendsModel: 'foam.ui.DetailView',
  requires: [
    'foam.dao.EasyDAO',
    'foam.mlang.CannedQuery',
    'foam.tutorials.todo.Controller',
    'foam.tutorials.todo.model.Todo',
    'foam.tutorials.todo.ui.TodoCitationView',
    'foam.ui.TextFieldView',
  ],

  properties: [
    {
      name: 'cannedQueryDAO',
      factory: function() {
        return [
          this.CannedQuery.create({ label: 'Todo', expression: TRUE }),
          this.CannedQuery.create({
            label: 'Completed',
            expression: EQ(this.Todo.COMPLETED, true)
          })
        ].dao;
      }
    },
    {
      name: 'dao',
      factory: function() {
        return this.EasyDAO.create({
          model: this.Todo,
          daoType: 'LOCAL',
          seqNo: true
        });
      }
    },
    {
      name: 'data',
      factory: function() {
        return this.Controller.create({
          dao: this.dao,
          cannedQueryDAO: this.cannedQueryDAO,
        });
      }
    },
    {
      name: 'newTodo',
      view: {
        factory_: 'foam.ui.TextFieldView',
        placeholder: 'Create new todo',
      },
      postSet: function(old, nu) {
        nu = nu ? nu.trim() : '';
        if ( ! nu ) return;
        this.dao.put(this.Todo.create({ description: nu }));
        this.newTodo = '';
      },
    },
    {
      name: 'className',
      defaultValue: 'todo-app'
    },
  ],

  templates: [
    function CSS() {/*
      .todo-app {
      }
      .menu {
      }
      .search {
      }
      .new-todo {
      }
      .todo-list {
      }
    */},
    function toHTML() {/*
      <div id="<%= this.id %>" <%= this.cssClassAttr() %>>
        <div class="menu">
          $$cannedQueryDAO
        </div>
        <div class="main">
          <div class="search">
            $$search{ placeholder: 'Search' }
          </div>
          <div class="new-todo">
            $$newTodo{ updateMode: this.TextFieldView.ENTER_ONLY }
          </div>
          <div class="todo-list">
            $$filteredDAO{ rowView: 'foam.tutorials.todo.ui.TodoCitationView' }
          </div>
        </div>
      </div>
    */},
  ],
});
