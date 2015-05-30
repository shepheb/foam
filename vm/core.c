// Fundamental types like Feature and Model are defined in here.
// These are magical, and use C code to bootstrap themselves inside the VM.

// Notional FOAM model specs for each are given.
/*
MODEL({
  name: 'Feature',
  properties: [
    {
      name: 'name',
      type: 'String',
      required: true
    },
    {
      name: 'instanceSlotsRequired',
      defaultValue: 0,
      documentation: 'The number of slots required on instances for this feature.'
    },
    {
      name: 'instanceSlotStartNumber',
      documentation: 'The index into instances of the first slot for this feature.'
    },
    {
      name: 'modelSlotsRequired',
      type: 'unsigned int',
      documentation: 'The number of slots required on the model to hold this feature.',
    },
    {
      name: 'modelSlotNumber',
      type: 'unsigned int',
      documentation: 'The number of slots required on the model to hold this feature.',
    },
  ],
  methods: {
    install: function(args, X) { I set up the data slot properly on new instances. }
  }
});


Methods install one slot in the model that reads their code pointer onto the
stack.
Properties install two slots in the model that read and write their data slot,
which they need to install into each instance.

Features have both static model-level work to do, and dynamic instance-level work to do.

I haven't quite pinned down how both should work, yet. Let's imagine we're
compiling a simple model with a single method on it. While compiling, we construct
a Method (subclass of Feature) for our method, with a code pointer. We install the
Feature into the model by adding a slot for it. Model.create, like any create(), 
is running install() on its features, setting up the instance. That instance is
MyModel, and so Method.install() should copy the address of its code into a slot.

Let's just think about creating an instance of an already-extant model.
If it doesn't have the slot count cached, it walks the features once to collect
a count of data slots needed. Then it walks them again, calling install with the
Feature as the receiver and passing the argument map, context and instance.

When creating a new Model, the position is similar. It walks the Features, here
meaning the features of Model, (properties) and (methods) etc., asking how much
space they need in the instance (the specific new Model). They answer based on
how many of each of them there are.

That raises an interesting point: it may not be known until the arguments are
seen how many slots will be required. That might dent the whole concept of slots
somewhat... FOAM/JS gets around this by just using JS objects (this.instance_)
as the fundamental object. Is this a unique property to creating Models? If so,
that sucks, and I shouldn't make models a special case.

Alright, slots are not really workable here, then. I'm falling back on a pointer
in each object to its instance data. That takes the form of a map, indexed by
hashed strings. An efficient implementation of this is going to be important,
but optimizing it heavily can wait.

