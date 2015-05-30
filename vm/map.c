#include <map.h>

void node_insert(node* self, uint32_t hash, unsigned char* key, void* value) {
  int cmp;
  if (hash < self->hash) cmp = -1;
  else if (hash > self->hash) cmp = 1;
  else cmp = strcmp(key, self->key);

  if (cmp < 0) {
    // Replace this node in-place, and create a new one after it for the
    // old values.
    node* newNode = (node*) malloc(sizeof(node));
    newNode->key = self->key;
    newNode->hash = self->hash;
    newNode->value = self->value;
    newNode->next = self->next;

    self->next = newNode;
    self->hash = hash;
    self->key = key;
    self->value = value;
  } else if (cmp == 0) {
    self->value = value;
  } else { // cmp > 0
    if (self->next == NULL) {
      node* newNode = (node*) malloc(sizeof(node));
      newNode->hash = hash;
      newNode->key = key;
      newNode->value = value;
      newNode->next = NULL;
      self->next = newNode;
    } else {
      node_insert(self->next, hash, key, value);
    }
  }
}

void map_insert(map* self, unsigned char* key, void* value) {
  uint32_t hash = map_hash(key);
  if (self->head == NULL) {
    node* n = (node*) malloc(sizeof(node));
    n->hash = hash;
    n->key = key;
    n->value = value;
    n->next = NULL;
    self->head = n;
  } else {
    node_insert(self->head, hash, key, value);
  }
}

void* node_lookup(node* self, uint32_t hash, unsigned char* key) {
  if (self == NULL) return NULL;

  int cmp;
  if (hash < self->hash) cmp = -1;
  else if (hash > self->hash) cmp = 1;
  else cmp = strcmp(key, self->key);

  if (cmp < 0) return NULL;
  if (cmp == 0) return self->value;
  return self->next == NULL ? NULL : node_lookup(self->next, hash, key);
}

void* map_lookup(map* self, unsigned char* key) {
  if (self == NULL || self->head == NULL) return NULL;
  return node_lookup(self->head, map_hash(key), key);
}


void* node_delete(node* self, uint32_t hash, unsigned char* key) {
  // Actually looking at the next entry, not this one.
  node* n = self->next;
  if (n == NULL) return NULL;

  int cmp;
  if (hash < self->hash) cmp = -1;
  else if (hash > self->hash) cmp = 1;
  else cmp = strcmp(key, self->key);

  if (cmp > 0) return node_delete(n, hash, key);
  if (cmp < 0) return NULL;

  self->next = n->next;
  void* value = n->value;
  free(n);
  return n->value;
}

void* map_delete(map* self, unsigned char* key) {
  if (self == NULL || self->head == NULL) return NULL;

  uint32_t hash = map_hash(key);
  int cmp;
  if (hash < self->head->hash) cmp = -1;
  else if (hash > self->head->hash) cmp = 1;
  else cmp = strcmp(key, self->head->key);

  if (cmp == 0) {
    node* n = self->head;
    self->head = n->next;
    void* value = n->value;
    free(n);
    return value;
  } else if (cmp < 0) {
    return NULL;
  } else {
    return node_delete(self->head, hash, key);
  }
}


map* map_new(void) {
  map* self = (map*) malloc(sizeof(map));
  self->head = NULL;
  return self;
}

void map_destroy(map* self) {
  node* n = self->head;
  while (n != NULL) {
    node* next = n->next;
    free(n);
    n = next;
  }
  free(self);
}


uint32_t map_hash(unsigned char* str) {
  uint32_t hash = 5381;
  int c;
  while (c = *str++)
    hash = ((hash << 5) + hash) + c;

  return hash;
}
