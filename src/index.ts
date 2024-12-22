import fs from 'fs';
import { Buffer } from 'buffer';
import fileType from 'file-type';
import jpeg from 'jpeg-js';
import { PNG } from 'pngjs';
import webp from '@cwasm/webp';
import blockhash from './block-hash';


export interface BufferObject {
  ext?: string,
  data: Buffer,
  name?: string
}

const processPNG = (data, bits, method, cb) => {
  try {
    const png = PNG.sync.read(data);
    const res = blockhash(png, bits, method ? 2 : 1);
    cb(null, res);
  } catch (e) {
    cb(e);
  }
};

const processJPG = (data, bits, method, cb) => {
  try {
    const decoded = jpeg.decode(data);
    const res = blockhash(decoded, bits, method ? 2 : 1);
    cb(null, res);
  } catch (e) {
    cb(e);
  }
};

const processWebp = (data, bits, method, cb) => {
  try {
    const decoded = webp.decode(data);
    const res = blockhash(decoded, bits, method ? 2 : 1);
    cb(null, res);
  } catch (e) {
    cb(e);
  }
};

const isBufferObject = (obj: BufferObject): obj is BufferObject => {
  const casted = (obj as BufferObject);
  return Buffer.isBuffer(casted.data)
    || (Buffer.isBuffer(casted.data) && (casted.ext && casted.ext.length > 0));
};

// eslint-disable-next-line
export const imageHash = (oldSrc: string | BufferObject, bits, method, cb) => {
  const src = oldSrc;

  const getFileType = async (data: Buffer | string) => {
    if (typeof src !== 'string' && isBufferObject(src) && src.ext) {
      return {
        mime: src.ext,
      };
    }
    if (Buffer.isBuffer(data)) {
      return fileType.fromBuffer(data);
    }
    if (typeof src === 'string') {
      return fileType.fromFile(src);
    }
    return '';
  };

  const checkFileType = (name, data: Buffer | string) => {
    getFileType(data).then((type) => {
      // what is the image type
      if (!type) {
        cb(new Error('Mime type not found'));
        return;
      }
      if (name && name.lastIndexOf('.') > 0) {
        const ext = name
          .split('.')
          .pop()
          .toLowerCase();
        if (ext === 'png' && type.mime === 'image/png') {
          processPNG(data, bits, method, cb);
        } else if ((ext === 'jpg' || ext === 'jpeg') && type.mime === 'image/jpeg') {
          processJPG(data, bits, method, cb);
        } else if (ext === 'webp' && type.mime === 'image/webp') {
          processWebp(data, bits, method, cb);
        } else {
          cb(new Error(`Unrecognized file extension, mime type or mismatch, ext: ${ext} / mime: ${type.mime}`));
        }
      } else {
        if (process.env.verbose) console.warn('No file extension found, attempting mime typing.');
        if (type.mime === 'image/png') {
          processPNG(data, bits, method, cb);
        } else if (type.mime === 'image/jpeg') {
          processJPG(data, bits, method, cb);
        } else if (type.mime === 'image/webp') {
          processWebp(data, bits, method, cb);
        } else {
          cb(new Error(`Unrecognized mime type: ${type.mime}`));
        }
      }
    }).catch((err) => {
      cb(err);
    });
  };

  const handleReadFile = (err, res) => {
    if (err) {
      cb(new Error(err));
      return;
    }
    checkFileType(src, res);
  };

  // check source
  // is source assigned
  if (src === undefined) {
    cb(new Error('No image source provided'));
    return;
  }

  if (typeof src !== 'string' && isBufferObject(src)) {
    // image buffers
    checkFileType(src.name, src.data);
  } else {
    // file
    fs.readFile(src, handleReadFile);
  }
};

export const hammingDistance = (hash1:string, hash2:string) => { 
  let distance = 0; 
  for (let i = 0; i < hash1.length; i++) { 
    if (hash1[i] !== hash2[i]) { distance++; } 
  } 
  return distance;
};