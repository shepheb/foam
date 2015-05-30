#ifndef MAP_H
#define MAP_H

#include <stdint.h>
#include <stdlib.h>

// TODO(braden): More efficient implementation. Currently it's a sorted linked
// list.
typedef struct _node {
  uint32_t hash;
  unsigned char* key;
  void* value;
  struct _node *next;
} node;

typedef struct _map {
  node* head;
} map;

void  map_insert(map* self, unsigned char* key, void* value);
void* map_lookup(map* self, unsigned char* key);
void* map_delete(map* self, unsigned char* key);

map* map_new(void);
void map_destroy(map* self);

uint32_t map_hash(unsigned char* str);

#endif // MAP_H
