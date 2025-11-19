// =============================================================================
// BASE WIDGET - Abstract base class for all widgets
// =============================================================================
export class BaseWidget {
  constructor(type) {
    this.type = type;
    this.id = `${type}_${Date.now()}`;
    this.isInitialized = false;
  }

  init() {
    this.isInitialized = true;
  }

  destroy() {
    this.isInitialized = false;
  }

  getHTML() {
    throw new Error('getHTML method must be implemented');
  }
}