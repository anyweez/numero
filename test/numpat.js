/* jslint node: true, mocha: true */
var numpat = require('../numpat');
var expect = require('chai').expect;

describe('test a bunch of number sequences', function () {
    //    it('1237', function () {});
});

describe('#findSplits', function () {
    it('creates one split when len=1', function () {
        try {
            numpat(1);
            expect(true).to.be.equal(false);
        } catch (e) {
            expect(true).to.be.equal(true);
        }
    });

    it('creates one split when len=2', function () {
        var pattern = numpat(11);
        expect(pattern.findSplits()).to.have.length(1);
    });

    it('creates two splits when len=3', function () {
        var pattern = numpat(112);
        expect(pattern.findSplits()).to.have.length(2);
    });

    it('creates three splits when len=4', function () {
        var pattern = numpat(1125);
        expect(pattern.findSplits()).to.have.length(3);
    });
});

describe('#valid', function () {
    it('single-operand side of equation is valid', function () {
        var pattern = numpat(11);
        pattern.solve().map(function (result) {
            expect(result.valid()).to.be.equal(true);
        });

        // There's only one way to balance this equation.
        expect(pattern.solve()).to.have.length(1);
    });

    it.only('[temp] multi-step solving', function () {
        var pattern = numpat(14481);
        pattern.solve().map(function (result) {
            console.log('As equation:', result.equation());
            result.print(true);
            expect(result.valid()).to.be.equal(true);
        });
    });
});