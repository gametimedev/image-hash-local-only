# Image Hash Local Only

This project is a fork of the original image-hash project, modified to work only with local images. Remote image support has been removed.

## Installation

```bash
npm install image-hash-local-only
```

## Usage

### imageHash

The `imageHash` function computes the hash of a local image file or buffer.

```typescript
import { imageHash } from './src/index';

const imagePath = 'path/to/image.png';
const bits = 16;
const precise = true;

imageHash(imagePath, bits, precise, (err, hash) => {
  if (err) {
    console.error(err);
  } else {
    console.log(hash);
  }
});
```

### hammingDistance

The `hammingDistance` function calculates the Hamming distance between two hashes.

```typescript
import { hammingDistance } from './src/index';

const hash1 = '1010101010101010';
const hash2 = '1010101010101000';

const distance = hammingDistance(hash1, hash2);
console.log(distance); // Output: 1
```

## Notes

- This fork only supports local images.
- Supported image formats: PNG, JPEG, and WebP.
