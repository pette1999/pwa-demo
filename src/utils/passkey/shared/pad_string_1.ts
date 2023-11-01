import { Buffer } from 'buffer';

export function padString(input: string): string {
  var segmentLength = 4;
  var stringLength = input.length;
  var diff = stringLength % segmentLength;
  if (!diff) {
    return input;
  }
  var position = stringLength;
  var padLength = segmentLength - diff;
  var paddedStringLength = stringLength + padLength;
  var buffer = Buffer.alloc(paddedStringLength);
  buffer.write(input);
  while (padLength--) {
    buffer.write("=", position++);
  }
  return buffer.toString();
}