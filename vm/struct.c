#include <struct.h>
#include <scalar.h>

// Native C implementations of arrays and maps.

/*
Map
properties:
- size
- raw (internal map, no accessors)

methods:
- object fetch(key)
- void store(key, obj)
- void delete(key)
- void clear()
*/

map* map_get_raw(object* self) {
  return (map*) map_lookup(self->data, map_hash("raw"));
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
  object* value = map_lookup(raw, map_hash(keyString));
  vm_push(st, value);
}

void map_method_store(vm_state* st, object* self) {
  map* raw = map_get_raw(self);
  object* keyObj = vm_pop(st);
  object* value = vm_pop(st);
  unsigned char* keyString = string_get_raw(keyObj);
  map_insert(raw, map_hash(keyString), value);
}

void map_method_delete(vm_state* st, object* self) {
  map* raw = map_get_raw(self);
  object* keyObj = vm_pop(st);
  unsigned char* keyString = string_get_raw(keyObj);
  map_delete(raw, map_hash(keyString));
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

// Passed the receiver, which is the model. Returns a new instance.
void map_method_create(vm_state* st, object* self) {
  // Allocate a new instance of self.
  object* nu = rawInstance(self);
  // And a fresh map.
  map* raw = (map*) malloc(sizeof(map));
  // To store in raw.
  map_insert(nu->data, map_hash("raw"), raw);

  // Create always takes an initializer, even if it's empty.
  (void) vm_pop(st);
  vm_push(st, nu);
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
  map_insert(rawFeature->data, map_hash("properties")
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

