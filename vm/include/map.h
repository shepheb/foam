#ifndef MAP_H
#define MAP_H

#include <stdint.h>
#include <stdlib.h>

// TODO(braden): More efficient implementation. Currently it's a sorted linked
// list.
typedef struct _node {
  uint32_t key;
  void* value;
  struct _node *next;
} node;

typedef struct _map {
  node* head;
} map;

void  map_insert(map* self, uint32_t key, void* value);
void* map_lookup(map* self, uint32_t key);
void* map_delete(map* self, uint32_t key);

#endif // MAP_H
