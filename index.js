const PRECISION_LOWER_LIMIT = 0;
const PRECISION_UPPER_LIMIT = 10;

module.exports = {
  compress(series, precision = 3) {
    let lastNum = 0;
    let result = '';

    if(!Array.isArray(series)) {
      throw new Error('Series to compress should be an array');
    }

    if(!(typeof precision === 'number')) {
      throw new Error('Precision should be a number');
    }

    if(precision < PRECISION_LOWER_LIMIT || precision > PRECISION_UPPER_LIMIT) {
      throw new Error(`Precision should be between ${PRECISION_LOWER_LIMIT} and ${PRECISION_UPPER_LIMIT}`);
    }

    series.forEach(val => {
      if(!(typeof val === 'number')) {
        throw new Error('All values of the series should be a number');
      }
    });

    if(series.length === 0) {
      return result;
    }

    // Store precision value at the beginning of the compressed text
    result += String.fromCharCode(precision + 63);

    series.forEach(num => {
      num = Math.round(num * (10**precision));
      let diff = num - lastNum;
      diff = diff < 0 ? -(diff*2)-1 : diff*2;
      while(diff >= 0x20) {
        result += String.fromCharCode((0x20 | (diff & 0x1f)) + 63);
        diff = Math.floor(diff / 32);
      }

      result += String.fromCharCode(diff + 63);
      lastNum = num;
    });

    return result;
  },

  decompress(text) {
    let result = [];
    let index = 0;
    let lastNum = 0;

    if(!(typeof text === 'string')) {
      throw new Error('Text to decompress should be a string');
    }

    if(!text) {
      return result;
    }

    const precision = text.charCodeAt(index) - 63;
    index++;

    if(precision < PRECISION_LOWER_LIMIT || precision > PRECISION_UPPER_LIMIT) {
      throw new Error('Invalid string send to decompress. Please check the string for accuracy.');
    }

    while(index < text.length) {
      [ index, diff ] = decompressNumber(text, index);
      lastNum += diff;
      result.push(lastNum * (10 ** -precision));
    }

    return result;
  }
}

function decompressNumber(text, index) {
    let result = 1;
    let shift = 0;
    let b;

    do {
      b = text.charCodeAt(index) - 63 - 1;
      index += 1;
      result += b << shift;
      shift += 5;
    } while(b >= 0x1f);

    return [index, ((result & 1) === 0) ? (result >> 1) : (~result >> 1)];
}
