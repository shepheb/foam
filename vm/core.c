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

