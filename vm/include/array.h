#ifndef ARRAY_H
#define ARRAY_H

#include <stdlib.h>

typedef struct _array {
  unsigned int length;
  unsigned int capacity;
  void** a;
} array;

void* array_fetch(array* self, unsigned int index);
void  array_store(array* self, unsigned int index, void* value);

// Intended to be internal, but may be useful elsewhere for pre-sizing.
void  array_resize(array* self, unsigned int newCap);

array* array_new(void);
void array_destroy(array* self);

#endif // ARRAY_H
