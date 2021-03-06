FOAModel({
  name: 'QIssueDetailView',
  extendsModel: 'DetailView',

  properties: [
    {
      name: 'model',
      factory: function() { return QIssue; }
    },
    {
      model_: 'BooleanProperty',
      name: 'saveEnabled',
      defaultValue: false
    },
    {
      name: 'QIssueCommentDAO'
    },
    {
      model_: 'DAOProperty',
      name: 'QIssueDAO'
    },
    {
      name: 'url'
    },
    {
      name: 'cursorView',
      factory: function() {
        return this.X.CursorView.create({data: this.X.Cursor.create()});
      }
    },
    {
      name: 'blockingView',
      factory: function() {
        return BlockView.create({
          ctx: this,
          property: QIssue.BLOCKING,
          ids: this.value.get().blocking});
      }
    },
    {
      name: 'blockedOnView',
      factory: function() {
        return BlockView.create({
          ctx: this,
          property: QIssue.BLOCKED_ON,
          ids: this.value.get().blockedOn});
      }
    },
    'newCommentView'
  ],

  listeners: [
    {
      name: 'onDAOUpdate',
      isMerged: 100,
      code: function() {
        if ( ! this.data ) return;
        if ( ! this.$ ) {
          this.QIssueDAO.unlisten(this.onDAOUpdate);
          return;
        }

        var self = this;
        this.QIssueDAO.find(this.data.id, {
          put: function(obj) {
            if ( obj.equals(self.data) ) return;
            self.saveEnabled = false;
            self.data.copyFrom(obj);
            self.newCommentView.issue = obj;
            self.saveEnabled = true;
          }
        });
      }
    },
    {
      name: 'doSave',
      code: function() {
        // Don't keep listening if we're no longer around.
        if ( ! this.$ ) throw EventService.UNSUBSCRIBE_EXCEPTION;

        if ( this.saveEnabled ) this.QIssueDAO.put(this.data);
      }
    }
  ],

  methods: {
    destroy: function() {
      if ( this.data ) this.data.removeListener(this.doSave);
      this.QIssueDAO.unlisten(this.onDAOUpdate);
    },

    init: function(args) {
      this.SUPER(args);
      this.QIssueDAO.listen(this.onDAOUpdate);
    },

    onValueChange_: function(_, _, old, v) {
      this.saveEnabled = false;

      if ( old ) old.removeListener(this.doSave);

      if ( v ) v.addListener(this.doSave);
      else if ( this.data ) this.data.addListener(this.doSave);
    },


    commentView: function() {
      return this.X.DAOListView.create({
        dao: this.QIssueCommentDAO,
        model: this.X.QIssueComment,
        rowView: 'QIssueCommentView'
      });
    },
    commentCreateView: function() {
      return this.newCommentView = this.X.QIssueCommentCreateView.create({
        dao: this.QIssueCommentDAO,
        issue: this.data
      });
    },
    clView: function() {
      return this.X.QIssueCLView.create({dao: this.QIssueCommentDAO});
    },
    toHTML: function() {
      return '<div id="' + this.id + '">' + this.toInnerHTML() + '</div>';
    },
    updateSubViews: function() {
      this.SUPER();
      this.saveEnabled = true;
    }
  },

  templates: [
    { name: 'toInnerHTML' }
  ]
});

FOAModel({
  name: 'QIssueLabelsView',
  extendsModel: 'View',

  properties: [
    {
      name: 'value',
      factory: function() { return SimpleValue.create([]); },
      postSet: function(oldValue, newValue) {
        oldValue && oldValue.removeListener(this.update);
        newValue.addListener(this.update);
        this.update();
      }
    }
  ],

  methods: {
    toHTML: function() { return '<div id="' + this.id + '"></div>'; },
    initHTML: function() { this.SUPER(); this.update(); },
    setValue: function(value) { this.value = value; }
  },

  listeners: [
    {
      name: 'update',
      animate: true,
      code: function() {
        if ( ! this.$ ) return;

        var value = this.value.get();
        var out = "";
        for ( var i = 0; i < value.length; i++ ) {
          var start = value[i].substring(0, value[i].indexOf('-') + 1);
          var rest = value[i].substring(value[i].indexOf('-') + 1);

          out += '<div><b>' +
            this.strToHTML(start) + '</b>' +
            this.strToHTML(rest) + '</div>';
        }
        this.$.innerHTML = out;
      }
    }
  ]
});


/**
 * Display a heirarchical Issue blocking/blocked-on list.
 * Draw the ID with style line-through if issue closed.
 * Display a TileView hover preview.
 **/
var BlockView = FOAM({
  model_: 'Model',
  name: 'QIssueQuickStatusView',
  extendsModel: 'View',

  properties: [
    {
      name: 'ctx'
    },
    {
      name: 'url',
      scope: 'ctx',
      defaultValueFn: function() { return this.ctx.url; }
    },
    {
      name: 'QIssueDAO',
      scope: 'ctx',
      defaultValueFn: function() { return this.ctx.QIssueDAO; }
    },
    {
      name: 'property',
      help: 'Property to recurse on.'
    },
    {
      name: 'idSet',
      help: "Set of Issue ID's that have already been seen.",
      factory: function() { return {}; }
    },
    {
      name: 'maxDepth',
      defaultValue: 3
    },
    {
      name: 'ids'
    }
  ],

  methods: {
    toHTML: function(opt_depth) {
      var s = '<div class="blockList">';

      for ( var i = 0 ; i < this.ids.length ; i++ ) {
        var issue = this.ids[i];
        var id = this.nextID();

        if ( this.idSet[issue] ) continue;

        this.idSet[issue] = id;

        var url = this.url + '/issues/detail?id=' + issue;

        s += '<div><a href="' + url + '" id="' + id + '">Issue ' + issue + '</a><div>';

        this.on('mouseover', this.startPreview.bind(this, issue), id);
        this.on('mouseout',  this.endPreview,                     id);
      }

      s += '</div>';

      return s;
    },

    initHTML: function() {
      this.SUPER();

      var self = this;

      for ( var i = 0 ; i < this.ids.length ; i++ ) {
        var id = this.ids[i];
        this.QIssueDAO.find(id, { put: function(issue) {
          if ( ! issue.isOpen() ) {
            $(self.idSet[id]).style.textDecoration = 'line-through';
          }
          if ( self.maxDepth > 1 ) {
            var ids = issue[self.property.name];

            if ( ids.length ) {
              var subView = self.clone().copyFrom({
                maxDepth: self.maxDepth-1,
                ids:      ids
              });
              $(self.idSet[id]).insertAdjacentHTML('afterend', '<div style="margin-left:10px;">' + subView.toHTML() + '</div>');
              subView.initHTML();
            }
          }
        }});
      }
    }
  },

  listeners: [
    {
      name: 'startPreview',
      code: function(id, e) {
        if ( this.currentPreview ) return;

        var self = this;
        this.QIssueDAO.find(id, { put: function(issue) {
          self.currentPreview = PopupView.create({
            x: e.x+30,
            y: e.y-20,
            view: QIssueTileView.create({
              issue: issue,
              browser: {url: ''}})
          });

          self.currentPreview.open(self.ctx);
        }});
      }
    },
    {
      name: 'endPreview',
      code: function() {
        if ( ! this.currentPreview ) return;
        this.currentPreview.close();
        this.currentPreview = null;
      }
    }
  ]
});
