"use strict";
function isNumber(input) {
    if (input.match("[0-9/.]")) {
        return true;
    }
    return false;
}

function mathTokonizer(mathString) {
    const MULTIPLY_TOKEN = "*", PARATHESES_OPEN_TOKEN = "(", PARATHESES_CLOSE_TOKEN = ")", ADDITION_TOKEN = "+", SUBTRACT_TOKEN = "-", EXP_TOKEN = "**", DIVIDE_TOKEN = "/", SPACE_TOKEN = " ";

    let result = [];

    // Used by state machine, cleared when next token is reached
    let tempResult = "";

    // Hold state machine values
    let in_paratheses = false;
    let in_number = false;
    let hasError;
    let skip = 0;
    let splitString = String(mathString).split("");

    // Iterate over characters
    splitString.forEach((character, index, charArr) => {

        // When error is found, skip every element
        if (hasError) {
            return;
        }

        if (skip != 0) {
            skip -= 1;
            return;
        }
        let currentChar = character;
        let previousChar = charArr[index - 1];
        let nextChar = charArr[index + 1];

        // Starts with invalid character
        if (index == 0 && currentChar != PARATHESES_OPEN_TOKEN && !isNumber(currentChar)) {
            result.error = "SynthaxError: calculation must begin with number or parantheses";
            hasError = true;
            return;
        }

        // End of caluclation reached
        if (!nextChar) {
            if (in_number) {
                tempResult += currentChar;
                result.push({ type: "number", "content": tempResult });
                return;
            }
            if (isNumber(currentChar)) {
                result.push({ type: "number", "content": currentChar });
                return;
            }
            if (currentChar != PARATHESES_CLOSE_TOKEN) {
                hasError = true;
                result.error = "SyntaxError: Must end with number or parantheses close";
                return;
            }
        }

        // End of number reached
        if (in_number && !isNumber(currentChar)) {
            in_number = false;
            result.push({ type: "number", "content": tempResult });
            tempResult = "";
        }


        if (in_paratheses) {
            // Close parantheses
            if (currentChar == PARATHESES_CLOSE_TOKEN) {
                in_paratheses = false;
                result.push({ type: "parantheses", content: tempResult });
                tempResult = "";
                return;
            }

            // Parantheses don't end yet
            tempResult += currentChar;
            return;
        }

        if (isNumber(currentChar)) {
            in_number = true;
            tempResult += currentChar;
            return;
        }
        if (currentChar == PARATHESES_OPEN_TOKEN) {
            in_paratheses = true;
            return;
        }

        if (currentChar == MULTIPLY_TOKEN && nextChar == MULTIPLY_TOKEN) {
            skip = 1;
            result.push({ type: "exp" });
            return;
        }
        switch (currentChar) {
            case ADDITION_TOKEN:
                result.push({ type: "add" });
                break;
            case SUBTRACT_TOKEN:
                result.push({ type: "sub", });
                break;
            case MULTIPLY_TOKEN:
                result.push({ type: "multiply" });
                break;
            case DIVIDE_TOKEN:
                result.push({ type: "divide" });
                break;
            case SPACE_TOKEN:
                break;
            default:
                result.error = "ParserError: Invalid character " + currentChar;
                break;
        }
    });
    return result;
};

// State machine PEMDAS math parser; Is currently only part of bash parser
export function mathParser(calcString) {
    let result = mathTokonizer(calcString);
    if (result.error) {
        return result.error;
    }
    // Parse all numbers
    result = result.map(token => {
        if (token.type == "number") {
            token.content = parseFloat(token.content);
        }
        return token;
    });

    // Follows PEMDAS order
    // Parse parentheses, utilizing recursion
    result.forEach(token => {
        if (token.type == "parantheses") {
            token.type = "number";
            token.content = mathParser(token.content)[0]?.content;
        }
    });

    // Generic calculate function
    function calculate(token, calculator) {
        let newResult = [];
        let skip;
        result.forEach((item, index, array) => {
            if (skip) {
                skip = false;
                return;
            }
            if (array[index + 1]?.type == token) {
                return;
            }
            if (item.type == token) {
                skip = true;
                let result = calculator(array[index - 1].content, array[index + 1].content)
                newResult.push({ type: "number", content: result });
                return;
            }
            newResult.push(item);
        })
        result = newResult;
    };
    calculate("exp",(a,b)=>a**b);
    calculate("multiply",(a,b)=>a*b);
    calculate("divide",(a,b)=>a/b);
    calculate("add",(a,b)=>a+b);
    calculate("sub",(a,b)=>a-b);
    return result[0].content;
}