var QIssueCommentAuthorView = FOAM({
  model_: 'Model',
  name: 'QIssueCommentAuthorView',
  extendsModel: 'DetailView',

  properties: [
    { name: 'model', defaultValue: IssuePerson }
  ],

  methods: {
    updateSubViews: function() {
      this.SUPER();
      if ( ! this.$ ) return;
      this.$.firstElementChild.href = this.get().htmlLink;
    }
  },

  templates: [
    { name: 'toHTML' }
  ]
});
