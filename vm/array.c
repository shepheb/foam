#include <array.h>

#define ARRAY_DEFAULT_SIZE (8)

void* array_fetch(array* self, unsigned int index) {
  if (index < self->length) return self->a[index];
  return NULL;
}

void array_store(array* self, unsigned int index, void* value) {
  if (index >= self->capacity) { // Resize needed
    unsigned int newCap = self->capacity;
    while (index >= newCap)
      newCap = newCap << 1;
    array_resize(self, newCap);
  }

  // Now there's enough space.
  if (index >= self->length) {
    // NULL out all the intervening cells.
    for (unsigned int i = self->length; i <= index; i++) {
      self->a[i] = NULL;
    }
    self->length = index + 1;
  }
  self->a[index] = value;
}

// Doesn't support shrinking, only growing.
void array_resize(array* self, unsigned int newCap) {
  if (newCap <= self->capacity) return; // Nothing to do.

  void** nu = (void**) malloc(newCap * sizeof(void*));
  for (unsigned int i = 0; i < self->length; i++) {
    nu[i] = self->a[i];
  }
  free(self->a);
  self->a = nu;
  self->capacity = newCap;
}


array* array_new(void) {
  array* nu = (array*) malloc(sizeof(array));
  nu->length = 0;
  nu->capacity = ARRAY_DEFAULT_SIZE;
  nu->a = (void**) malloc(ARRAY_DEFAULT_SIZE * sizeof(array));
  return nu;
}

void array_destroy(array* self) {
  free(self->a);
  free(self);
}
