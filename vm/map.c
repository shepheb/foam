#include <map.h>

void node_insert(node* self, uint32_t key, void* value) {
  if (key == self->key) {
    self->value = value;
  } else if (key < self->key) {
    // Replace this node in-place, and create a new one after it for the
    // old values.
    node* newNode = (node*) malloc(sizeof(node));
    newNode->key = self->key;
    newNode->value = self->value;
    newNode->next = self->next;

    self->next = newNode;
    self->key = key;
    self->value = value;
  } else {
    if (self->next == NULL) {
      node* newNode = (node*) malloc(sizeof(node));
      newNode->key = key;
      newNode->value = value;
      newNode->next = NULL;
      self->next = newNode;
    } else {
      node_insert(self->next, key, value);
    }
  }
}

void map_insert(map* self, uint32_t key, void* value) {
  if (self->head == NULL) {
    node* n = (node*) malloc(sizeof(node));
    n->key = key;
    n->value = value;
    n->next = NULL;
    self->head = n;
  } else {
    node_insert(self->head, key, value);
  }
}

void* node_lookup(node* self, uint32_t key) {
  if (self == NULL) return NULL;
  if (key == self->key) return self->value;
  if (key < self->key) return NULL;
  return self->next == NULL ? NULL : node_lookup(self->next, key);
}

void* map_lookup(map* self, uint32_t key) {
  if (self == NULL || self->head == NULL) return NULL;
  return node_lookup(self->head, key);
}


void* node_delete(node* self, uint32_t key) {
  // Actually looking at the next entry, not this one.
  node* n = self->next;
  if (n == NULL) return NULL;
  if (n->key < key) return node_delete(n, key);
  if (n->key > key) return NULL;

  self->next = n->next;
  void* value = n->value;
  free(n);
  return n->value;
}

void* map_delete(map* self, uint32_t key) {
  if (self == NULL || self->head == NULL) return NULL;
  if (self->head->key == key) {
    node* n = self->head;
    self->head = n->next;
    void* value = n->value;
    free(n);
    return value;
  } else if (self->head->key > key) {
    return NULL;
  } else {
    return node_delete(self->head, key);
  }
}

