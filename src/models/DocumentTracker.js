// src/models/DocumentTracker.js

export default class DocumentTracker {
  constructor({ id, title, status, updatedAt }) {
    this.id = id;
    this.title = title;
    this.status = status || "Pending";
    this.updatedAt = updatedAt ? new Date(updatedAt) : new Date();
  }

  toggleStatus() {
    this.status = this.status === "Completed" ? "Pending" : "Completed";
    this.updatedAt = new Date();
  }

  isCompleted() {
    return this.status === "Completed";
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      status: this.status,
      updatedAt: this.updatedAt.toISOString(),
    };
  }

  static fromJSON(raw) {
    return new DocumentTracker({
      id: raw.id,
      title: raw.title,
      status: raw.status,
      updatedAt: raw.updatedAt,
    });
  }
}