import '@testing-library/jest-dom';

// Mock window.HTMLMediaElement
Object.defineProperty(window, 'HTMLMediaElement', {
  writable: true,
  value: class {
    constructor() {
      this.play = jest.fn();
      this.pause = jest.fn();
    }
  }
});
