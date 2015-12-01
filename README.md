# numpat: equation finder
Numpat is a silly little library that teaches computers how to do something that my brain does involuntarily: finding equations in sequences of digits. The rules are simple:

- Start with two or more digits.
- Insert exactly one equal sign, then one of the four basic arithmetic operators (+, -, *, /) between each digit to build a valid equation.
- Grouping with parentheses is ok, but rearranging digits is not.
- Standard [order of operations](https://en.wikipedia.org/wiki/Order_of_operations#Definition) rules apply.

Examples with input `3264`:

    3 = 2 * ( 6 / 4 )
    3 / 2 = 6 / 4

Examples with input `674518`:

    6 = 7 - ( 4 + 5 - 1 * 8 )
    6 = 7 + 4 / ( 5 - ( 1 + 8 ) )
    6 - 7 = 4 / ( 5 - ( 1 + 8 ) )
    6 + 7 - 4 * 5 = 1 - 8
    6 - ( 7 - ( 4 + 5 ) ) = 1 * 8
    6 - ( 7 - ( 4 + 5 * 1 ) ) = 8
    6 - ( 7 - ( 4 + 5 / 1 ) ) = 8

## Usage
A live demo of the library in action is available at [https://anyweez.github.io/numpat](https://anyweez.github.io/numpat), and the source for the demo is available in this repo.

If you want to use the library in Node, you can 

```js
var numpat = require('numpat')

numpat(674518).solve().map(function(solution) {
    console.log('Equation: ' + solution.equation());
});
```

Note that numpat constructs a tree to represent the equation; the tree can mostly be accessed directly though the API is not intended to be tampered with directly at this point. I'll work on that.