"use strict";

class BrowserPythonRunner {
constructor() {
this.maxActions = 250;
this.maxIterations = 1000;
this.maxFunctionCalls = 100;
this.actions = [];
this.output = [];
this.variables = Object.create(null);
this.functions = Object.create(null);
this.iterations = 0;
this.functionCalls = 0;
}

run(code) {
this.reset();

try {
this.checkForbiddenCode(code);

const lines = this.prepareLines(code);

this.executeBlock(lines, 0, 0);

return {
success: true,
error: null,
errorLine: null,
output: this.output.join("\n"),
actions: [...this.actions]
};

} catch (error) {

const message =
error instanceof Error
? error.message
: String(error);

const lineMatch =
message.match(/Ligne\s+(\d+)/i);

return {
success: false,
error: message,
errorLine:
lineMatch
? Number(lineMatch[1])
: null,
output: this.output.join("\n"),

/*
On conserve les actions comprises avant l'erreur.
Pyt peut donc montrer ce qu'il a réussi à faire.
*/
actions: [...this.actions]
};
}
}

reset() {
this.actions = [];
this.output = [];

this.variables =
Object.create(null);

this.functions =
Object.create(null);

this.iterations = 0;
this.functionCalls = 0;
}

prepareLines(code) {

const rawLines =
String(code)
.replace(/\r/g, "")
.replace(/\t/g, "    ")
.split("\n");

const result = [];

for (
let index = 0;
index < rawLines.length;
index++
) {

const original =
rawLines[index];

const withoutComment =
this.removeComment(original);

if (
withoutComment.trim()
=== ""
) {
continue;
}

const spaces =
withoutComment
.match(/^ */)[0]
.length;

if (
spaces % 4 !== 0
) {
throw new Error(
`Ligne ${index + 1} : utilise 4 espaces pour l'indentation.`
);
}

result.push({
number: index + 1,
indent: spaces,
text: withoutComment.trim()
});
}

return result;
}

removeComment(line) {

let result = "";
let quote = null;

for (
let i = 0;
i < line.length;
i++
) {

const char =
line[i];

if (
(
char === "'"
||
char === '"'
)
&&
line[i - 1] !== "\\"
) {

if (quote === null) {
quote = char;
} else if (
quote === char
) {
quote = null;
}
}

if (
char === "#"
&&
quote === null
) {
break;
}

result += char;
}

return result.replace(
/\s+$/,
""
);
}

executeBlock(
lines,
startIndex,
indent
) {

let index =
startIndex;

while (
index < lines.length
) {

const line =
lines[index];

if (
line.indent < indent
) {
break;
}

if (
line.indent > indent
) {
throw new Error(
`Ligne ${line.number} : indentation inattendue.`
);
}

const text =
line.text;


/* IF */

if (
text.startsWith("if ")
&&
text.endsWith(":")
) {

const result =
this.executeIf(
lines,
index,
indent
);

index =
result.nextIndex;

continue;
}


/* FOR */

if (
text.startsWith("for ")
&&
text.endsWith(":")
) {

index =
this.executeFor(
lines,
index,
indent
);

continue;
}


/* WHILE */

if (
text.startsWith("while ")
&&
text.endsWith(":")
) {

index =
this.executeWhile(
lines,
index,
indent
);

continue;
}


/* DEF */

if (
text.startsWith("def ")
&&
text.endsWith(":")
) {

index =
this.registerFunction(
lines,
index,
indent
);

continue;
}


/* ELSE / ELIF isolé */

if (
text === "else:"
||
text.startsWith("elif ")
) {
break;
}


/* BREAK */

if (text === "break") {

return {
nextIndex:
index + 1,
signal:
"break"
};
}


/* RETURN */

if (
text === "return"
||
text.startsWith("return ")
) {

let value = null;

if (
text !== "return"
) {

value =
this.evaluateExpression(
text.slice(7)
);
}

return {
nextIndex:
index + 1,
signal:
"return",
value
};
}


/* INSTRUCTION SIMPLE */

this.executeStatement(
text,
line.number
);

index++;
}

return {
nextIndex:
index,
signal:
null
};
}

executeIf(
lines,
index,
indent
) {

let cursor =
index;

let executed =
false;

while (
cursor < lines.length
) {

const line =
lines[cursor];

if (
line.indent !== indent
) {
break;
}

let condition = null;

if (
line.text.startsWith("if ")
&&
line.text.endsWith(":")
) {

condition =
line.text.slice(
3,
-1
);

} else if (
line.text.startsWith("elif ")
&&
line.text.endsWith(":")
) {

condition =
line.text.slice(
5,
-1
);

} else if (
line.text === "else:"
) {

condition =
null;

} else {

break;
}

const block =
this.findChildBlock(
lines,
cursor,
indent
);

const shouldRun =
!executed
&&
(
condition === null
||
Boolean(
this.evaluateExpression(
condition
)
)
);

if (shouldRun) {

const result =
this.executeBlock(
lines,
block.start,
block.indent
);

executed = true;

if (
result.signal
) {

return {
nextIndex:
block.end,
signal:
result.signal,
value:
result.value
};
}
}

cursor =
block.end;

if (
cursor >= lines.length
) {
break;
}

const next =
lines[cursor];

if (
next.indent !== indent
) {
break;
}

if (
!next.text.startsWith("elif ")
&&
next.text !== "else:"
) {
break;
}
}

return {
nextIndex:
cursor,
signal:
null
};
}

executeFor(
lines,
index,
indent
) {

const line =
lines[index];

const match =
line.text.match(
/^for\s+([A-Za-z_]\w*)\s+in\s+(.+):$/
);

if (!match) {

throw new Error(
`Ligne ${line.number} : boucle for invalide.`
);
}

const variableName =
match[1];

const iterable =
this.evaluateExpression(
match[2]
);

if (
!Array.isArray(iterable)
) {

throw new Error(
`Ligne ${line.number} : la boucle for attend range(...) ou une liste.`
);
}

const block =
this.findChildBlock(
lines,
index,
indent
);

for (
const value
of iterable
) {

this.countIteration();

this.variables[
variableName
] = value;

const result =
this.executeBlock(
lines,
block.start,
block.indent
);

if (
result.signal
=== "break"
) {
break;
}

if (
result.signal
=== "return"
) {
return block.end;
}
}

return block.end;
}

executeWhile(
lines,
index,
indent
) {

const line =
lines[index];

const condition =
line.text.slice(
6,
-1
);

const block =
this.findChildBlock(
lines,
index,
indent
);

while (
Boolean(
this.evaluateExpression(
condition
)
)
) {

this.countIteration();

const result =
this.executeBlock(
lines,
block.start,
block.indent
);

if (
result.signal
=== "break"
) {
break;
}

if (
result.signal
=== "return"
) {
break;
}
}

return block.end;
}

countIteration() {

this.iterations++;

if (
this.iterations
>
this.maxIterations
) {

throw new Error(
"Boucle arrêtée : trop d'itérations. Vérifie la condition de ta boucle."
);
}
}

registerFunction(
lines,
index,
indent
) {

const line =
lines[index];

const match =
line.text.match(
/^def\s+([A-Za-z_]\w*)\s*\((.*?)\)\s*:$/
);

if (!match) {

throw new Error(
`Ligne ${line.number} : définition de fonction invalide.`
);
}

const name =
match[1];

const parameters =
match[2]
.split(",")
.map(
value =>
value.trim()
)
.filter(Boolean);

for (
const parameter
of parameters
) {

if (
!/^[A-Za-z_]\w*$/
.test(parameter)
) {

throw new Error(
`Ligne ${line.number} : paramètre invalide.`
);
}
}

const block =
this.findChildBlock(
lines,
index,
indent
);

this.functions[name] = {
parameters,
lines,
start:
block.start,
end:
block.end,
indent:
block.indent
};

return block.end;
}

callFunction(
name,
args
) {

const func =
this.functions[name];

if (!func) {

throw new Error(
`Fonction inconnue : ${name}().`
);
}

if (
args.length
!==
func.parameters.length
) {

throw new Error(
`${name}() attend ${func.parameters.length} argument(s).`
);
}

this.functionCalls++;

if (
this.functionCalls
>
this.maxFunctionCalls
) {

throw new Error(
"Trop d'appels de fonctions."
);
}

const savedVariables =
{ ...this.variables };

for (
let i = 0;
i < func.parameters.length;
i++
) {

this.variables[
func.parameters[i]
] = args[i];
}

const functionLines =
func.lines.slice(
0,
func.end
);

const result =
this.executeBlock(
functionLines,
func.start,
func.indent
);

const returnValue =
result.signal
=== "return"
? result.value
: null;

this.variables =
Object.assign(
Object.create(null),
savedVariables
);

return returnValue;
}

findChildBlock(
lines,
parentIndex,
parentIndent
) {

const start =
parentIndex + 1;

if (
start >= lines.length
||
lines[start].indent
<= parentIndent
) {

throw new Error(
`Ligne ${lines[parentIndex].number} : bloc indenté attendu.`
);
}

const childIndent =
lines[start].indent;

let end =
start;

while (
end < lines.length
&&
lines[end].indent
>= childIndent
) {
end++;
}

return {
start,
end,
indent:
childIndent
};
}

executeStatement(
text,
lineNumber
) {

const compound =
text.match(
/^([A-Za-z_]\w*)\s*(\+=|-=|\*=)\s*(.+)$/
);

if (compound) {

const name =
compound[1];

const operator =
compound[2];

const right =
this.evaluateExpression(
compound[3]
);

if (
!(name in this.variables)
) {

throw new Error(
`Ligne ${lineNumber} : variable inconnue "${name}".`
);
}

if (operator === "+=") {

this.variables[name] += right;

} else if (
operator === "-="
) {

this.variables[name] -= right;

} else {

this.variables[name] *= right;
}

return;
}

const assignment =
text.match(
/^([A-Za-z_]\w*)\s*=\s*(?!=)(.+)$/
);

if (assignment) {

this.variables[
assignment[1]
] =
this.evaluateExpression(
assignment[2]
);

return;
}

const appendMatch =
text.match(
/^([A-Za-z_]\w*)\.append\s*\((.*)\)$/
);

if (appendMatch) {

const list =
this.variables[
appendMatch[1]
];

if (
!Array.isArray(list)
) {

throw new Error(
`Ligne ${lineNumber} : append() s'utilise sur une liste.`
);
}

list.push(
this.evaluateExpression(
appendMatch[2]
)
);

return;
}

const call =
this.parseCall(
text
);

if (call) {

const args =
this.parseArguments(
call.arguments
)
.map(
argument =>
this.evaluateExpression(
argument
)
);

this.executeCall(
call.name,
args
);

return;
}

throw new Error(
`Ligne ${lineNumber} : instruction non reconnue : ${text}`
);
}

executeCall(
name,
args
) {

if (
name === "forward"
||
name === "backward"
) {

if (
args.length !== 1
) {

throw new Error(
`${name}() attend une distance.`
);
}

const amount =
Number(args[0]);

if (
!Number.isInteger(amount)
||
amount < 0
) {

throw new Error(
`${name}() attend un entier positif.`
);
}

for (
let i = 0;
i < amount;
i++
) {

this.addAction(
name,
1
);
}

return null;
}

if (
name === "right"
||
name === "left"
) {

if (
args.length !== 1
) {

throw new Error(
`${name}() attend un angle.`
);
}

const angle =
Number(args[0]);

if (
!Number.isInteger(angle)
||
angle < 0
||
angle % 90 !== 0
) {

throw new Error(
"Les rotations doivent utiliser un multiple de 90°."
);
}

const turns =
angle / 90;

for (
let i = 0;
i < turns;
i++
) {

this.addAction(
name,
90
);
}

return null;
}

if (name === "print") {

this.output.push(
args
.map(
value =>
this.pythonString(
value
)
)
.join(" ")
);

return null;
}

if (
this.functions[name]
) {

return this.callFunction(
name,
args
);
}

throw new Error(
`Fonction inconnue : ${name}().`
);
}

addAction(
type,
value
) {

this.actions.push([
type,
value
]);

if (
this.actions.length
>
this.maxActions
) {

throw new Error(
"Ton programme effectue trop d'actions."
);
}
}

evaluateExpression(expression) {

let text =
String(expression)
.trim();

if (!text) {
return null;
}

text =
this.stripOuterParentheses(
text
);

let split =
this.splitTopLevelWord(
text,
"or"
);

if (split) {

return (
Boolean(
this.evaluateExpression(
split.left
)
)
||
Boolean(
this.evaluateExpression(
split.right
)
)
);
}

split =
this.splitTopLevelWord(
text,
"and"
);

if (split) {

return (
Boolean(
this.evaluateExpression(
split.left
)
)
&&
Boolean(
this.evaluateExpression(
split.right
)
)
);
}

if (
text.startsWith("not ")
) {

return !Boolean(
this.evaluateExpression(
text.slice(4)
)
);
}

const comparison =
this.findTopLevelOperator(
text,
[
"==",
"!=",
">=",
"<=",
">",
"<",
" in "
]
);

if (comparison) {

const left =
this.evaluateExpression(
comparison.left
);

const right =
this.evaluateExpression(
comparison.right
);

switch (
comparison.operator
) {

case "==":
return left === right;

case "!=":
return left !== right;

case ">=":
return left >= right;

case "<=":
return left <= right;

case ">":
return left > right;

case "<":
return left < right;

case " in ":

if (
Array.isArray(right)
||
typeof right
=== "string"
) {

return right.includes(
left
);
}

return false;
}
}

const plusMinus =
this.findTopLevelOperatorFromRight(
text,
["+", "-"]
);

if (plusMinus) {

const left =
this.evaluateExpression(
plusMinus.left
);

const right =
this.evaluateExpression(
plusMinus.right
);

if (
plusMinus.operator
=== "+"
) {
return left + right;
}

return left - right;
}

const multiply =
this.findTopLevelOperatorFromRight(
text,
["//", "*", "/", "%"]
);

if (multiply) {

const left =
this.evaluateExpression(
multiply.left
);

const right =
this.evaluateExpression(
multiply.right
);

if (
multiply.operator === "*"
) {
return left * right;
}

if (
right === 0
) {

throw new Error(
"Division par zéro."
);
}

if (
multiply.operator === "/"
) {
return left / right;
}

if (
multiply.operator === "//"
) {

return Math.floor(
left / right
);
}

return left % right;
}

if (
/^-?\d+(\.\d+)?$/
.test(text)
) {
return Number(text);
}

if (text === "True") {
return true;
}

if (text === "False") {
return false;
}

if (text === "None") {
return null;
}

if (
(
text.startsWith('"')
&&
text.endsWith('"')
)
||
(
text.startsWith("'")
&&
text.endsWith("'")
)
) {

return text
.slice(1, -1)
.replace(/\\n/g, "\n")
.replace(/\\"/g, '"')
.replace(/\\'/g, "'");
}

if (
text.startsWith("[")
&&
text.endsWith("]")
) {

const inside =
text.slice(
1,
-1
);

if (
inside.trim() === ""
) {
return [];
}

return this
.parseArguments(
inside
)
.map(
item =>
this.evaluateExpression(
item
)
);
}

const indexMatch =
text.match(
/^([A-Za-z_]\w*)\[(.+)\]$/
);

if (indexMatch) {

const container =
this.variables[
indexMatch[1]
];

if (
!Array.isArray(container)
&&
typeof container
!== "string"
) {

throw new Error(
`${indexMatch[1]} n'est pas indexable.`
);
}

const position =
Number(
this.evaluateExpression(
indexMatch[2]
)
);

return container[
position
];
}

const call =
this.parseCall(
text
);

if (call) {

const args =
this.parseArguments(
call.arguments
)
.map(
argument =>
this.evaluateExpression(
argument
)
);

if (
call.name === "range"
) {

return this.makeRange(
args
);
}

if (
call.name === "len"
) {

if (
args.length !== 1
) {

throw new Error(
"len() attend une valeur."
);
}

return args[0].length;
}

if (
call.name === "int"
) {

if (
args.length !== 1
) {

throw new Error(
"int() attend une valeur."
);
}

const value =
parseInt(
args[0],
10
);

if (
Number.isNaN(value)
) {

throw new Error(
"Conversion int() impossible."
);
}

return value;
}

if (
call.name === "float"
) {

if (
args.length !== 1
) {

throw new Error(
"float() attend une valeur."
);
}

const value =
Number(
args[0]
);

if (
Number.isNaN(value)
) {

throw new Error(
"Conversion float() impossible."
);
}

return value;
}

if (
call.name === "str"
) {

if (
args.length !== 1
) {

throw new Error(
"str() attend une valeur."
);
}

return this.pythonString(
args[0]
);
}

if (
this.functions[
call.name
]
) {

return this.callFunction(
call.name,
args
);
}
}

if (
/^[A-Za-z_]\w*$/
.test(text)
) {

if (
text
in
this.variables
) {

return this.variables[
text
];
}

throw new Error(
`Variable inconnue : ${text}`
);
}

throw new Error(
`Expression non reconnue : ${text}`
);
}

makeRange(args) {

let start;
let stop;
let step;

if (
args.length === 1
) {

start = 0;
stop =
Number(args[0]);
step = 1;

} else if (
args.length === 2
) {

start =
Number(args[0]);

stop =
Number(args[1]);

step = 1;

} else if (
args.length === 3
) {

start =
Number(args[0]);

stop =
Number(args[1]);

step =
Number(args[2]);

} else {

throw new Error(
"range() attend 1, 2 ou 3 arguments."
);
}

if (
!Number.isInteger(start)
||
!Number.isInteger(stop)
||
!Number.isInteger(step)
) {

throw new Error(
"range() utilise des nombres entiers."
);
}

if (step === 0) {

throw new Error(
"Le pas de range() ne peut pas être 0."
);
}

const values = [];

if (step > 0) {

for (
let value = start;
value < stop;
value += step
) {

values.push(
value
);

if (
values.length
>
this.maxIterations
) {

throw new Error(
"range() contient trop de valeurs."
);
}
}

} else {

for (
let value = start;
value > stop;
value += step
) {

values.push(
value
);

if (
values.length
>
this.maxIterations
) {

throw new Error(
"range() contient trop de valeurs."
);
}
}
}

return values;
}

parseCall(text) {

const match =
text.match(
/^([A-Za-z_]\w*)\s*\((.*)\)$/
);

if (!match) {
return null;
}

return {
name:
match[1],

arguments:
match[2]
};
}

parseArguments(text) {

if (
text.trim() === ""
) {
return [];
}

const result = [];

let current = "";
let depth = 0;
let quote = null;

for (
let i = 0;
i < text.length;
i++
) {

const char =
text[i];

if (
(
char === "'"
||
char === '"'
)
&&
text[i - 1] !== "\\"
) {

if (quote === null) {
quote = char;
} else if (
quote === char
) {
quote = null;
}
}

if (
quote === null
) {

if (
char === "("
||
char === "["
) {
depth++;
}

if (
char === ")"
||
char === "]"
) {
depth--;
}

if (
char === ","
&&
depth === 0
) {

result.push(
current.trim()
);

current = "";

continue;
}
}

current += char;
}

if (
current.trim() !== ""
) {

result.push(
current.trim()
);
}

return result;
}

stripOuterParentheses(text) {

while (
text.startsWith("(")
&&
text.endsWith(")")
&&
this.outerParenthesesMatch(
text
)
) {

text =
text
.slice(1, -1)
.trim();
}

return text;
}

outerParenthesesMatch(text) {

let depth = 0;
let quote = null;

for (
let i = 0;
i < text.length;
i++
) {

const char =
text[i];

if (
(
char === "'"
||
char === '"'
)
&&
text[i - 1] !== "\\"
) {

if (quote === null) {
quote = char;
} else if (
quote === char
) {
quote = null;
}
}

if (quote !== null) {
continue;
}

if (char === "(") {
depth++;
}

if (char === ")") {
depth--;
}

if (
depth === 0
&&
i < text.length - 1
) {
return false;
}
}

return depth === 0;
}

splitTopLevelWord(
text,
word
) {

const target =
` ${word} `;

const position =
this.findTopLevelText(
text,
target
);

if (
position === -1
) {
return null;
}

return {
left:
text
.slice(
0,
position
)
.trim(),

right:
text
.slice(
position
+
target.length
)
.trim()
};
}

findTopLevelText(
text,
target
) {

let depth = 0;
let quote = null;

for (
let i = 0;
i <=
text.length
-
target.length;
i++
) {

const char =
text[i];

if (
(
char === "'"
||
char === '"'
)
&&
text[i - 1] !== "\\"
) {

if (quote === null) {
quote = char;
} else if (
quote === char
) {
quote = null;
}
}

if (quote !== null) {
continue;
}

if (
char === "("
||
char === "["
) {
depth++;
}

if (
char === ")"
||
char === "]"
) {
depth--;
}

if (
depth === 0
&&
text.slice(
i,
i + target.length
)
=== target
) {
return i;
}
}

return -1;
}

findTopLevelOperator(
text,
operators
) {

for (
const operator
of operators
) {

const position =
this.findTopLevelText(
text,
operator
);

if (
position !== -1
) {

return {
left:
text
.slice(
0,
position
)
.trim(),

right:
text
.slice(
position
+
operator.length
)
.trim(),

operator
};
}
}

return null;
}

findTopLevelOperatorFromRight(
text,
operators
) {

let depth = 0;
let quote = null;

for (
let i =
text.length - 1;
i >= 0;
i--
) {

const char =
text[i];

if (
(
char === "'"
||
char === '"'
)
&&
text[i - 1] !== "\\"
) {

if (quote === null) {
quote = char;
} else if (
quote === char
) {
quote = null;
}
}

if (quote !== null) {
continue;
}

if (
char === ")"
||
char === "]"
) {

depth++;
continue;
}

if (
char === "("
||
char === "["
) {

depth--;
continue;
}

if (depth !== 0) {
continue;
}

for (
const operator
of operators
) {

const start =
i
-
operator.length
+ 1;

if (start < 0) {
continue;
}

if (
text.slice(
start,
i + 1
)
=== operator
) {

if (
operator === "-"
&&
start === 0
) {
continue;
}

return {
left:
text
.slice(
0,
start
)
.trim(),

right:
text
.slice(
i + 1
)
.trim(),

operator
};
}
}
}

return null;
}

pythonString(value) {

if (value === true) {
return "True";
}

if (value === false) {
return "False";
}

if (value === null) {
return "None";
}

if (
Array.isArray(value)
) {

return (
"["
+
value
.map(
item =>
this.pythonString(
item
)
)
.join(", ")
+
"]"
);
}

return String(value);
}

checkForbiddenCode(code) {

const forbidden = [
/\bimport\b/i,
/\bfrom\s+\w+\s+import\b/i,
/\beval\s*\(/i,
/\bexec\s*\(/i,
/\bopen\s*\(/i,
/__/,
/\bclass\s+/i,
/\bglobal\b/i,
/\bnonlocal\b/i,
/\blambda\b/i,
/\byield\b/i,
/\basync\b/i,
/\bawait\b/i
];

for (
const pattern
of forbidden
) {

if (
pattern.test(code)
) {

throw new Error(
"Cette instruction Python n'est pas disponible dans PYT."
);
}
}
}
}


/* =========================================================
   APPLICATION
========================================================= */

class PytApplication {

constructor() {

this.ui = null;

this.game = null;
this.robot = null;
this.level = null;

this.currentChapter = 1;
this.currentExercise = 1;

this.runner =
new BrowserPythonRunner();

this.musicEnabled = true;
this.musicVolume = 0.6;

this.currentMusic = null;

this.introTimers = [];
this.introFinished = false;

this.settingsReturnTarget =
"menu";
}


/* DÉMARRAGE */

start() {

this.checkDependencies();

this.ui =
new PytUI();

/*
Environ 0,5 seconde par action.
*/
this.ui.actionDelay = 500;

this.connectUI();
this.connectShell();

this.loadAudioSettings();
this.refreshSettingsControls();

if (
!this.loadLevel(
1,
1
)
) {
return;
}

this.hide(
"main-menu"
);

this.hide(
"settings-screen"
);

this.hide(
"game-interface"
);

this.show(
"intro-screen"
);

this.startIntro();
}


/* DÉPENDANCES */

checkDependencies() {

if (
typeof PytUI
!== "function"
) {

throw new Error(
"ui.js n'est pas chargé."
);
}

if (
typeof Robot
!== "function"
) {

throw new Error(
"robot.js n'est pas chargé."
);
}

if (
typeof Game
!== "function"
) {

throw new Error(
"game.js n'est pas chargé."
);
}

if (
typeof getLevel
!== "function"
) {

throw new Error(
"levels.js n'est pas chargé."
);
}
}


/* OUTILS DOM */

el(id) {
return document.getElementById(
id
);
}

hide(id) {

this.el(id)
?.classList
.add("hidden");
}

show(id) {

this.el(id)
?.classList
.remove("hidden");
}


/* =========================================================
   INTRO
========================================================= */

startIntro() {

const screen =
this.el(
"intro-screen"
);

if (!screen) {

this.showMainMenu();
return;
}

this.introFinished =
false;

this.clearIntroTimers();

screen.classList.remove(
"intro-arrive",
"intro-y",
"intro-happy",
"intro-finished"
);

this.playMusic(
"intro"
);


/*
Pyt arrive depuis la droite.
*/

this.introTimers.push(
setTimeout(
() => {

screen.classList.add(
"intro-arrive"
);

},
300
)
);


/*
Pyt se place entre P et T
et lève les bras pour former Y.
*/

this.introTimers.push(
setTimeout(
() => {

screen.classList.add(
"intro-y"
);

},
1500
)
);


/*
Pyt devient content uniquement
avec les yeux.
*/

this.introTimers.push(
setTimeout(
() => {

screen.classList.add(
"intro-happy",
"intro-finished"
);

},
2100
)
);


/*
Puis menu principal.
*/

this.introTimers.push(
setTimeout(
() => {

this.finishIntro();

},
3600
)
);
}

finishIntro() {

if (
this.introFinished
) {
return;
}

this.introFinished =
true;

this.showMainMenu();
}

clearIntroTimers() {

this.introTimers
.forEach(
clearTimeout
);

this.introTimers = [];
}


/* =========================================================
   MENU
========================================================= */

showMainMenu() {

this.clearIntroTimers();

this.hide(
"intro-screen"
);

this.hide(
"settings-screen"
);

this.hide(
"game-interface"
);

this.show(
"main-menu"
);

this.stopMusic();
}

startGame() {

this.hide(
"intro-screen"
);

this.hide(
"main-menu"
);

this.hide(
"settings-screen"
);

this.show(
"game-interface"
);

const courseOpened =
this.ui
.showCourseAtChapterStart(
this.currentChapter
);

if (
courseOpened
) {

this.playMusic(
"theory"
);

} else {

this.ui.showMap();

this.playChapterMusic(
this.currentChapter
);
}
}


/* =========================================================
   SETTINGS
========================================================= */

openSettings(from) {

this.settingsReturnTarget =
from;

this.hide(
"main-menu"
);

if (
from === "game"
) {

this.hide(
"game-interface"
);
}

this.show(
"settings-screen"
);

this.refreshSettingsControls();
}

closeSettings() {

this.hide(
"settings-screen"
);

if (
this.settingsReturnTarget
=== "game"
) {

this.show(
"game-interface"
);

this.playChapterMusic(
this.currentChapter
);

} else {

this.show(
"main-menu"
);
}
}


/* =========================================================
   BOUTONS GÉNÉRAUX
========================================================= */

connectShell() {

this.el(
"skip-intro-button"
)
?.addEventListener(
"click",
() => {

this.finishIntro();

}
);


this.el(
"play-button"
)
?.addEventListener(
"click",
() => {

this.startGame();

}
);


this.el(
"settings-button"
)
?.addEventListener(
"click",
() => {

this.openSettings(
"menu"
);

}
);


this.el(
"game-settings-button"
)
?.addEventListener(
"click",
() => {

this.ui.stopAnimation();

this.openSettings(
"game"
);

}
);


this.el(
"settings-back-button"
)
?.addEventListener(
"click",
() => {

this.closeSettings();

}
);


this.el(
"menu-button"
)
?.addEventListener(
"click",
() => {

this.ui.stopAnimation();

if (
typeof this.ui.closeCodeWindow
=== "function"
) {

this.ui.closeCodeWindow();
}

this.showMainMenu();

}
);


/* MUSIQUE ON / OFF */

const enabled =
this.el(
"music-enabled"
);

const slider =
this.el(
"volume-slider"
);


enabled
?.addEventListener(
"change",
() => {

this.musicEnabled =
enabled.checked;

if (
!this.musicEnabled
) {

this.stopMusic();

} else if (
this.settingsReturnTarget
=== "game"
) {

this.playChapterMusic(
this.currentChapter
);
}

this.saveAudioSettings();

}
);


/* VOLUME */

slider
?.addEventListener(
"input",
() => {

this.musicVolume =
Math.max(
0,
Math.min(
1,
Number(
slider.value
)
/ 100
)
);

this.applyVolume();

this.refreshSettingsControls();

this.saveAudioSettings();

}
);
}


/* =========================================================
   PARAMÈTRES AUDIO
========================================================= */

loadAudioSettings() {

try {

const enabled =
localStorage.getItem(
"pyt-music-enabled"
);

const volume =
localStorage.getItem(
"pyt-music-volume"
);

if (
enabled !== null
) {

this.musicEnabled =
enabled === "true";
}

if (
volume !== null
&&
Number.isFinite(
Number(volume)
)
) {

this.musicVolume =
Math.max(
0,
Math.min(
1,
Number(volume)
)
);
}

} catch (_) {

/*
Le jeu doit fonctionner même si
localStorage est indisponible.
*/

}

this.applyVolume();
}

saveAudioSettings() {

try {

localStorage.setItem(
"pyt-music-enabled",
String(
this.musicEnabled
)
);

localStorage.setItem(
"pyt-music-volume",
String(
this.musicVolume
)
);

} catch (_) {

/*
Aucune erreur de sauvegarde ne
doit bloquer le jeu.
*/

}
}

refreshSettingsControls() {

const enabled =
this.el(
"music-enabled"
);

const slider =
this.el(
"volume-slider"
);

const display =
this.el(
"volume-value"
);

if (enabled) {

enabled.checked =
this.musicEnabled;
}

if (slider) {

slider.value =
String(
Math.round(
this.musicVolume
*
100
)
);
}

if (display) {

display.textContent =
`${Math.round(
this.musicVolume
*
100
)}%`;
}
}


/* =========================================================
   AUDIO
========================================================= */

getAudio(name) {

if (
name === "intro"
) {

return this.el(
"music-intro"
);
}

if (
name === "theory"
) {

return this.el(
"music-theory"
);
}

const match =
String(name)
.match(
/^chapter(\d)$/
);

if (!match) {
return null;
}

return this.el(
`music-chapter-${match[1]}`
);
}

hasAudioSource(audio) {

if (!audio) {
return false;
}

if (
audio.getAttribute(
"src"
)
) {
return true;
}

return [
...audio.querySelectorAll(
"source"
)
].some(
source =>
source.getAttribute(
"src"
)
);
}

async playMusic(name) {

if (
!this.musicEnabled
) {
return;
}

const audio =
this.getAudio(
name
);

/*
Aucun fichier audio ?
Pas grave : le jeu continue.
*/

if (
!this.hasAudioSource(
audio
)
) {
return;
}

if (
this.currentMusic
&&
this.currentMusic
!== audio
) {

try {

this.currentMusic.pause();

} catch (_) {}
}

this.currentMusic =
audio;

audio.volume =
this.musicVolume;

try {

const promise =
audio.play();

if (
promise
&&
typeof promise.catch
=== "function"
) {

await promise.catch(
() => {}
);
}

} catch (_) {

/*
Autoplay bloqué ou fichier absent :
aucun blocage.
*/

}
}

playChapterMusic(chapter) {

this.playMusic(
`chapter${Number(chapter)}`
);
}

stopMusic() {

if (
this.currentMusic
) {

try {

this.currentMusic.pause();

} catch (_) {}

this.currentMusic =
null;
}
}

applyVolume() {

document
.querySelectorAll(
"#audio-container audio"
)
.forEach(
audio => {

audio.volume =
this.musicVolume;

}
);
}


/* =========================================================
   CONNEXION AVEC UI.JS
========================================================= */

connectUI() {

this.ui.onSelectLevel =
(
chapter,
exercise
) => {

if (
this.loadLevel(
chapter,
exercise
)
) {

this.ui.showGame();

this.ui.setStatus(
"Pyt attend ton programme."
);

this.playChapterMusic(
chapter
);
}
};


this.ui.onRestart =
() => {

this.restartLevel();

};


this.ui.onRunCode =
async code => {

await this.runStudentCode(
code
);

};
}


/* =========================================================
   CHARGER UN NIVEAU
========================================================= */

loadLevel(
chapter,
exercise
) {

const newLevel =
getLevel(
chapter,
exercise
);

if (!newLevel) {

if (this.ui) {

this.ui.showMessage(
"Niveau introuvable",
"Impossible de charger cet exercice."
);
}

return false;
}

this.currentChapter =
Number(chapter);

this.currentExercise =
Number(exercise);

this.level =
newLevel;


this.robot =
new Robot();


this.game =
new Game(
this.level,
this.robot
);


this.ui.currentChapter =
this.currentChapter;

this.ui.currentExercise =
this.currentExercise;


this.ui.setGame(
this.game
);


this.ui.setLevel(
this.level
);


this.ui.clearConsole();

this.ui.hideThought?.();

this.ui.drawWorld();

return true;
}


/* =========================================================
   RECOMMENCER
========================================================= */

restartLevel() {

if (
!this.game
) {
return;
}

this.ui.stopAnimation();

this.game.reset();

this.ui.hideThought?.();

this.ui.clearCodeErrorHighlight?.();

this.ui.clearConsole();

this.ui.drawWorld();

this.ui.setStatus(
"Niveau recommencé."
);
}


/* =========================================================
   EXÉCUTER LE CODE DE L'ÉLÈVE
========================================================= */

async runStudentCode(code) {

if (
!this.game
) {
return;
}


/*
Chaque tentative recommence depuis
l'état initial du niveau.
*/

this.game.reset();

this.ui.hideThought?.();

this.ui.clearCodeErrorHighlight?.();

this.ui.drawWorld();

this.ui.setConsole(
"Analyse du programme..."
);


let result;

try {

result =
this.runner.run(
code
);

} catch (error) {

this.ui.setConsole(
"Erreur interne :\n"
+
error.message
);

this.ui.setStatus(
"Le programme n'a pas pu être analysé."
);

this.ui.handleFailedAttempt({
message:
"Je n'arrive pas encore à exécuter ce programme."
});

return;
}


const actions =
Array.isArray(
result?.actions
)
?
result.actions
:
[];


/*
============================================================
ERREUR PYTHON

Les actions valides déjà comprises sont
quand même jouées avant d'afficher l'erreur.
============================================================
*/

if (
!result
||
result.success === false
) {

let message =
result?.error
||
"Programme invalide.";

if (
result?.output
) {

message =
result.output
+
"\n"
+
message;
}

this.ui.setConsole(
message
);


const afterAnimation =
() => {

this.ui.setStatus(
"Corrige ton programme puis réessaie."
);

this.ui.handleFailedAttempt({

line:
result?.errorLine
||
null,

message:
"J'ai exécuté tout ce que j'ai pu comprendre avant l'erreur."

});

};


if (
actions.length > 0
) {

this.ui.playActions(

actions,

action =>
this.performAction(
action
),

afterAnimation

);

} else {

afterAnimation();

}

return;
}


/* SORTIE PRINT */

this.ui.setConsole(
result.output
||
"Programme accepté."
);


/* AUCUNE ACTION */

if (
actions.length === 0
) {

this.finishAttempt(
true,
null
);

return;
}


/* ANIMATION */

this.ui.playActions(

actions,

action =>
this.performAction(
action
),

(
completed,
details
) => {

this.finishAttempt(
completed,
details
);

}

);
}


/* =========================================================
   ACTION DU ROBOT
========================================================= */

performAction(action) {

if (
!this.game
||
!this.robot
) {

return false;
}

let type;
let value;

if (
Array.isArray(action)
) {

type =
action[0];

value =
action.length > 1
?
action[1]
:
1;

} else if (
action
&&
typeof action
=== "object"
) {

type =
action.type
||
action.action;

value =
action.value
??
action.amount
??
1;

} else {

return false;
}

try {

switch (type) {

case "forward":

return this.game
.moveForward();


case "backward":

return this.game
.moveBackward();


case "right":

this.robot
.rotateRight(
Number(value)
||
90
);

return true;


case "left":

this.robot
.rotateLeft(
Number(value)
||
90
);

return true;


default:

console.warn(
"Action inconnue :",
action
);

return false;
}

} catch (error) {

console.error(
error
);

return false;
}
}


/* =========================================================
   COMPRENDRE POURQUOI LA MISSION A ÉCHOUÉ
========================================================= */

getFailureFeedback(
animationCompleted = true
) {

if (
!animationCompleted
) {

return {

thought:
"Oups... mon trajet est bloqué.",

message:
"Mon déplacement s'est arrêté avant la fin. Vérifie les murs et les directions."

};
}


/*
Objet non récupéré.
*/

if (
this.game?.objects?.size > 0
) {

return {

thought:
"J'ai oublié quelque chose...",

message:
"Il reste un objet à récupérer."

};
}


/*
Objet récupéré mais pas déposé.
*/

if (
this.robot?.inventory > 0
&&
this.game?.deposits?.size > 0
) {

return {

thought:
"J'ai encore l'objet avec moi...",

message:
"J'ai récupéré l'objet, mais je ne l'ai pas encore déposé au bon endroit."

};
}


/*
Nettoyage incomplet.
*/

if (
this.game?.dirt?.size > 0
) {

return {

thought:
"Il reste encore quelque chose à faire...",

message:
"Certaines cases doivent encore être nettoyées."

};
}


/*
Mauvaise destination finale.
*/

const goal =
this.level?.goal;

if (
Array.isArray(goal)
&&
(
this.robot?.row !== goal[0]
||
this.robot?.col !== goal[1]
)
) {

return {

thought:
"Ce n’est pas là que je voulais aller...",

message:
"Je ne suis pas arrivé à la bonne destination."

};
}


/*
Message précis du moteur.
*/

if (
this.game?.message
) {

return {

thought:
"La mission n'est pas encore terminée...",

message:
this.game.message

};
}


return {

thought:
"La mission n'est pas encore terminée...",

message:
"Observe le résultat et cherche ce qu'il manque pour terminer l'objectif."

};
}


/* =========================================================
   FIN D'UNE TENTATIVE
========================================================= */

finishAttempt(
animationCompleted = true,
animationDetails = null
) {

if (
!this.game
) {
return;
}

this.ui.drawWorld();


const success =
this.game.checkSuccess();


/* RÉUSSITE */

if (
success
) {

this.ui.hideThought?.();

this.appendConsole(
"✓ Mission réussie !"
);

this.ui.setStatus(
"Mission réussie !"
);

this.ui.completeCurrentLevel();

return;
}


/* ÉCHEC */

const feedback =
this.getFailureFeedback(
animationCompleted
);

this.appendConsole(
"✗ La mission n'est pas encore réussie.\n"
+
feedback.message
);

this.ui.setStatus(
feedback.message
);

this.ui.showThought?.(
feedback.thought
);


/*
Un résultat incorrect ne signifie pas
forcément qu'une ligne Python est fausse.

On n'envoie donc une ligne que si
l'animation peut réellement identifier
l'action concernée.
*/

const action =
animationDetails?.action;

const line =
action
&&
typeof action === "object"
&&
!Array.isArray(action)
?
action.line || null
:
null;


this.ui.handleFailedAttempt({

line,

message:
feedback.message

});
}


/* =========================================================
   CONSOLE
========================================================= */

appendConsole(text) {

const current =
this.ui
.consoleOutput
.textContent
.trim();

if (
!current
||
current === "Prêt."
||
current === "Programme accepté."
||
current === "Analyse du programme..."
) {

this.ui.setConsole(
text
);

return;
}

this.ui.setConsole(
current
+
"\n"
+
text
);
}

}


/* =========================================================
   DÉMARRAGE AUTOMATIQUE
========================================================= */

function startPytApplication() {

try {

const app =
new PytApplication();

app.start();


/*
Disponible dans la console pour les tests.
*/

window.pytApp =
app;


window.runPythonCode =
async function(code) {

return app.runner.run(
code
);

};


console.log(
"PYT démarré."
);

} catch (error) {

console.error(
"Impossible de démarrer PYT :",
error
);

const status =
document.getElementById(
"game-status"
);

if (status) {

status.textContent =
"Erreur au démarrage : "
+
error.message;
}
}
}


if (
document.readyState
=== "loading"
) {

document.addEventListener(
"DOMContentLoaded",
startPytApplication
);

} else {

startPytApplication();
}