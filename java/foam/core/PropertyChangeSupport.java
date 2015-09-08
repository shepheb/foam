package foam.core;

/**
 * Interface for objects (especially {@link FObject}) which support property change notifications.
 */
public interface PropertyChangeSupport {
  <T> void addPropertyChangeListener(Property prop, PubSubListener<ValueChangeEvent<T>> listener);
  <T> void removePropertyChangeListener(Property prop, PubSubListener<ValueChangeEvent<T>> listener);
  <T> void firePropertyChange(Property prop, T oldValue, T newValue);
}
