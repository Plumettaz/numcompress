
const expect = require('chai').expect;
const { compress, decompress } = require('../index.js');


describe('compress', function() {
  it('should work with an empty series', function() {
    const series = [];
    const text = '';
    expect(compress(series)).to.equal(text);
  });

  it('should work with single int value', function() {
    const series = [12345];
    const text = '?qbW';
    expect(compress(series, 0)).to.equal(text);
  });

  it('should work loosy when enough pression is not specified', function() {
  	const series = [12365.54524354, 14789.54699, 11367.67845123];
    const text = 'BqmvqVck}rCxizoE';
    expect(compress(series)).to.equal(text);
  });

  it('should work looseless when enough pression is specified', function() {
    const series = [12365.54524354, 14789.54673, 11367.67845987];
    const text = 'Io{pcifu|_Folwenp}ak@f~itlgxf}@';
    expect(compress(series, 10)).to.equal(text);
  });

  it('should have a good compression ratio for series of epoch timestamps', function() {
    const series = [ 946684800 ];
    let current = series[0];
    for(let i = 0; i < 10000; i++) {
      current += Math.floor(Math.random() * 600);
      series.push(current);
    }

    const originalSize = JSON.stringify(series).length;
    const text = compress(series, 0);
    const compressedSize = text.length;
    const ratio = ((originalSize - compressedSize) * 100) / originalSize;
    const uncompressedSeries = decompress(text);

    expect(originalSize).to.be.above(compressedSize);
    expect(uncompressedSeries).to.eql(series);
    console.log(`10k timestamps compressed by ${ratio.toFixed(2)}%`);
  });

  it('should have a good compression ratio for float series', function() {
    const series = [ 7825.6709704565865 ];
    let current = series[0];
    for(let i = 0; i < 10000; i++) {
      current += Math.random() * 1000;
      series.push(current);
    }

    const originalSize = JSON.stringify(series).length;
    const text = compress(series);
    const compressedSize = text.length;
    const ratio = ((originalSize - compressedSize) * 100) / originalSize;
    const uncompressedSeries = decompress(text);

    expect(originalSize).to.be.above(compressedSize);
    for(let i = 0; i < uncompressedSeries.length; i++) {
      expect(uncompressedSeries[i]).to.be.closeTo(series[i], 0.0005);
    }
    console.log(`10k float compressed by ${ratio.toFixed(2)}%`);
  });

  it('should throw an exception when the series is undefined or null', function() {
    expect(compress.bind(compress, undefined)).to.throw('Series to compress should be an array');
    expect(compress.bind(compress, null)).to.throw('Series to compress should be an array');
  });

  it('should throw an exception when the series is not an array', function() {
    expect(compress.bind(compress, 1234)).to.throw('Series to compress should be an array');
    expect(compress.bind(compress, 'foo')).to.throw('Series to compress should be an array');
  });

  it('should throw an exception when an element of the series is not a number', function() {
    const series = [12345, 'foo'];
    expect(compress.bind(compress, series)).to.throw('All values of the series should be a number');
  });

  it('should throw an exception when the precision is out of range', function() {
    expect(compress.bind(compress, [], -3)).to.throw('Precision should be between 0 and 10');
    expect(compress.bind(compress, [], 11)).to.throw('Precision should be between 0 and 10');
  });
});

describe('decompress', function() {
  it('should work with an empty series', function() {
    const series = [];
    const text = '';
    expect(decompress(text)).to.eql(series);
  });
  it('should work with single value', function() {
    const series = [12345];
    const text = '?qbW';
    expect(decompress(text)).to.eql(series);
  });
  it('should work loosy when enough pression is not specified', function() {
    const series = [12365.545, 14789.547, 11367.678];
    const text = 'BqmvqVck}rCxizoE';
    expect(decompress(text)).to.eql(series);
  });
  it('should throw an exception when the text is undefined or null', function() {
    expect(decompress.bind(decompress, null)).to.throw('Text to decompress should be a string');
    expect(decompress.bind(decompress, undefined)).to.throw('Text to decompress should be a string');
  });
  it('should throw an exception when the text is not a String', function() {
    expect(decompress.bind(decompress, 1)).to.throw('Text to decompress should be a string');
  });
  it('should throw an exception when the pression can\'t be parsed', function() {
    const text = '^fhfjelr;';
    expect(decompress.bind(decompress, text)).to.throw('Invalid string send to decompress. Please check the string for accuracy.');
  });
});
