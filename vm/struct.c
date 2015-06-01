#include <struct.h>
#include <scalar.h>

// Native C implementations of arrays and maps.

/*
Array
properties:
- raw (internal only, no accessors. slot 0)
- size (real number of elements. read only. slot 1)
- capacity (space allocated in raw. read only. slot 2)

methods:
- object fetch(index)
- void store(index, obj)
*/

#define ARRAY_SLOT_RAW (0)
#define ARRAY_SLOT_SIZE (1)
#define ARRAY_SLOT_CAPACITY (2)

array* array_get_raw(object* self) {
  return (array*) array_fetch(self->data, ARRAY_SLOT_RAW);
}


void array_prop_size_get(vm_state* st, object* self) {
  array* raw = array_get_raw(self);
  // TODO(braden): Numeric object
  vm_push(st, (object*) raw->length);
}

void array_prop_capacity_get(vm_state* st, object* self) {
  array* raw = array_get_raw(self);
  // TODO(braden): Numeric object
  vm_push(st, (object*) raw->capacity);
}

void array_method_fetch(vm_state* st, object* self) {
  array* raw = array_get_raw(self);
  unsigned int index = (unsigned int) vm_pop(st);
  vm_push(st, (object*) array_fetch(raw, index));
}

void array_method_store(vm_state* st, object* self) {
  array* raw = array_get_raw(self);
  unsigned int index = (unsigned int) vm_pop(st);
  void* value = (void*) vm_pop(st);
  array_store(raw, index, value);
}


void bootstrap_array(object* modelArray) {
  // START HERE: This is a troublesome part I keep circling around.
  // Specifically, how to bootstrap the fundamental models properly.
  // They need properties and methods arrays loaded with Feature specs.
  // But they also need their handwritten implementations loaded in their slots.
  // The map one below is all messed up, don't look at it, really.
  //
  // Idea: Use a helper function to create Property and Method instances,
  // specifying the slots manually that would normally be assigned by
  // Model.create.
  //
  // I can have a constant MODEL_NEXT_SLOT to base these specific slot numbers
  // on. Then the properties and methods array slots are MODEL_SLOT_PROPERTIES
  // and MODEL_SLOT_METHODS, and then custom slots on this model begin at
  // MODEL_NEXT_SLOT, MODEL_NEXT_SLOT + 1, ...
  //
  // I think that will work, but I'm tired enough that I can't piece it together
  // right now.
  //
  // Actually, better idea. Write array_append, which uses the current length.
  // Then it doesn't matter how many entries were added by Model.create, I just
  // put mine after. That should work out neatly.
  //
  // Also to think about: In this slot-driven world, how does getFeature() and
  // dynamic calls work? (First thought: getFeature does the same scan by name
  // as always. Dynamic calls do a getFeature, and on getting the Feature they
  // look up its slot number and then follow a normal message send.
  //
  // Yet another thing to think about: Inheritance! That plays a part in all of
  // this. Subclasses number their new slots starting after their parent class,
  // that's straightforward enough. They can override methods and things by
  // using the same slot number. How to handle SUPER (parallel opcode to SELF,
  // I think, but what does it actually do?)
}

/*
Map
properties:
- size (no slot, computed)
- raw (internal map, no accessors. slot 0)

methods:
- object fetch(key)
- void store(key, obj)
- void delete(key)
- void clear()
*/

#define MAP_SLOT_RAW 0

map* map_get_raw(object* self) {
  return (map*) array_fetch(self->data, MAP_SLOT_RAW);
}

void map_prop_size_get(vm_state* st, object* self) {
  // Counts the length of a map.
  map* raw = map_get_raw(self);
  unsigned int count = 0;
  node* n = raw->head;
  while (n != NULL) {
    count++;
    n = n->next;
  }

  vm_push(st, (void*) count);
}

void map_method_fetch(vm_state* st, object* self) {
  map* raw = map_get_raw(self);
  object* keyObj = vm_pop(st);
  unsigned char* keyString = string_get_raw(keyObj);
  void* value = map_lookup(raw, keyString);
  vm_push(st, (object*) value);
}

void map_method_store(vm_state* st, object* self) {
  map* raw = map_get_raw(self);
  object* keyObj = vm_pop(st);
  object* value = vm_pop(st);
  unsigned char* keyString = string_get_raw(keyObj);
  map_insert(raw, keyString, value);
}

void map_method_delete(vm_state* st, object* self) {
  map* raw = map_get_raw(self);
  object* keyObj = vm_pop(st);
  unsigned char* keyString = string_get_raw(keyObj);
  map_delete(raw, keyString);
}

void map_method_clear(vm_state* st, object* self) {
  map* raw = map_get_raw(self);
  node* n = raw->head;
  while (n != NULL) {
    node* next = n->next;
    free(n);
    n = next;
  }
  raw->head = NULL;
}


void bootstrap_map(object* modelMap) {
  map* d = modelMap->data;
  map_insert(d, map_hash("size@"), &map_prop_size_get);
  map_insert(d, map_hash("fetch"), &map_method_fetch);
  map_insert(d, map_hash("store"), &map_method_store);
  map_insert(d, map_hash("delete"), &map_method_delete);
  map_insert(d, map_hash("clear"), &map_method_clear);

  object* propertiesArray = rawInstance(modelArray);
  object* rawFeature = rawModel(modelProperty, "raw");
  // TODO(braden): Maybe wrap this into a Number object?
  array_store(rawFeature->data, FEATURE_SLOT_SLOT, (void*) MAP_SLOT_RAW);
  // TODO(braden): This is messed up. Fix it after I make sense of arrays.
  array_store(propertiesArray->data, MODEL_SLOT_PROPERTIES, rawFeature);
}

// create is invoked with eg. Point model as receiver. Therefore create() is
// looked up on Model. That same call is used for Model.create, since
// Model.model_ is Model.
// That means that single chunk of code has to do all the legwork. There should
// be a method for overriding the default create behavior where necessary. But
// I don't think it's necessary here - I just need to set up the system
// properly.
//
// Model.create will walk its properties and models arrays, examining features.
// Those features have build() methods it should invoke to prepare the new
// model.

