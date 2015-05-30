// Fundamental types like Feature and Model are defined in here.
// These are magical, and use C code to bootstrap themselves inside the VM.

#include <model.h>
#include <map.h>
#include <array.h>
#include <scalar.h>
#include <struct.h>

/*
Notional FOAM model specs for each are given.

MODEL({
  name: 'Feature',
  properties: [
    {
      name: 'name',
      type: 'String',
      required: true
    },
  ],
  methods: {
    install: function(obj, args, X) {
      I set up the data slot properly on new instances.
    },
    build: function(model) {
      I set up the model-level slots at model construction time.
    }
  }
});


Methods install one slot in the model that reads an activation record onto the
stack. This is essentially a binding of a receiver and the method's code, a
closure which can be called later on.

Properties install two slots in the model that read and write their data slot.

Features have both static model-level work to do, and dynamic instance-level
work to do, the code for which lives in build and install respectively.

Model.create should be minimally special. I just need to write custom build
and install code for properties, methods, and so on.

create is an interesting problem, still. It's called with the Model as receiver.
What values need I put on a Model to get it to be constructable.

*/

object* modelModel;
object* modelFeature;
object* modelMethod;
object* modelProperty;
object* modelString;
object* modelNumber;
object* modelArray;
object* modelMap;

UID nextUID = 1;


object* rawInstance(object* model) {
  object* nu = (object*) malloc(sizeof(object));
  nu->uid = nextUID++;
  nu->model_ = model;
  nu->data = array_new();
  return nu;
}

object* rawModel(object* model, unsigned char* name) {
  object* nu = rawInstance(model);
  object* nameString = rawInstance(modelString);
  array_insert(nameString->data, STRING_SLOT_RAW, name);
  array_insert(nu->data, MODEL_SLOT_NAME, nameString);
}

void bootstrap(void) {
  // MODEL is the most fundamental model, naturally.
  modelModel = rawInstance(NULL);
  modelModel->model_ = modelModel;

  modelString = rawModel(modelModel);

  // Set Model's name.
  object* nameModel = rawInstance(modelString);
  array_insert(nameModel->data, STRING_SLOT_RAW, "Model");
  array_insert(modelModel->data, MODEL_SLOT_NAME, nameModel);

  // And String's name.
  object* nameString = rawInstance(modelString);
  array_insert(nameString->data, STRING_SLOT_RAW, "String");
  array_insert(modelString->data, MODEL_SLOT_NAME, nameString);

  // Now the basics are in place, so now spin up the others,
  // Feature, Model, and more.
  modelMap = rawModel(modelModel, "Map");
  modelArray = rawModel(modelModel, "Array");



  // Construct FEATURE
}

