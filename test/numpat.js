/* jslint node: true, mocha: true */
var numpat = require('../numpat');
var expect = require('chai').expect;

var solutionSet = [{
        input: 14481,
        outputs: [
        '1 + 4 + 4 = 8 + 1',
        '1 * 4 + 4 = 8 * 1',
    ],
}, {
        input: 1113,
        outputs: [
        '1 + 1 + 1 = 3',
    ],
}, {
        input: 178,
        outputs: [
        '1 + 7 = 8',
    ],
}, {
        input: 718,
        outputs: [
        '7 + 1 = 8',
    ],
}, {
        input: 716,
        outputs: [
        '7 - 1 = 6',
        '7 = 1 + 6',
    ],
}, {
        input: 824,
        outputs: [
        '8 / 2 = 4',
        '8 = 2 * 4',
    ],
}, {
        input: 3264,
        outputs: [
        '3 = 2 * 6 / 4',
        '3 / 2 = 6 / 4',
    ],
}
];

function displayOutputs(solution) {
    return solution.outputs.map(function (out) {
        return '[' + out + ']';
    }).reduce(function (prev, current) {
        return prev + current + '\t';
    }, '');

}

function solutionExists(solutions, pattern) {
    return solutions.map(function (item) {
        return item.equation();
    }).filter(function (item) {
        return item === pattern;
    }).length > 0;
}

function allSolutionsExist(solutions, patterns) {
    return patterns.map(function (pattern) {
        return solutionExists(solutions, pattern);
    }).reduce(function (prev, current) {
        return prev && current;
    }, true);
}

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
});

describe('test a bunch of number sequences', function () {
    solutionSet.map(function (solution) {
        it([solution.input, '=>', displayOutputs(solution)].join('\t'), function () {
            expect(
                allSolutionsExist(numpat(solution.input).solve(), solution.outputs)
            ).to.be.true;
        });
    });

    numpat(1134).solve().map(function (solution) {
        console.log(solution.equation());
        solution.print(true);
    });
});