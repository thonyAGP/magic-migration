import { describe, it, expect } from 'vitest';

/** Circular buffer for SSE event history. */
class SSEBuffer<T = unknown> {
  private buffer: T[] = [];
  private maxSize: number;

  constructor(maxSize = 2000) {
    this.maxSize = maxSize;
  }

  push(event: T): void {
    this.buffer.push(event);
    if (this.buffer.length > this.maxSize) {
      this.buffer.shift();
    }
  }

  getAll(): T[] {
    return [...this.buffer];
  }

  getLast(n: number): T[] {
    return this.buffer.slice(-n);
  }

  size(): number {
    return this.buffer.length;
  }

  clear(): void {
    this.buffer = [];
  }
}

describe('SSEBuffer', () => {
  it('should store events up to maxSize', () => {
    const buf = new SSEBuffer(3);
    buf.push('a');
    buf.push('b');
    buf.push('c');
    expect(buf.size()).toBe(3);
    expect(buf.getAll()).toEqual(['a', 'b', 'c']);
  });

  it('should evict oldest events when full', () => {
    const buf = new SSEBuffer(3);
    buf.push('a');
    buf.push('b');
    buf.push('c');
    buf.push('d');
    expect(buf.size()).toBe(3);
    expect(buf.getAll()).toEqual(['b', 'c', 'd']);
  });

  it('should return last N events', () => {
    const buf = new SSEBuffer(10);
    for (let i = 0; i < 10; i++) buf.push(i);
    expect(buf.getLast(3)).toEqual([7, 8, 9]);
  });

  it('should handle clear', () => {
    const buf = new SSEBuffer(10);
    buf.push(1);
    buf.push(2);
    buf.clear();
    expect(buf.size()).toBe(0);
    expect(buf.getAll()).toEqual([]);
  });

  it('should use default maxSize of 2000', () => {
    const buf = new SSEBuffer();
    for (let i = 0; i < 2500; i++) buf.push(i);
    expect(buf.size()).toBe(2000);
    expect(buf.getAll()[0]).toBe(500);
  });
});
