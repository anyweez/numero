/* jslint node: true */
'use strict';

/**
 *  // FIXME: simple web page to showcase
 *  // FIXME: % of numbers that can have an equation written for them
 */

var _ = require('lodash');
var debug = false;

function dbg(string) {
    if (debug) console.log('[Debug] ' + string);
}

function leaf(expression) {
    return (typeof expression === 'number');
}

function exp2str(exp, spacing) {
    spacing = spacing || 0;
    var space = new Array(spacing * 2 + 1).join(' ');

    var text = '';
    if (leaf(exp)) {
        text += space + '+ LeafExpression:\n';
        text += space + '  - value: ' + exp + '\n';
    } else {
        if (exp.operation === undefined) {
            dbg('operation undefined');
            dbg(exp);
        }
        text += space + '+ BranchExpression:\n';
        text += space + '  - operation: ';
        text += (exp.operation === null) ? 'null' : exp.operation.symbol;
        text += '\n';

        exp.subexpressions.map(function (subexp) {
            text += exp2str(subexp, spacing + 1);
        });
    }

    return text;
}

module.exports = (function () {
    var operations = [{
            'symbol': '*',
            'precedence': 1,
            'associative': true,
            'op': function (first, second) {
                return first * second;
            },
        }, {
            'symbol': '+',
            'precedence': 3,
            'associative': true,
            'op': function (first, second) {
                return first + second;
            },
        }, {
            'symbol': '-',
            'precedence': 2,
            'associative': false,
            'op': function (first, second) {
                return first - second;
            },
        }, {
            'symbol': '/',
            'precedence': 1,
            'associative': false,
            'op': function (first, second) {
                return first / second;
            },
        }
    ];

    /**
     * Generates all valid subexpressions for the given expression using all operations
     * available in the read-only `operations` array. Note that this function will 
     * return ALL VALID expressions, but there's no solution checking happening here.
     */
    function evaluate(expression) {
        // If the expression is already valid, return it wrapped in a list.
        if (expression.valid()) {
            return [expression];

            // If it's not yet then make steps towards validating. First, check to see whether
            // there are more than two operands available. If so, we need to split this out into
            // two different (recursively evaluated) expressions, one nested inside of the other.
        } else if (expression.subexpressions.length > 2) {
            // We have two options: either we start with the [0,[1,2]] operands or the [[0,1],2].
            // TODO: support the latter option.
            var solo0 = new Expression(expression.subexpressions.slice(1, expression.subexpressions.length));
            //            var solo2 = new Expression();

            // create a list of all possible choices
            // eval each
            // combine all results into a final list and return

            // Get each potential child permutation and add an identical parent object.
            var parents = evaluate(solo0).map(function (child) {
                var parent = new Expression([expression.subexpressions[0]]);
                parent.subexpressions.push(child);

                return parent;
            });

            // Each parent needs to be evaluated, then all results concatenated into a single
            // list as the result.
            return parents.map(function (parent) {
                return evaluate(parent);
            }).reduce(function (prev, current) {
                return prev.concat(current);
            }, []);
        } else if (expression.operation === null) {
            var exps = [];

            for (var i = 0; i < operations.length; i++) {
                var newExp = new Expression(expression.subexpressions);

                newExp.operation = operations[i];
                dbg('--- operation assignment ---');
                dbg('--- before');
                expression.print();
                dbg('--- after');
                newExp.print();
                exps = exps.concat(evaluate(newExp));
            }

            return exps;
        } else {
            return [];
        }
    }

    /**
     * Find a series of expressions that are valid and true.
     */
    Expression.prototype.solve = function () {
        var potentials = this.findSplits();

        // For each potential split point, recursively determine whether
        // there is any combo of operations that'd make the statements true.
        return potentials.map(function (potential) {
            dbg("/-/-/-/ POTENTIAL PATTERN /-/-/-/");
            potential.print();

            var p1 = evaluate(potential.subexpressions[0]);
            var p2 = evaluate(potential.subexpressions[1]);

            var results = [];

            for (var i = 0; i < p1.length; i++) {
                for (var j = 0; j < p2.length; j++) {
                    // Check to see if any of the subexpressions on either side make a 
                    // valid combination. If so, add them to the results list.
                    if (potential.operation.op(p1[i].result(), p2[j].result())) {
                        // Build a new Expression object so that the original object is
                        // not affected.
                        var found = _.cloneDeep(potential);
                        Object.setPrototypeOf(found, Expression.prototype);

                        found.subexpressions = [p1[i], p2[j]];
                        results.push(found);
                    }
                }
            }

            return results;
            // Only keep the ones that are valid.
        }).reduce(function (prev, current) {
            return prev.concat(current);
        }, []);
    };

    /**
     * Finds all possible places where an '=' could potentially be inserted. Note that
     * this currently ignores all existing operators and is designed to be used once
     * at the beginning of the equation-solving operation.
     */
    Expression.prototype.findSplits = function () {
        if (this.subexpressions.length === 1) {
            return [new Expression([this.subexpressions[0]]), []];
        }

        var exps = [];

        for (var i = 1; i < this.subexpressions.length; i++) {
            // TODO: Creating too many extra expressions here.
            var exp = new Expression([
                new Expression(this.subexpressions.slice(0, i)),
                new Expression(this.subexpressions.slice(i, this.subexpressions.length)),
            ]);

            // Add the equal operation.
            exp.operation = {
                'symbol': '=',
                // low precendence since it shouldn't be evaluated until literally everything
                // else is done
                'precedence': 10,
                'op': function (first, second) {
                    return first === second;
                },
            };

            exps.push(exp);
        }

        return exps;
    };

    /**
     * Returns true if the expression is valid; this is always true if the
     * top-level operation is not '='; otherwise, it'll depend on whether the result
     * of each side of the operation is true or not.
     * 
     * An expression is also invalid if it doesn't have an operation defined for each node.
     */
    Expression.prototype.valid = function () {
        dbg('--- validation ---');
        // If there's only a single subexpression with no matching operator.
        if (this.subexpressions.length == 1 && this.operation === null) return true;
        if (this.subexpressions.length > 2) return false;

        if (this.operation !== null) {
            // If we've got a pair of subexpressions and an operator to use to combine them.
            return this.subexpressions.map(function (subexp) {
                if (leaf(subexp)) return true;
                else if (subexp instanceof Expression) {
                    return subexp.valid();
                } else {
                    dbg('--- subexp ---');
                    dbg(subexp);
                    throw Error("Invalid subexpression type encountered during validation.");
                }
            }).reduce(function (prev, current) {
                return prev && current;
            }, true);
        }

        // If the operation is null any time there's more than one operand, it's not a valid
        // expression.
        return false;
    };

    Expression.prototype.result = function () {
        // If it's a leaf node, return the value of the sole subexpression. Base case.
        if (this.operation === null && this.subexpressions.length == 1 && leaf(this.subexpressions[0])) {
            return this.subexpressions[0];
            // If it's a single-child node, return the child.
            // TODO: minimize the count of these...I believe this level of nesting is unnecessary.
        } else if (this.operation === null && this.subexpressions.length == 1) {
            return this.subexpressions[0].result();
        }
        // Otherwise, recursively evaluate all subexpressions.
        else {
            dbg('----- result -----');
            this.print();
            // Currently assumes two operands (0 and 1).
            return this.operation.op(
                leaf(this.subexpressions[0]) ? this.subexpressions[0] : this.subexpressions[0].result(),
                leaf(this.subexpressions[1]) ? this.subexpressions[1] : this.subexpressions[1].result()
            );
        }
    };

    Expression.prototype.print = function (override) {
        if (override) {
            console.log(exp2str(this));
        } else {
            dbg(exp2str(this));
        }
    };

    Expression.prototype.equation = function () {
        var parts = [];

        // Add the first operand
        if (leaf(this.subexpressions[0])) {
            parts.push(this.subexpressions[0]);
        } else {
            if (this.subexpressions[0].operation === null) {
                parts = parts.concat(this.subexpressions[0].equation());
            } else {
                var pprec = this.operation.precedence;
                var cprec = this.subexpressions[0].operation.precedence;
                // If there's a precedence gap, we always need parentheses.
                if (cprec > pprec || (cprec == pprec && !this.operation.associative)) {
                    parts.push('(');
                    parts = parts.concat(this.subexpressions[0].equation());
                    parts.push(')');
                } else {
                    parts = parts.concat(this.subexpressions[0].equation());
                }
            }
        }

        // Add the operation symbol
        if (this.operation !== null) {
            parts.push(this.operation.symbol);

            // Add the second operand iff the operation is defined.
            if (leaf(this.subexpressions[1])) {
                parts.push(this.subexpressions[1]);
            } else {
                if (this.subexpressions[1].operation === null) {
                    parts = parts.concat(this.subexpressions[1].equation());
                } else {
                    var pprec = this.operation.precedence;
                    var cprec = this.subexpressions[1].operation.precedence;
                    // If there's a precedence gap, we always need parentheses.
                    if (cprec > pprec || (cprec == pprec && (!this.operation.associative || !this.subexpressions[1].operation.associative))) {
                        parts.push('(');
                        parts = parts.concat(this.subexpressions[1].equation());
                        parts.push(')');
                    } else {
                        parts = parts.concat(this.subexpressions[1].equation());
                    }
                }
            }
        }

        return parts.join(' ');
    };

    /**
     * Creates a new Expression object with each digit as a distinct subexpression.
     */
    function Expression(elements, options) {
        options = options || {};
        if (!(elements instanceof Array)) {
            throw Error('First argument must provide an array of numbers');
        }

        this.operation = null;
        this.subexpressions = elements.map(function (element) {
            // TODO: doesn't need to be a mapping if there's no transform to apply
            return element;
        });
    }

    /**
     * The public interface is just a wrapper around the Expression constructor. The
     * Expression prototype exposes a few useful methods, the most interesting of them
     * probably being solve().
     */
    return function (num) {
        if (num.toString().length == 1) {
            throw Error("Expressions must contain multiple digits");
        }

        return new Expression(num.toString().split('').map(function (num) {
            return parseInt(num);
        }));
    };
}());